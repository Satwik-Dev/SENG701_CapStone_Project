export interface ComponentDifference {
  component_name: string;
  app1_version: string | null;
  app2_version: string | null;
  difference_type: 'version' | 'added' | 'removed' | 'common';
  license_diff: boolean;
  app1_license?: string | null;
  app2_license?: string | null;
}

export interface ComparisonSummary {
  total_common: number;
  total_unique_app1: number;
  total_unique_app2: number;
  total_version_differences: number;
  similarity_percentage: number;
  license_differences: number;
}

export interface CommonComponent {
  name: string;
  version: string;
  type: string;
  license?: string;
}

export interface ComparisonResult {
  comparison_id: string;
  app1_id: string;
  app1_name: string;
  app1_platform: string;
  app1_component_count: number;
  app2_id: string;
  app2_name: string;
  app2_platform: string;
  app2_component_count: number;
  summary: ComparisonSummary;
  differences: ComponentDifference[];
  common_components: CommonComponent[];
  created_at: string;
}

export interface ComparisonRequest {
  app1_id: string;
  app2_id: string;
}