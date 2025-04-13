import React, { useEffect, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import './CrawlHistory.css';

interface CrawlResult {
  id: number;
  url: string;
  title: string | null;
  content: string | null;
  links: string[];
  status: string;
  created_at: string;
  updated_at: string;
  max_depth: number;
  max_urls: number;
  error_message: string | null;
}

const CrawlHistory: React.FC = () => {
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CrawlResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleOpen = (result: CrawlResult) => {
    setSelectedResult(result);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedResult(null);
  };

  const fetchCrawlResults = async () => {
    try {
      setLoading(true);
      const response = await api.get('/crawl');
      setCrawlResults(response.data.items);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crawl results:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrawlResults();
    const interval = setInterval(fetchCrawlResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-in-progress';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h1 className="history-title">Crawl History</h1>
        <p className="history-subtitle">View and manage your web crawl results</p>
      </div>
      
      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>URL</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {crawlResults.map((result) => (
                <tr key={result.id}>
                  <td>{result.id}</td>
                  <td className="url-cell">{result.url}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(result.status)}`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="datetime-cell">
                    {formatDate(result.created_at)}
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpen(result)}
                      className="action-button view-button"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOpen && selectedResult && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Crawl Details</h3>
              <button className="close-button" onClick={handleClose}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="details-section">
                <h4 className="details-title">General Information</h4>
                <div className="details-item">
                  <span className="details-label">URL:</span>
                  <a href={selectedResult.url} target="_blank" rel="noopener noreferrer" className="details-value url-link">
                    {selectedResult.url}
                  </a>
                </div>

                <div className="details-item">
                  <span className="details-label">Status:</span>
                  <span className={`status-badge ${getStatusClass(selectedResult.status)}`}>
                    {selectedResult.status}
                  </span>
                </div>

                <div className="details-item">
                  <span className="details-label">Maximum Depth:</span>
                  <span className="details-value">{selectedResult.max_depth}</span>
                </div>

                <div className="details-item">
                  <span className="details-label">Maximum URLs:</span>
                  <span className="details-value">{selectedResult.max_urls}</span>
                </div>

                <div className="details-item">
                  <span className="details-label">Created:</span>
                  <span className="details-value">{formatDate(selectedResult.created_at)}</span>
                </div>

                <div className="details-item">
                  <span className="details-label">Updated:</span>
                  <span className="details-value">{formatDate(selectedResult.updated_at)}</span>
                </div>
              </div>

              <div className="details-section">
                <h4 className="details-title">Page Information</h4>
                <div className="details-item">
                  <span className="details-label">Title:</span>
                  <span className="details-value">{selectedResult.title || 'No title found'}</span>
                </div>
              </div>

              <div className="details-section">
                <button
                  className="details-title"
                  onClick={() => {
                    const contentElement = document.getElementById('content-section');
                    if (contentElement) {
                      contentElement.classList.toggle('hidden');
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <ChevronDownIcon style={{ height: '20px', width: '20px', marginRight: '8px' }} />
                  Content Preview
                </button>
                <div id="content-section" className="hidden">
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: '#4b5563', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem' }}>
                    {selectedResult.content || 'No content found'}
                  </pre>
                </div>
              </div>

              <div className="details-section">
                <h4 className="details-title">Found Links ({selectedResult.links.length})</h4>
                {selectedResult.links.length > 0 ? (
                  <div className="links-list">
                    {selectedResult.links.map((link, index) => (
                      <div key={index} className="link-item">
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'none' }}
                        >
                          {link}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No links found</p>
                )}
              </div>

              {selectedResult.error_message && (
                <div className="error-message">
                  {selectedResult.error_message}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={handleClose}
                className="action-button view-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrawlHistory; 