import React, { useEffect, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

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
      const response = await fetch('http://localhost:5000/crawl');
      const data = await response.json();
      setCrawlResults(data.items);
    } catch (error) {
      console.error('Error fetching crawl results:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Crawl History</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {crawlResults.map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="max-w-xs truncate text-sm text-gray-900">{result.url}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(result.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleOpen(result)}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isOpen && selectedResult && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Crawl Details</h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">URL</h4>
                  <a href={selectedResult.url} target="_blank" rel="noopener noreferrer" 
                     className="text-primary-600 hover:text-primary-900">
                    {selectedResult.url}
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedResult.status)}`}>
                      {selectedResult.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Maximum Depth</h4>
                    <p className="mt-1">{selectedResult.max_depth}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Maximum URLs</h4>
                    <p className="mt-1">{selectedResult.max_urls}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Title</h4>
                  <p className="mt-1">{selectedResult.title || 'No title found'}</p>
                </div>

                <div>
                  <button
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900"
                    onClick={() => {
                      const contentElement = document.getElementById('content-section');
                      if (contentElement) {
                        contentElement.classList.toggle('hidden');
                      }
                    }}
                  >
                    <ChevronDownIcon className="h-5 w-5 mr-1" />
                    Content
                  </button>
                  <div id="content-section" className="hidden mt-2">
                    <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
                      {selectedResult.content || 'No content found'}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Found Links ({selectedResult.links.length})</h4>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {selectedResult.links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary-600 hover:text-primary-900 text-sm py-1"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={handleClose}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrawlHistory; 