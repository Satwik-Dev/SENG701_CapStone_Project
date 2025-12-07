import api from './api';

// Types
export interface GroupedStat {
  name: string;
  count: number;
  total_components: number;
}

export interface ComponentStat {
  name: string;
  count: number;
}

export interface StatsOverview {
  total_applications: number;
  total_completed: number;
  total_components: number;
  avg_components_per_app: number;
  by_category: GroupedStat[];
  by_operating_system: GroupedStat[];
  by_supplier: GroupedStat[];
  by_manufacturer: GroupedStat[];
  by_platform: GroupedStat[];
  by_binary_type: GroupedStat[];
  by_status: GroupedStat[];
}

export interface ComponentTypeStats {
  by_type: ComponentStat[];
  by_license: ComponentStat[];
  by_language: ComponentStat[];
  total_components: number;
}

export interface TimelineData {
  date: string;
  applications: number;
  components: number;
}

export interface TimelineStats {
  timeline: TimelineData[];
  total_days: number;
  total_applications: number;
  total_components: number;
}

export interface GroupedStatsResponse {
  group_field: string;
  filter_value: string | null;
  total_applications: number;
  total_components: number;
  groups: GroupedStat[];
  applications: any[];
}

// Stats Service
export const statsService = {
  // Get comprehensive overview
  async getOverview(): Promise<StatsOverview> {
    const response = await api.get('/stats/overview');
    return response.data;
  },

  // Get stats by category
  async getByCategory(category?: string): Promise<GroupedStatsResponse> {
    const response = await api.get('/stats/by-category', {
      params: category ? { category } : {}
    });
    return response.data;
  },

  // Get stats by operating system
  async getByOS(os?: string): Promise<GroupedStatsResponse> {
    const response = await api.get('/stats/by-os', {
      params: os ? { os } : {}
    });
    return response.data;
  },

  // Get stats by supplier
  async getBySupplier(supplier?: string): Promise<GroupedStatsResponse> {
    const response = await api.get('/stats/by-supplier', {
      params: supplier ? { supplier } : {}
    });
    return response.data;
  },

  // Get stats by manufacturer
  async getByManufacturer(manufacturer?: string): Promise<GroupedStatsResponse> {
    const response = await api.get('/stats/by-manufacturer', {
      params: manufacturer ? { manufacturer } : {}
    });
    return response.data;
  },

  // Get component type distribution
  async getComponentTypes(): Promise<ComponentTypeStats> {
    const response = await api.get('/stats/component-types');
    return response.data;
  },

  // Get timeline data
  async getTimeline(days: number = 30): Promise<TimelineStats> {
    const response = await api.get('/stats/timeline', {
      params: { days }
    });
    return response.data;
  }
};