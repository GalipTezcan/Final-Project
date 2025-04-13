export interface CrawlResponse {
  domain: string;
  urls: string[];
  backend_similarity: {
    http_headers: number;
    api_patterns: number;
    url_structure: number;
    cookie_patterns: number;
  };
}

export interface CrawlRequest {
  url: string;
  max_depth?: number;
  max_urls?: number;
}

export interface LabelRequest {
  domain: string;
  url: string;
  label: string;
  category: string;
}

export interface UrlGroup {
  urls: string[];
  label: string;
  category: string;
}

export type LabelType = 
  | 'Same-Backend'
  | 'Different-Backend'
  | 'Same-API-Structure'
  | 'Different-API-Structure'
  | 'Same-Frontend'
  | 'Different-Frontend'
  | 'Same-Content'
  | 'Different-Content';

export type CategoryType = 
  | 'Backend-Framework'
  | 'Frontend-Framework'
  | 'Content-Type'
  | 'Other'; 