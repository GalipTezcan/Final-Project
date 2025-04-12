import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Temel Flask ayarları
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///crawler.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Crawler ayarları
    CRAWLER_MAX_DEPTH = int(os.getenv('CRAWLER_MAX_DEPTH', 3))
    CRAWLER_MAX_URLS = int(os.getenv('CRAWLER_MAX_URLS', 50))
    CRAWLER_TIMEOUT = int(os.getenv('CRAWLER_TIMEOUT', 30))
    
    # Redis ayarları (asenkron işlemler için)
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Celery ayarları
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL
    
    # API ayarları
    API_PREFIX = '/api/v1'
    API_TITLE = 'Web Crawler API'
    API_VERSION = '1.0.0'
    
    # CORS ayarları
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Loglama ayarları
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s' 