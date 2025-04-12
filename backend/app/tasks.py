from celery import Celery
from app.services.crawler_service import CrawlerService
from app.config import Config

celery = Celery(
    'app',
    broker=Config.REDIS_URL,
    backend=Config.REDIS_URL
)

@celery.task
def crawl_task(url: str, crawl_id: int, max_depth: int = None, max_urls: int = None):
    # Import create_app inside the task to avoid circular imports
    from app import create_app
    
    app = create_app()
    with app.app_context():
        config = Config()
        crawler = CrawlerService(
            max_depth=max_depth or config.CRAWLER_MAX_DEPTH,
            max_urls=max_urls or config.CRAWLER_MAX_URLS,
            timeout=config.CRAWLER_TIMEOUT
        )
        crawler.start_crawl(url, crawl_id) 