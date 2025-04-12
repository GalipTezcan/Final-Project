from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_restful import Api
from flask_migrate import Migrate
import logging
from app.config import Config

# Veritabanı ve migration nesnelerini oluştur
db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Loglama ayarları
    logging.basicConfig(
        level=app.config['LOG_LEVEL'],
        format=app.config['LOG_FORMAT']
    )
    
    # Basit CORS ayarı - detaylı ayarlar Nginx'te yapılıyor
    CORS(app)
    
    # Veritabanı ve migration başlatma
    db.init_app(app)
    migrate.init_app(app, db)
    
    # API başlatma
    api = Api(app)
    
    # Blueprint'leri kaydet
    from app.routes import crawler_routes
    app.register_blueprint(crawler_routes.bp)
    
    # Shell context ekle
    @app.shell_context_processor
    def make_shell_context():
        return {
            'db': db,
            'CrawlResult': app.models.crawl_result.CrawlResult
        }
    
    return app 