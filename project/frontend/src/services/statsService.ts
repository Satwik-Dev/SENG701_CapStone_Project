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
  by_binary_type: GroupedStat[];
  by_operating_system: GroupedStat[];
  by_supplier: GroupedStat[];
  by_manufacturer: GroupedStat[];
  by_platform: GroupedStat[];
  by_status: GroupedStat[];
}

export interface ComponentTypeStats {
  by_type: ComponentStat[];
  by_license: ComponentStat[];
  by_language: ComponentStat[];
  total_components: number;
}

// Stats Service
export const statsService = {
  // Get comprehensive overview
  async getOverview(): Promise<StatsOverview> {
    const response = await api.get('/stats/overview');
    return response.data;
  },

  // Get component type distribution
  async getComponentTypes(): Promise<ComponentTypeStats> {
    const response = await api.get('/stats/component-types');
    return response.data;
  }
};