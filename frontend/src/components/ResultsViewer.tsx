import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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

  const { data: results, isLoading, error } = useQuery<CrawlResult[]>({
    queryKey: ['results', domain],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/results/${domain}`);
      return response.data;
    },
  });

  // Fetch available domains for comparison
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        // This endpoint needs to be implemented in the backend
        const response = await axios.get('http://localhost:5000/domains');
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
  }, [domain]);

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
      const response = await axios.post('http://localhost:5000/compare', {
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
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Results Viewer</h1>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">Error loading results.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results?.map((result, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-2">{result.url}</h2>
                <p className="text-gray-600">HTML Tags: {result.metrics.htmltags}</p>
                <p className="text-gray-600">JavaScript: {result.metrics.javascript}</p>
                <p className="text-gray-600">Meta: {result.metrics.meta}</p>
                <p className="text-gray-600">Performance: {result.metrics.performance}</p>
                <p className="text-gray-600">Headers: {result.metrics.headers}</p>
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={() => handleUrlSelect(result.url)}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsViewer; 