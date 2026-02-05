import apiClient from './api.service';
import { Style, BOMItem, RoutingStep, StyleStatus, BOMItemType } from '../../types';

export interface CreateStyleData {
  code: string;
  name: string;
  description?: string;
  quantity?: number;
  initialPrice?: number;
  season?: string;
  buyer?: string;
}

export interface UpdateStyleData {
  name?: string;
  description?: string;
}

export interface AddBOMItemData {
  materialId: string;
  quantity: number;
  wasteRate: number;
  type?: BOMItemType;
  variant?: {
    size?: string;
    color?: string;
  };
}

export interface UpdateBOMItemData {
  quantity?: number;
  wasteRate?: number;
  type?: BOMItemType;
  variant?: {
    size?: string;
    color?: string;
  };
}

export interface AddRoutingStepData {
  operation: string;
  minutes: number;
  laborRate: number;
}

export interface UpdateRoutingStepData {
  operation?: string;
  minutes?: number;
  laborRate?: number;
}

export interface ReorderRoutingData {
  stepIds: string[];
}

export interface ExportStylesOptions {
  status?: StyleStatus[];
  styleIds?: string[];
  includeBOM?: boolean;
  includeRouting?: boolean;
  includeCostEstimation?: boolean;
  exportAll?: boolean;
}

export const styleService = {
  async createStyle(data: CreateStyleData): Promise<Style> {
    const response = await apiClient.post('/styles', data);
    return response.data;
  },

  async getStyles(status?: StyleStatus): Promise<Style[]> {
    const params = status ? { status } : {};
    const response = await apiClient.get('/styles', { params });
    return response.data;
  },

  async getStyleById(id: string): Promise<Style> {
    const response = await apiClient.get(`/styles/${id}`);
    return response.data;
  },

  async updateStyle(id: string, data: UpdateStyleData): Promise<Style> {
    const response = await apiClient.patch(`/styles/${id}`, data);
    return response.data;
  },

  async uploadStyleImage(id: string, file: File): Promise<Style> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/styles/${id}/upload-image`, formData);
    return response.data;
  },

  async addBOMItem(styleId: string, data: AddBOMItemData): Promise<Style> {
    const response = await apiClient.post(`/styles/${styleId}/bom`, data);
    return response.data;
  },

  async updateBOMItem(styleId: string, bomId: string, data: UpdateBOMItemData): Promise<Style> {
    const response = await apiClient.patch(`/styles/${styleId}/bom/${bomId}`, data);
    return response.data;
  },

  async deleteBOMItem(styleId: string, bomId: string): Promise<Style> {
    const response = await apiClient.delete(`/styles/${styleId}/bom/${bomId}`);
    return response.data;
  },

  async addRoutingStep(styleId: string, data: AddRoutingStepData): Promise<Style> {
    const response = await apiClient.post(`/styles/${styleId}/routing`, data);
    return response.data;
  },

  async updateRoutingStep(styleId: string, stepId: string, data: UpdateRoutingStepData): Promise<Style> {
    const response = await apiClient.patch(`/styles/${styleId}/routing/${stepId}`, data);
    return response.data;
  },

  async deleteRoutingStep(styleId: string, stepId: string): Promise<Style> {
    const response = await apiClient.delete(`/styles/${styleId}/routing/${stepId}`);
    return response.data;
  },

  async reorderRouting(styleId: string, data: ReorderRoutingData): Promise<Style> {
    const response = await apiClient.post(`/styles/${styleId}/reorder-routing`, data);
    return response.data;
  },

  async sendToAccounting(styleId: string): Promise<Style> {
    const response = await apiClient.post(`/styles/${styleId}/send-to-accounting`);
    return response.data;
  },

  async saveDraft(styleId: string): Promise<Style> {
    const response = await apiClient.post(`/styles/${styleId}/save-draft`);
    return response.data;
  },

  async deleteStyle(styleId: string): Promise<void> {
    await apiClient.delete(`/styles/${styleId}`);
  },

  async createCostEstimation(styleId: string, data: {
    estimatedMaterialCost?: number;
    estimatedLaborCost?: number;
    profitMargin?: number;
    finalPrice?: number;
    adjustedBOM?: AddBOMItemData[];
    adjustedRouting?: AddRoutingStepData[];
    notes?: string;
  }): Promise<Style> {
    const response = await apiClient.post(`/styles/${styleId}/cost-estimation`, data);
    return response.data;
  },

  async updateCostEstimation(styleId: string, data: {
    estimatedMaterialCost?: number;
    estimatedLaborCost?: number;
    profitMargin?: number;
    finalPrice?: number;
    adjustedBOM?: AddBOMItemData[];
    adjustedRouting?: AddRoutingStepData[];
    notes?: string;
  }): Promise<Style> {
    const response = await apiClient.patch(`/styles/${styleId}/cost-estimation`, data);
    return response.data;
  },

  async submitCostEstimation(styleId: string): Promise<Style> {
    const response = await apiClient.post(`/styles/${styleId}/submit-cost-estimation`);
    return response.data;
  },

  async approveCostEstimation(styleId: string): Promise<Style> {
    const response = await apiClient.post(`/styles/${styleId}/approve-cost-estimation`);
    return response.data;
  },

  async exportStylesToExcel(options: ExportStylesOptions = {}): Promise<void> {
    // Build query params
    const params: any = {};

    if (options.exportAll) {
      params.exportAll = 'true';
    } else {
      if (options.status && options.status.length > 0) {
        params.status = options.status.join(',');
      }
      if (options.styleIds && options.styleIds.length > 0) {
        params.styleIds = options.styleIds.join(',');
      }
    }

    if (options.includeBOM !== undefined) {
      params.includeBOM = options.includeBOM.toString();
    }
    if (options.includeRouting !== undefined) {
      params.includeRouting = options.includeRouting.toString();
    }
    if (options.includeCostEstimation !== undefined) {
      params.includeCostEstimation = options.includeCostEstimation.toString();
    }

    const response = await apiClient.get('/styles/export/excel', {
      params,
      responseType: 'blob', // QUAN TRỌNG: Phải dùng blob
    });

    // Tạo download link
    const url = window.URL.createObjectURL(new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }));

    const date = new Date().toISOString().split('T')[0];
    const fileName = `Danh_Sach_Mau_${date}.xlsx`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
