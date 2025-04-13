import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { CrawlResponse, CrawlRequest, LabelRequest } from '../utils/types';

// Extend interface to match actual API response for /crawl POST
interface CrawlStartResponse {
  crawl_id: number;
  message: string;
}

export const useCrawler = () => {
  const navigate = useNavigate();

  const crawlMutation = useMutation<CrawlStartResponse, Error, CrawlRequest>({
    mutationFn: async (data) => {
      console.log('API request data:', data);
      try {
        const response = await api.post<CrawlStartResponse>('/crawl', data);
        console.log('API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('API request error:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('Mutation successful, navigating to results');
      // Use the URL from the request instead of domain from response
      navigate(`/results/${encodeURIComponent(variables.url)}`);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });

  const labelMutation = useMutation<void, Error, LabelRequest>({
    mutationFn: async (data) => {
      await api.post('/label', data);
    },
  });

  return {
    crawl: crawlMutation.mutate,
    isCrawling: crawlMutation.isLoading,
    crawlError: crawlMutation.error,
    label: labelMutation.mutate,
    isLabeling: labelMutation.isLoading,
    labelError: labelMutation.error,
  };
};

// Separate hook for getting results
export const useResults = (domain: string) => {
  return useQuery<CrawlResponse, Error>({
    queryKey: ['results', domain],
    queryFn: async () => {
      const response = await api.get<CrawlResponse>(`/results/${domain}`);
      return response.data;
    },
    enabled: !!domain,
  });
}; 