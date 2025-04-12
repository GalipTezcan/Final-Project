import React, { useState, FormEvent } from 'react';
import { QuestionMarkCircleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useCrawler } from '../hooks/useCrawler';

const CrawlForm: React.FC = () => {
  const [url, setUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxUrls, setMaxUrls] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const { crawl, isCrawling, crawlError } = useCrawler();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      new URL(url);
      setError(null);
      crawl({ base_url: url, max_depth: maxDepth, max_url: maxUrls });
    } catch {
      setError('Please enter a valid URL format (e.g., https://example.com)');
    }
  };

  if (isCrawling) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Crawling website...</p>
          <p className="text-sm text-gray-500">This may take a few minutes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Web Crawler
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Enter the URL of the website you want to analyze
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Website URL
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="url"
                  className={`input-field pl-10 ${error || crawlError ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              {(error || crawlError) && (
                <p className="mt-2 text-sm text-red-600">{error || crawlError?.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Depth
                  <QuestionMarkCircleIcon className="inline-block w-4 h-4 ml-1 text-gray-400" />
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-1 text-sm text-gray-500">
                  Current: {maxDepth}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum URLs
                  <QuestionMarkCircleIcon className="inline-block w-4 h-4 ml-1 text-gray-400" />
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={maxUrls}
                  onChange={(e) => setMaxUrls(Number(e.target.value))}
                  className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-1 text-sm text-gray-500">
                  Current: {maxUrls}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCrawling}
              className="w-full btn-primary flex justify-center py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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