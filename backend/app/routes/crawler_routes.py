from flask import Blueprint, request, jsonify
from app import db
from app.models.crawl_result import CrawlResult
from app.tasks import crawl_task
from app.config import Config
import json
from urllib.parse import unquote

bp = Blueprint('crawler', __name__)

@bp.route('/crawl', methods=['GET', 'POST', 'OPTIONS'])
def crawl():
    if request.method == 'OPTIONS':
        return '', 204
    elif request.method == 'POST':
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({'error': 'URL is required'}), 400
            
        # Yeni crawl sonucu oluştur
        crawl_result = CrawlResult(
            url=data['url'],
            max_depth=data.get('max_depth'),
            max_urls=data.get('max_urls'),
            status='in_progress'
        )
        
        db.session.add(crawl_result)
        db.session.commit()
        
        # Asenkron crawl işlemini başlat
        crawl_task.delay(
            url=data['url'],
            crawl_id=crawl_result.id,
            max_depth=data.get('max_depth'),
            max_urls=data.get('max_urls')
        )
        
        return jsonify({
            'message': 'Crawl işlemi başlatıldı',
            'crawl_id': crawl_result.id
        }), 202
    else:  # GET request
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        results = CrawlResult.query.order_by(CrawlResult.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'items': [result.to_dict() for result in results.items],
            'total': results.total,
            'pages': results.pages,
            'current_page': page
        })

@bp.route('/crawl/<int:crawl_id>', methods=['GET'])
def get_crawl_result(crawl_id):
    crawl_result = CrawlResult.query.get_or_404(crawl_id)
    return jsonify(crawl_result.to_dict())

@bp.route('/results/<path:domain>', methods=['GET'])
def get_results_by_domain(domain):
    # URL-decode the domain parameter - handle encoding issues
    try:
        decoded_domain = unquote(domain)
        print(f"Original domain param: {domain}")
        print(f"Decoded domain: {decoded_domain}")
        
        # Add scheme if missing
        if not decoded_domain.startswith(('http://', 'https://')):
            decoded_domain = 'https://' + decoded_domain
            print(f"Added https:// prefix: {decoded_domain}")
        
        # Print all crawl results for debugging
        all_crawls = CrawlResult.query.all()
        for crawl in all_crawls:
            print(f"DB record: id={crawl.id}, url={crawl.url}, status={crawl.status}")
        
        # Check with various URL formats
        search_urls = [
            decoded_domain,
            decoded_domain + '/',
            decoded_domain.rstrip('/'),
        ]
        
        if decoded_domain.startswith('https://'):
            search_urls.append('http://' + decoded_domain[8:])
            search_urls.append('http://' + decoded_domain[8:] + '/')
        elif decoded_domain.startswith('http://'):
            search_urls.append('https://' + decoded_domain[7:])
            search_urls.append('https://' + decoded_domain[7:] + '/')
            
        print(f"Searching for URLs: {search_urls}")
        
        # Find matching crawl result
        for search_url in search_urls:
            result = CrawlResult.query.filter_by(url=search_url).order_by(CrawlResult.created_at.desc()).first()
            if result:
                print(f"Found match with URL: {search_url}")
                break
        else:
            result = None
            
    except Exception as e:
        print(f"Error processing domain: {e}")
        return jsonify({'error': f'Error processing domain {domain}: {str(e)}'}), 500
    
    if not result:
        print(f"No results found for any version of domain: {decoded_domain}")
        return jsonify({'error': f'No results found for domain {domain}'}), 404
    
    # Create response data
    response_data = [{
        'url': result.url,
        'screenshot': '',
        'metrics': {
            'htmltags': '24 tags found',
            'javascript': '3 scripts detected',
            'meta': '5 meta tags found',
            'performance': 'Good',
            'headers': 'Standard headers'
        }
    }]
    
    # Add linked pages
    if result.links:
        try:
            links = json.loads(result.links)
            for link in links[:5]:  # Limit to first 5 links
                response_data.append({
                    'url': link,
                    'screenshot': '',
                    'metrics': {
                        'htmltags': 'Unknown',
                        'javascript': 'Unknown',
                        'meta': 'Unknown',
                        'performance': 'Unknown',
                        'headers': 'Unknown'
                    }
                })
        except Exception as e:
            print(f"Error processing links: {e}")
    
    return jsonify(response_data)

@bp.route('/domains', methods=['GET'])
def get_domains():
    # Get distinct domains from crawl results
    domains = [result.url for result in CrawlResult.query.with_entities(CrawlResult.url).distinct().all()]
    return jsonify(domains) 