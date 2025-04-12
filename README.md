# Web Crawler and Data Labeling for AI Training

**Project Goal:** This project aims to build a system for generating labeled datasets suitable for training AI models, specifically focusing on backend similarity checks.

**Functionality:** It consists of a web crawler (backend) to gather URLs and extract content, and a frontend application designed for users to label this data (though currently facing some development hurdles). The system leverages a Flask backend, Celery for asynchronous crawling tasks, PostgreSQL for data storage, and Redis as a message broker. The ultimate goal is to create a robust pipeline for collecting and labeling web data relevant to similarity analysis.

## Project Structure

```
Final-Project/
├── backend/            # Flask backend application
│   ├── app/            # Main application code
│   ├── migrations/     # Database migrations
│   ├── Dockerfile      # Dockerfile for the backend
│   ├── entrypoint.sh   # Entrypoint script for Docker
│   └── requirements.txt # Python dependencies
├── frontend/           # React frontend application
│   ├── public/         # Public assets
│   ├── src/            # Source code
│   ├── Dockerfile      # Dockerfile for the frontend
│   ├── nginx.conf      # Nginx configuration
│   ├── package.json    # Node.js dependencies
│   └── ...
├── .git/               # Git repository data
├── .cursorignore       # Cursor AI ignore file
├── docker-compose.yml  # Docker Compose configuration
└── README.md           # This file
```

## Getting Started

### Prerequisites

*   Docker
*   Docker Compose

### Installation and Running

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd Final-Project
    ```

2.  **Build and run the services using Docker Compose**:
    ```bash
    docker-compose up --build -d
    ```
    This command will build the Docker images for the frontend and backend services and start all the necessary containers (frontend, backend, Celery worker, PostgreSQL database, Redis).

3.  **Access the application**:
    *   Frontend: Open your web browser and navigate to `http://localhost`
    *   Backend API: The backend API is accessible at `http://localhost:5000`

### Stopping the Application

To stop the running services, use the following command:

```bash
docker-compose down
```

## Frontend Development Notes

Currently, there are unresolved issues with integrating Tailwind CSS into the Create React App (CRA) setup used in the frontend. Specifically, the build process fails to correctly resolve or process Tailwind CSS dependencies, leading to errors during both local development (`npm start`) and Docker builds.

Several attempts were made to fix this, including:
*   Adjusting PostCSS configuration (`postcss.config.js`).
*   Ensuring compatibility between Tailwind CSS, `react-scripts`, and Node.js versions (including downgrading `react-scripts` and using `NODE_OPTIONS=--openssl-legacy-provider`).
*   Cleaning `node_modules` and reinstalling dependencies.
*   Trying different dependency placements (`dependencies` vs `devDependencies`).

Additionally, WebSocket communication for real-time updates (e.g., crawl progress) is currently experiencing issues and may not function reliably. Further investigation is needed to diagnose and fix the problems related to either the backend task updates broadcasting or the frontend client connection/handling.

As a temporary workaround to proceed with development, Tailwind CSS usage has been paused. Styling will be handled using **pure CSS** (e.g., in `src/index.css` or component-specific CSS files) until the Tailwind integration issues can be properly resolved.

Developers working on the frontend should be aware of this limitation and avoid using Tailwind utility classes for now.

## Services

*   **Frontend**: React application served via Nginx on port 80.
*   **Backend (web)**: Flask application running on port 5000. Handles API requests.
*   **Celery Worker**: Handles asynchronous tasks like web crawling.
*   **Database (db)**: PostgreSQL database storing application data. Accessible on port 5432.
*   **Redis**: Used as a message broker for Celery. Accessible on port 6379.

## API Endpoints

The backend provides the following REST API endpoints:

### `/crawl`

*   **Method:** `POST`
*   **Description:** Initiates a new web crawling task asynchronously.
*   **Request Body (JSON):**
    ```json
    {
      "url": "string (required)",
      "max_depth": "integer (optional)",
      "max_urls": "integer (optional)"
    }
    ```
    *   `url`: The starting URL for the crawl.
    *   `max_depth`: The maximum depth the crawler should traverse (optional).
    *   `max_urls`: The maximum number of unique URLs the crawler should visit (optional).
*   **Success Response (202 Accepted):**
    ```json
    {
      "message": "Crawl işlemi başlatıldı",
      "crawl_id": <integer> 
    }
    ```
*   **Error Response (400 Bad Request):** If the `url` field is missing.
    ```json
    {
      "error": "URL is required"
    }
    ```

*   **Method:** `GET`
*   **Description:** Retrieves a paginated list of past crawl results, ordered by creation date (newest first).
*   **Query Parameters:**
    *   `page` (integer, optional, default: 1): The page number to retrieve.
    *   `per_page` (integer, optional, default: 10): The number of results per page.
*   **Success Response (200 OK):**
    ```json
    {
      "items": [
        {
          "id": <integer>,
          "url": "<string>",
          "max_depth": <integer|null>,
          "max_urls": <integer|null>,
          "status": "<string>", // e.g., "in_progress", "completed", "failed"
          "created_at": "<iso_timestamp>",
          "updated_at": "<iso_timestamp>",
          "results": { ... } // or null if not completed
        },
        // ... other items
      ],
      "total": <integer>,
      "pages": <integer>,
      "current_page": <integer>
    }
    ```

### `/crawl/<int:crawl_id>`

*   **Method:** `GET`
*   **Description:** Retrieves the details and results of a specific crawl task by its ID.
*   **Path Parameters:**
    *   `crawl_id` (integer): The unique ID of the crawl task.
*   **Success Response (200 OK):** Returns the full `CrawlResult` object as JSON (similar structure to items in the GET `/crawl` list, but with potentially more details in `results` if completed).
*   **Error Response (404 Not Found):** If no crawl task with the specified `crawl_id` exists.

## Contributing

Feel free to submit issues and enhancement requests. 