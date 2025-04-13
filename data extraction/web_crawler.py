import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

class WebCrawler:
    def __init__(self, base_url, max_depth,max_url):
        self.base_url = base_url
        self.max_depth = max_depth
        self.visited = set()
        self.max_url=max_url
        self.session = requests.Session()

    def crawl(self, url, depth=0):
        # Stop if the max depth is reached
        if depth > self.max_depth:
            return

        # Avoid re-visiting the same URL
        if url in self.visited:
            return
        self.visited.add(url)

        try:
            print(f"Crawling: {url} at depth {depth}")
            response = self.session.get(url,headers = {"user-agent": 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'http://google.com'})
            response.raise_for_status()  # Raise HTTP errors
        except requests.RequestException as e:
            print(f"Failed to fetch {url}: {e}")
            return

        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract and print the page title as an example
        title = soup.title.string if soup.title else 'No Title'
        print(f"Title: {title}")

        # Find all links on the page
        links = {urljoin(url, link.get('href')) for link in soup.find_all('a', href=True)}
        for link in list(links)[:self.max_url]:
            # Only follow links within the same domain as the base URL
            if link.startswith(self.base_url):
                self.crawl(link, depth + 1)


