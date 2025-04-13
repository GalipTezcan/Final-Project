import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import './Dashboard.css';

interface CrawlResult {
  id: string;
  domain: string;
  status: string;
  start_time: string;
  end_time?: string;
  urls_found: number;
  depth: number;
}

const Dashboard: React.FC = () => {
  const [recentCrawls, setRecentCrawls] = useState<CrawlResult[]>([]);
  const [stats, setStats] = useState({
    totalCrawls: 0,
    activeCrawls: 0,
    domainsAnalyzed: 0,
    averageUrls: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent crawls using the API client
        const response = await api.get('/crawl');
        
        const data = response.data;
        const crawlResults = data.items || [];
        
        // Sort by most recent first
        const sortedResults = [...crawlResults].sort((a, b) => 
          new Date(b.created_at || b.start_time).getTime() - new Date(a.created_at || a.start_time).getTime()
        );
        
        // Take only the 5 most recent
        const recentResults = sortedResults.slice(0, 5);
        setRecentCrawls(recentResults);
        
        // Calculate stats
        const activeCrawls = crawlResults.filter((crawl: CrawlResult) => crawl.status === 'in-progress').length;
        const uniqueDomains = new Set(crawlResults.map((crawl: CrawlResult) => crawl.domain)).size;
        
        const totalUrls = crawlResults.reduce((sum: number, crawl: CrawlResult) => sum + (crawl.urls_found || 0), 0);
        const avgUrls = crawlResults.length > 0 ? Math.round(totalUrls / crawlResults.length) : 0;
        
        setStats({
          totalCrawls: crawlResults.length,
          activeCrawls,
          domainsAnalyzed: uniqueDomains,
          averageUrls: avgUrls
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="dashboard">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Web Crawler Dashboard</h1>
        <p className="dashboard-subtitle">Monitor your web crawling activities and analyze results</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-title">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Total Crawls
          </div>
          <div className="stat-value">{stats.totalCrawls}</div>
          <div className="stat-description">Total crawls performed</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Active Crawls
          </div>
          <div className="stat-value">{stats.activeCrawls}</div>
          <div className="stat-description">Crawls currently in progress</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Domains Analyzed
          </div>
          <div className="stat-value">{stats.domainsAnalyzed}</div>
          <div className="stat-description">Unique domains crawled</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Avg. URLs Found
          </div>
          <div className="stat-value">{stats.averageUrls}</div>
          <div className="stat-description">Average URLs per crawl</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-title">
            <span>Recent Crawls</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {recentCrawls.length > 0 ? (
            recentCrawls.map((crawl) => (
              <div key={crawl.id} className="recent-crawl">
                <div className="crawl-info">
                  <span className="crawl-url">{crawl.domain}</span>
                  <div className="crawl-meta">
                    <span className="crawl-date">{formatDate(crawl.start_time)}</span>
                    <span className={`crawl-status ${getStatusClass(crawl.status)}`}>
                      {crawl.status}
                    </span>
                  </div>
                </div>
                <Link to={`/results/${encodeURIComponent(crawl.domain)}`}>
                  <button className="view-button">View Results</button>
                </Link>
              </div>
            ))
          ) : (
            <p>No recent crawls found.</p>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-title">
            <span>Quick Actions</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start New Crawl
              </button>
            </Link>
            
            <Link to="/history" style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'white',
                color: '#4b5563',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                View Full History
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 