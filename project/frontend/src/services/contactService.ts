import api from './api';

interface ContactFormData {
  category: string;
  subject: string;
  message: string;
}

interface ContactResponse {
  message: string;
  contact_id: string;
}

export const contactService = {
  async sendMessage(data: ContactFormData): Promise<ContactResponse> {
    const response = await api.post<ContactResponse>('/contact/', data);
    return response.data;
  }
};