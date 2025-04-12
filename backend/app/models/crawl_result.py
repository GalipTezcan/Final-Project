from app import db
from datetime import datetime
import json

class CrawlResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(500))
    content = db.Column(db.Text)
    links = db.Column(db.Text)  # JSON string olarak saklanacak
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    max_depth = db.Column(db.Integer)
    max_urls = db.Column(db.Integer)
    status = db.Column(db.String(50))  # 'completed', 'failed', 'in_progress'
    error_message = db.Column(db.Text)
    
    def __repr__(self):
        return f'<CrawlResult {self.url}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'title': self.title,
            'content': self.content,
            'links': json.loads(self.links) if self.links else [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'max_depth': self.max_depth,
            'max_urls': self.max_urls,
            'status': self.status,
            'error_message': self.error_message
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            url=data['url'],
            max_depth=data.get('max_depth'),
            max_urls=data.get('max_urls'),
            status='in_progress'
        ) 