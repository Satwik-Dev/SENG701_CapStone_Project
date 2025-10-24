import api from './api';

export interface UploadResponse {
  message: string;
  application_id: string;
  filename: string;
  file_size: number;
  status: string;
}

export interface UploadStatusResponse {
  id: string;
  name: string;
  status: 'processing' | 'completed' | 'failed';
  error_message?: string;
  component_count?: number;
  analyzed_at?: string;
}

export const uploadService = {
  // Upload file
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Check upload status
  async getUploadStatus(appId: string): Promise<UploadStatusResponse> {
    const response = await api.get<UploadStatusResponse>(
      `/upload/status/${appId}`
    );
    return response.data;
  },
};