import React, { useState, FormEvent } from 'react';
import { GlobeAltIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useCrawler } from '../hooks/useCrawler';
import { useNavigate } from 'react-router-dom';
import './CrawlForm.css';
import { api } from '../utils/api';

const CrawlForm: React.FC = () => {
  const [url, setUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxUrls, setMaxUrls] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { crawl, isCrawling, crawlError } = useCrawler();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    console.log('Form submission started');
    
    if (!url.trim()) {
      setError('Please enter a valid URL');
      console.log('URL is empty');
      return;
    }

    try {
      // Validate URL format
      try {
        new URL(url);
      } catch {
        setError('Please enter a valid URL format (e.g., https://example.com)');
        return;
      }
      
      // Prepare payload
      const payload = { url: url, max_depth: maxDepth, max_urls: maxUrls };
      console.log('Submitting payload:', payload);
      
      // Try both approaches - first React Query
      try {
        setSuccess(`Started crawling ${url}...`);
        crawl(payload);
        // Note: If crawl is successful, useCrawler hook will navigate to results page
      } catch (err) {
        console.error('React Query approach failed:', err);
        
        // If React Query fails, try direct fetch
        try {
          const response = await api.post('/crawl', payload);
          
          const data = response.data;
          console.log('Direct API call successful:', data);
          
          if (data && data.crawl_id) {
            setSuccess(`Successfully started crawling ${url} (ID: ${data.crawl_id})`);
            // Wait a moment before navigating
            setTimeout(() => {
              navigate(`/results/${encodeURIComponent(url)}`);
            }, 1000);
          } else {
            throw new Error('Invalid response from API');
          }
        } catch (fetchErr) {
          console.error('Direct API call also failed:', fetchErr);
          setError('Failed to start crawl. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (isCrawling) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Crawling website...</p>
          <p className="loading-subtext">This may take a few minutes</p>
          {success && <p className="success-message">{success}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="crawl-form-container">
      <div className="form-wrapper">
        <div className="header">
          <GlobeAltIcon className="icon" />
          <h1 className="title">Web Crawler</h1>
          <p className="subtitle">
            Enter the URL of the website you want to analyze
          </p>
        </div>

        <div className="form-card">
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="url" className="form-label">
                Website URL
              </label>
              <div className="input-wrapper">
                <GlobeAltIcon className="input-icon" />
                <input
                  type="text"
                  id="url"
                  className={`text-input ${error || crawlError ? 'error' : ''}`}
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              {(error || crawlError) && (
                <p className="error-message">{error || crawlError?.message}</p>
              )}
            </div>

            <div className="settings-grid">
              <div className="form-group">
                <label className="form-label range-label">
                  Maximum Depth
                  <QuestionMarkCircleIcon className="icon-help" title="How many links deep to crawl from the starting page" />
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="range-input"
                />
                <div className="range-value">
                  Current: {maxDepth}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label range-label">
                  Maximum URLs
                  <QuestionMarkCircleIcon className="icon-help" title="Maximum number of URLs to crawl" />
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={maxUrls}
                  onChange={(e) => setMaxUrls(Number(e.target.value))}
                  className="range-input"
                />
                <div className="range-value">
                  Current: {maxUrls}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCrawling}
              className="submit-button"
            >
              {isCrawling ? 'Crawling...' : 'Start Crawling'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrawlForm; 