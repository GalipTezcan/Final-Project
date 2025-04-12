from flask import Blueprint, request, jsonify
from app import db
from app.models.crawl_result import CrawlResult
from app.tasks import crawl_task
from app.config import Config
import json

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