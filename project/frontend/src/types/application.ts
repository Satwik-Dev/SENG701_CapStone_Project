export interface Application {
  id: string;
  name: string;
  version?: string;
  platform?: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  status: 'processing' | 'completed' | 'failed';
  component_count: number;
  file_size: number;
  created_at: string;
  analyzed_at?: string;
  binary_type?: 'mobile' | 'desktop' | 'server' | 'container' | 'library' | 'unknown';
  os?: string;
  manufacturer?: string;
  supplier?: string;
  sbom_format?: 'cyclonedx' | 'spdx';
  similarity_score?: number;
  match_field?: string;
}

export interface ApplicationDetail extends Application {
  description?: string;
  os?: string;
  supplier?: string;
  manufacturer?: string;
  original_filename: string;
  file_hash?: string;
  sbom_format?: 'spdx' | 'cyclonedx';
  error_message?: string;
  components: Component[];
  sbom_data?: any;
  spdx_data?: any;
}

export interface Component {
  id: string;
  name: string;
  version?: string;
  type?: string;
  language?: string;
  license?: string;
  purl?: string;
  description?: string;
  supplier?: string;
  homepage?: string;
}

export interface PaginatedApplications {
  items: Application[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}