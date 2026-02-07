import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const auth = {
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

// Users (admin only)
export const users = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/users', { params }),
  get: (id: number) => apiClient.get(`/users/${id}`),
  update: (id: number, data: { name?: string; role?: string }) =>
    apiClient.patch(`/users/${id}`, data),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
};

// Contacts
export const contacts = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/contacts', { params }),
  get: (id: number) => apiClient.get(`/contacts/${id}`),
  create: (data: any) => apiClient.post('/contacts', data),
  update: (id: number, data: any) => apiClient.patch(`/contacts/${id}`, data),
  delete: (id: number) => apiClient.delete(`/contacts/${id}`),
};

// Tickets
export const tickets = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get('/tickets', { params }),
  get: (id: number) => apiClient.get(`/tickets/${id}`),
  create: (data: any) => apiClient.post('/tickets', data),
  update: (id: number, data: any) => apiClient.patch(`/tickets/${id}`, data),
  addMessage: (id: number, data: { body: string; is_internal?: boolean }) =>
    apiClient.post(`/tickets/${id}/messages`, data),
  linkRoadmap: (id: number, roadmapItemId: number) =>
    apiClient.post(`/tickets/${id}/roadmap-links`, { roadmap_item_id: roadmapItemId }),
};

// Roadmap
export const roadmap = {
  list: (params?: { page?: number; limit?: number; status?: string; type?: string }) =>
    apiClient.get('/roadmap', { params }),
  get: (id: number) => apiClient.get(`/roadmap/${id}`),
  create: (data: any) => apiClient.post('/roadmap', data),
  update: (id: number, data: any) => apiClient.patch(`/roadmap/${id}`, data),
  vote: (id: number, contactId: number) =>
    apiClient.post(`/roadmap/${id}/vote`, { contact_id: contactId }),
  unvote: (id: number, contactId: number) =>
    apiClient.delete(`/roadmap/${id}/vote`, { data: { contact_id: contactId } }),
};
