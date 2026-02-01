import apiClient from './api.service';
import { Material } from '../../types';

export const materialService = {
  async getMaterials(): Promise<Material[]> {
    const response = await apiClient.get('/materials');
    return response.data;
  },
};
