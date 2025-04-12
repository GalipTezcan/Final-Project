import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { CrawlResponse, CrawlRequest, LabelRequest } from '../utils/types';

export const useCrawler = () => {
  const navigate = useNavigate();

  const crawlMutation = useMutation<CrawlResponse, Error, CrawlRequest>({
    mutationFn: async (data) => {
      const response = await api.post<CrawlResponse>('/crawl', data);
      return response.data;
    },
    onSuccess: (data) => {
      navigate(`/results/${encodeURIComponent(data.domain)}`);
    },
  });

  const labelMutation = useMutation<void, Error, LabelRequest>({
    mutationFn: async (data) => {
      await api.post('/label', data);
    },
  });

  const getResults = (domain: string) => {
    return useQuery<CrawlResponse, Error>({
      queryKey: ['results', domain],
      queryFn: async () => {
        const response = await api.get<CrawlResponse>(`/results/${domain}`);
        return response.data;
      },
      enabled: !!domain,
    });
  };

  return {
    crawl: crawlMutation.mutate,
    isCrawling: crawlMutation.isPending,
    crawlError: crawlMutation.error,
    label: labelMutation.mutate,
    isLabeling: labelMutation.isPending,
    labelError: labelMutation.error,
    getResults,
  };
}; 