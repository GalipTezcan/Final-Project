import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import './ResultsViewer.css';

interface CrawlResult {
  url: string;
  screenshot: string;
  metrics: {
    htmltags: string;
    javascript: string;
    meta: string;
    performance: string;
    headers: string;
  };
  label?: string;
  category?: string;
}

interface UrlLabel {
  url: string;
  label: string;
  similarity?: number;
  category?: string;
}

const ResultsViewer: React.FC = () => {
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [secondDomain, setSecondDomain] = useState<string>('');
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [labelingDialogOpen, setLabelingDialogOpen] = useState(false);
  const [urlLabels, setUrlLabels] = useState<UrlLabel[]>([]);
  const [currentLabel, setCurrentLabel] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [labelOptions, setLabelOptions] = useState<string[]>([
    'Clone', 'Similar', 'Distinct', 'Unrelated', 
    'Same-Backend', 'Different-Backend', 'Same-API-Structure', 'Different-API-Structure'
  ]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    'E-commerce', 'News', 'Blog', 'Corporate', 'Social Media', 'Other',
    'API-Endpoint', 'Authentication', 'Product-Service', 'User-Service',
    'Payment-Service', 'Backend-Framework'
  ]);
  const [showBackendDetails, setShowBackendDetails] = useState(false);

  const { data: results, isLoading, error, refetch } = useQuery<CrawlResult[]>({
    queryKey: ['results', domain],
    queryFn: async () => {
      console.log(`Fetching results for domain: ${domain}`);
      try {
        const response = await api.get(`/results/${domain}`);
        console.log('API response:', response.data);
        return response.data;
      } catch (err) {
        console.error('Error fetching results:', err);
        throw err;
      }
    },
    enabled: !!domain,
    retry: 3,
    refetchInterval: 5000, // Retry every 5 seconds while waiting for results
    refetchOnWindowFocus: true,
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Fetch available domains for comparison
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        // This endpoint needs to be implemented in the backend
        const response = await api.get('/domains');
        if (response.data && Array.isArray(response.data)) {
          // Filter out current domain from list
          setAvailableDomains(response.data.filter(d => d !== domain));
        }
      } catch (error) {
        console.error('Error fetching domains:', error);
        // Fallback with dummy data
        setAvailableDomains(['example.com', 'test.com']);
      }
    };

    fetchDomains();
    
    // Log current domain for debugging
    console.log(`ResultsViewer mounted with domain: ${domain}`);
    
    // Set up an interval to check for results
    const intervalId = setInterval(() => {
      console.log('Refetching results...');
      refetch();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [domain, refetch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUrlSelect = (url: string) => {
    setSelectedUrl(url);
  };

  const handleCompareClick = () => {
    setCompareDialogOpen(true);
  };

  const handleCompareDomains = async () => {
    if (!secondDomain) return;
    
    try {
      // This endpoint needs to be implemented in the backend
      const response = await api.post('/compare', {
        domain1: domain,
        domain2: secondDomain
      });
      
      setComparisonResult(response.data);
      setCompareDialogOpen(false);
      
      // Auto-suggest a frontend similarity label
      let suggestedLabel = 'Unrelated';
      if (response.data.similarity_score > 85) {
        suggestedLabel = 'Clone';
      } else if (response.data.similarity_score > 60) {
        suggestedLabel = 'Similar';
      } else if (response.data.similarity_score > 30) {
        suggestedLabel = 'Distinct';
      }
      
      // Check backend similarity if available
      if (response.data.backend_similarity !== undefined) {
        // If backend similarity is high but domain is different, this is important to flag
        if (response.data.backend_similarity > 75) {
          suggestedLabel = 'Same-Backend';
        } else if (response.data.backend_similarity > 50) {
          // Check if API patterns specifically are similar
          if (response.data.backend_details?.api_patterns_similarity > 70) {
            suggestedLabel = 'Same-API-Structure';
          }
        } else if (response.data.backend_similarity < 30) {
          suggestedLabel = 'Different-Backend';
        }
      }
      
      // Add to urlLabels
      setUrlLabels([...urlLabels, {
        url: secondDomain,
        label: suggestedLabel,
        similarity: response.data.similarity_score / 100,
        category: response.data.backend_similarity > 50 ? 'Backend-Framework' : 'Other'
      }]);
      
      // Switch to comparison tab
      setTabValue(3);
    } catch (error) {
      console.error('Error comparing domains:', error);
      alert('Failed to compare domains. Please try again.');
    }
  };

  const handleLabelClick = (url: string) => {
    setSelectedUrl(url);
    setLabelingDialogOpen(true);
    
    // Check if URL is already labeled and pre-fill
    const existingLabel = urlLabels.find(item => item.url === url);
    if (existingLabel) {
      setCurrentLabel(existingLabel.label || '');
      setCurrentCategory(existingLabel.category || '');
    } else {
      setCurrentLabel('');
      setCurrentCategory('');
    }
  };

  const handleSaveLabel = () => {
    if (!selectedUrl) return;
    
    // Update or add new label
    const updatedLabels = [...urlLabels];
    const existingIndex = updatedLabels.findIndex(item => item.url === selectedUrl);
    
    if (existingIndex >= 0) {
      updatedLabels[existingIndex] = {
        ...updatedLabels[existingIndex],
        label: currentLabel,
        category: currentCategory
      };
    } else {
      updatedLabels.push({
        url: selectedUrl,
        label: currentLabel,
        category: currentCategory
      });
    }
    
    setUrlLabels(updatedLabels);
    setLabelingDialogOpen(false);
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h1 className="results-title">Results for: <span className="domain-name">{domain}</span></h1>
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-message">Loading results...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <strong className="error-title">Error: </strong>
            <span className="error-message">Failed to load results. Please try again.</span>
            <p className="error-details">{(error as Error).message}</p>
            <div className="action-buttons">
              <button 
                onClick={() => refetch()} 
                className="button primary-button"
              >
                Retry
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="button secondary-button"
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : results && results.length > 0 ? (
          <div className="results-grid">
            {results.map((result, index) => (
              <div key={index} className="result-card">
                <h2 className="card-title">{result.url}</h2>
                <div className="metrics-list">
                  <div className="metric-item">
                    <span className="metric-label">HTML Tags:</span>
                    <span className="metric-value">{result.metrics.htmltags}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">JavaScript:</span>
                    <span className="metric-value">{result.metrics.javascript}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Meta Tags:</span>
                    <span className="metric-value">{result.metrics.meta}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Performance:</span>
                    <span className={`metric-value ${result.metrics.performance === 'Good' ? 'good' : 'warning'}`}>
                      {result.metrics.performance}
                    </span>
                  </div>
                </div>
                <div className="card-footer">
                  <button 
                    onClick={() => handleUrlSelect(result.url)} 
                    className="view-details-button"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 16h.01M12 13a1 1 0 110-2 1 1 0 010 2z"></path>
            </svg>
            <h3 className="empty-title">No results found</h3>
            <p className="empty-message">
              We couldn't find any crawl results for {domain}. The crawl might still be in progress.
            </p>
            <p className="empty-submessage">
              Results will automatically appear when they're ready. You can also check the crawl status in the history tab.
            </p>
            <div className="action-buttons">
              <button 
                onClick={() => refetch()} 
                className="button primary-button"
              >
                Refresh
              </button>
              <button 
                onClick={() => navigate('/history')} 
                className="button secondary-button"
              >
                Check History
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="button tertiary-button"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Show selected URL details */}
      {selectedUrl && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">URL Details</h3>
              <button
                onClick={() => setSelectedUrl(null)}
                className="close-button"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <h4 className="url-title">
                <a href={selectedUrl} target="_blank" rel="noopener noreferrer" className="url-link">
                  {selectedUrl}
                </a>
              </h4>
              
              {/* Find the result for this URL */}
              {results && results.map((result, index) => {
                if (result.url === selectedUrl) {
                  return (
                    <div key={index} className="details-content">
                      <div className="details-grid">
                        <div className="detail-item">
                          <h5 className="detail-label">HTML Tags</h5>
                          <p className="detail-value">{result.metrics.htmltags}</p>
                        </div>
                        <div className="detail-item">
                          <h5 className="detail-label">JavaScript</h5>
                          <p className="detail-value">{result.metrics.javascript}</p>
                        </div>
                        <div className="detail-item">
                          <h5 className="detail-label">Meta Tags</h5>
                          <p className="detail-value">{result.metrics.meta}</p>
                        </div>
                        <div className="detail-item">
                          <h5 className="detail-label">Performance</h5>
                          <p className={`detail-value ${result.metrics.performance === 'Good' ? 'good' : 'warning'}`}>
                            {result.metrics.performance}
                          </p>
                        </div>
                      </div>
                      
                      {result.screenshot && (
                        <div className="screenshot-section">
                          <h5 className="screenshot-label">Screenshot</h5>
                          <img 
                            src={result.screenshot} 
                            alt={`Screenshot of ${result.url}`} 
                            className="screenshot"
                          />
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setSelectedUrl(null)}
                className="button tertiary-button"
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

export default ResultsViewer; 