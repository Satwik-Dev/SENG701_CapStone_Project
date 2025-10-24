import api from './api';
import type { 
  Application, 
  ApplicationDetail, 
  PaginatedApplications,
  Component 
} from '../types/application';

export const applicationService = {
  // Get all applications (paginated)
  async getApplications(params: {
    page?: number;
    limit?: number;
    platform?: string;
    status?: string;
  } = {}): Promise<PaginatedApplications> {
    const response = await api.get<PaginatedApplications>('/applications/', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.platform && { platform: params.platform }),
        ...(params.status && { status: params.status }),
      },
    });
    return response.data;
  },

  // Get single application
  async getApplication(id: string): Promise<ApplicationDetail> {
    const response = await api.get<ApplicationDetail>(`/applications/${id}`);
    return response.data;
  },

  // Get application components
  async getApplicationComponents(id: string): Promise<{
    application_id: string;
    components: Component[];
    total_components: number;
  }> {
    const response = await api.get(`/applications/${id}/components`);
    return response.data;
  },

  // Delete application
  async deleteApplication(id: string): Promise<void> {
    await api.delete(`/applications/${id}`);
  },

  // Export SBOM
  async exportSBOM(id: string, format: 'cyclonedx' | 'spdx' = 'cyclonedx'): Promise<any> {
    const response = await api.get(`/applications/${id}/export`, {
      params: { format },
    });
    return response.data;
  },
};