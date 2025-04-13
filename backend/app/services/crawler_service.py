import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
from typing import Set, Dict, List, Optional
import logging
from app.models.crawl_result import CrawlResult
from app import db
import time

logger = logging.getLogger(__name__)

class CrawlerService:
    def __init__(self, max_depth: int = 3, max_urls: int = 50, timeout: int = 30):
        self.max_depth = max_depth
        self.max_urls = max_urls
        self.timeout = timeout
        self.visited_urls: Set[str] = set()
        self.results: Dict[str, Dict] = {}
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def is_valid_url(self, url: str) -> bool:
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc]) and result.scheme in ['http', 'https']
        except:
            return False
            
    def normalize_url(self, url: str) -> str:
        return url.rstrip('/')
        
    def extract_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            absolute_url = urljoin(base_url, href)
            if self.is_valid_url(absolute_url):
                links.append(self.normalize_url(absolute_url))
        return list(set(links))  # Tekrarlanan linkleri kaldır
        
    def extract_content(self, soup: BeautifulSoup) -> str:
        # Script ve style etiketlerini kaldır
        for script in soup(["script", "style"]):
            script.decompose()
            
        # Metni al ve temizle
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
        
    def crawl_page(self, url: str, depth: int = 0) -> Dict:
        if depth > self.max_depth or len(self.visited_urls) >= self.max_urls:
            return {}
            
        url = self.normalize_url(url)
        if url in self.visited_urls:
            return self.results.get(url, {})
            
        try:
            logger.info(f"Crawling {url} at depth {depth}")
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            # Sayfa yükleme hızını kontrol et
            time.sleep(1)  # Rate limiting
            
            soup = BeautifulSoup(response.text, 'html.parser')
            title = soup.title.string if soup.title else ''
            content = self.extract_content(soup)
            links = self.extract_links(soup, url)
            
            result = {
                'url': url,
                'title': title,
                'content': content,
                'links': links,
                'status': 'success',
                'depth': depth
            }
            
            self.visited_urls.add(url)
            self.results[url] = result
            
            if depth < self.max_depth:
                for link in links:
                    if len(self.visited_urls) < self.max_urls:
                        self.crawl_page(link, depth + 1)
                        
            return result
            
        except Exception as e:
            logger.error(f"Error crawling {url}: {str(e)}")
            return {
                'url': url,
                'status': 'error',
                'error': str(e),
                'depth': depth
            }
            
    def start_crawl(self, url: str, crawl_id: int) -> None:
        crawl_result = None
        try:
            crawl_result = CrawlResult.query.get(crawl_id)
            if not crawl_result:
                raise ValueError(f"Crawl result with id {crawl_id} not found")
            
            # Add https:// prefix if the URL doesn't have a scheme
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
                logger.info(f"Added https prefix to URL: {url}")
                # Update the crawl result URL
                crawl_result.url = url
                db.session.commit()
                
            result = self.crawl_page(url)
            
            if result.get('status') == 'error':
                crawl_result.status = 'failed'
                crawl_result.error_message = result.get('error', 'Unknown error')
            else:
                crawl_result.title = result.get('title', '')
                crawl_result.content = result.get('content', '')
                crawl_result.links = json.dumps(result.get('links', []))
                crawl_result.status = 'completed'
            
            db.session.commit()
            
        except Exception as e:
            logger.error(f"Error in crawl task: {str(e)}")
            if crawl_result:
                crawl_result.status = 'failed'
                crawl_result.error_message = str(e)
                db.session.commit() 