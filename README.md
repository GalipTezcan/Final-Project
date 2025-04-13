# Web Crawler and Data Labeling for AI Training

**Project Goal:** This project aims to build a system for generating labeled datasets suitable for training AI models, specifically focusing on backend similarity checks.

**Functionality:** It consists of a web crawler (backend) to gather URLs and extract content, and a frontend application designed for users to label this data (though currently facing some development hurdles). The system leverages a Flask backend, Celery for asynchronous crawling tasks, PostgreSQL for data storage, and Redis as a message broker. The ultimate goal is to create a robust pipeline for collecting and labeling web data relevant to similarity analysis.

## Project Structure

## Tech Stack

### Frontend
- React with TypeScript
- React Router for navigation
- React Query for data fetching
- Pure CSS for styling (no frameworks or preprocessors)
- Heroicons for SVG icons

### Backend
- Flask for API endpoints
- SQLAlchemy for ORM
- Celery for asynchronous tasks
- Redis for task queue
- BeautifulSoup for HTML parsing

## Running the Application

### With Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

### Without Docker
```bash
# Backend (Terminal 1)
cd backend
pip install -r requirements.txt
export FLASK_APP=app
flask run --host=0.0.0.0 --port=5000

# Frontend (Terminal 2)
cd frontend
npm install
REACT_APP_API_URL=http://localhost:5000 npm start
```

## API Endpoints

- `POST /crawl` - Start a new crawl
- `GET /crawl` - Get all crawls (paginated)
- `GET /crawl/:id` - Get a specific crawl by ID
- `GET /results/:domain` - Get results for a specific domain
- `GET /domains` - Get list of all crawled domains

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── __init__.py
│   ├── migrations/
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.tsx
│   └── package.json
└── docker-compose.yml
```

## Development

### Frontend
The frontend uses pure CSS with modular component-specific CSS files for better organization. The styling approach follows modern CSS practices without relying on any CSS frameworks, preprocessors, or utility-class libraries. 