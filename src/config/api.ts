// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  USERS: {
    LIST: `${API_BASE_URL}/users`,
    BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
  MATERIALS: {
    LIST: `${API_BASE_URL}/materials`,
    BY_ID: (id: string) => `${API_BASE_URL}/materials/${id}`,
  },
  STYLES: {
    LIST: `${API_BASE_URL}/styles`,
    BY_ID: (id: string) => `${API_BASE_URL}/styles/${id}`,
    UPLOAD_IMAGE: (id: string) => `${API_BASE_URL}/styles/${id}/upload-image`,
    ADD_BOM: (id: string) => `${API_BASE_URL}/styles/${id}/bom`,
    UPDATE_BOM: (id: string, bomId: string) => `${API_BASE_URL}/styles/${id}/bom/${bomId}`,
    DELETE_BOM: (id: string, bomId: string) => `${API_BASE_URL}/styles/${id}/bom/${bomId}`,
    ADD_ROUTING: (id: string) => `${API_BASE_URL}/styles/${id}/routing`,
    UPDATE_ROUTING: (id: string, stepId: string) => `${API_BASE_URL}/styles/${id}/routing/${stepId}`,
    DELETE_ROUTING: (id: string, stepId: string) => `${API_BASE_URL}/styles/${id}/routing/${stepId}`,
    REORDER_ROUTING: (id: string) => `${API_BASE_URL}/styles/${id}/reorder-routing`,
    SEND_TO_ACCOUNTING: (id: string) => `${API_BASE_URL}/styles/${id}/send-to-accounting`,
    SAVE_DRAFT: (id: string) => `${API_BASE_URL}/styles/${id}/save-draft`,
  },
};
