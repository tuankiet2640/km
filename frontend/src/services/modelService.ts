/**
 * Model management service.
 */

import { api } from './api';

export interface ModelCreateData {
  name: string;
  model_type: string;
  model_name: string;
  provider: string;
  credential: Record<string, any>;
  permission_type?: 'PUBLIC' | 'PRIVATE';
  model_params_form?: any[];
}

export interface ModelTestData {
  prompt?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface Provider {
  provider: string;
  name: string;
  description: string;
  icon?: string;
  supported_model_types: string[];
}

export interface ModelType {
  value: string;
  label: string;
}

export interface ModelInfo {
  name: string;
  label: string;
  description?: string;
}

export interface FormField {
  field: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  attrs?: Record<string, any>;
}

export const modelService = {
  // Get all user's models
  async getModels(modelType?: string) {
    const params = modelType ? { model_type: modelType } : {};
    const response = await api.get('/models', { params });
    return response.data;
  },

  // Get a specific model
  async getModel(modelId: string) {
    const response = await api.get(`/models/${modelId}`);
    return response.data;
  },

  // Create a new model
  async createModel(data: ModelCreateData) {
    const response = await api.post('/models', data);
    return response.data;
  },

  // Update a model
  async updateModel(modelId: string, data: Partial<ModelCreateData>) {
    const response = await api.put(`/models/${modelId}`, data);
    return response.data;
  },

  // Delete a model
  async deleteModel(modelId: string) {
    const response = await api.delete(`/models/${modelId}`);
    return response.data;
  },

  // Test model connection
  async testModel(modelId: string, testData: ModelTestData = {}) {
    const response = await api.post(`/models/${modelId}/test`, testData);
    return response.data;
  },

  // Download model (for Ollama, etc.)
  async downloadModel(modelId: string) {
    const response = await api.post(`/models/${modelId}/download`);
    return response.data;
  },

  // Pause model download
  async pauseModelDownload(modelId: string) {
    const response = await api.put(`/models/${modelId}/pause`);
    return response.data;
  },

  // Get model parameters
  async getModelParams(modelId: string) {
    const response = await api.get(`/models/${modelId}/params`);
    return response.data;
  },

  // Save model parameters
  async saveModelParams(modelId: string, params: any[]) {
    const response = await api.put(`/models/${modelId}/params`, { params });
    return response.data;
  },

  // Provider-related methods
  async getProviders(): Promise<Provider[]> {
    const response = await api.get('/models/providers');
    return response.data;
  },

  async getProviderModelTypes(provider: string): Promise<ModelType[]> {
    const response = await api.get(`/models/providers/${provider}/types`);
    return response.data;
  },

  async getProviderModels(provider: string, modelType: string) {
    const response = await api.get(`/models/providers/${provider}/models`, {
      params: { model_type: modelType }
    });
    return response.data;
  },

  async getModelForm(provider: string, modelType: string, modelName: string): Promise<{ fields: FormField[] }> {
    const response = await api.get(`/models/providers/${provider}/form`, {
      params: { model_type: modelType, model_name: modelName }
    });
    return response.data;
  },

  async getModelDefaultParams(provider: string, modelType: string, modelName: string) {
    const response = await api.get(`/models/providers/${provider}/params`, {
      params: { model_type: modelType, model_name: modelName }
    });
    return response.data;
  }
}; 