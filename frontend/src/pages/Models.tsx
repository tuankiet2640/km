/**
 * Models management page component.
 */

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PlayIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

import { modelService } from '../services/modelService';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ModelCreateForm } from '../components/ModelCreateForm';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface Model {
  id: string;
  name: string;
  status: 'SUCCESS' | 'ERROR' | 'DOWNLOAD' | 'PAUSE_DOWNLOAD';
  model_type: string;
  model_name: string;
  provider: string;
  permission_type: 'PUBLIC' | 'PRIVATE';
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const statusIcons = {
  SUCCESS: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  ERROR: <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />,
  DOWNLOAD: <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />,
  PAUSE_DOWNLOAD: <ClockIcon className="h-5 w-5 text-yellow-500" />
};

const statusLabels = {
  SUCCESS: 'Ready',
  ERROR: 'Error',
  DOWNLOAD: 'Downloading',
  PAUSE_DOWNLOAD: 'Paused'
};

export const Models: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await modelService.getModels();
      setModels(response.models);
    } catch (error) {
      console.error('Failed to load models:', error);
      toast.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async (modelData: any) => {
    try {
      await modelService.createModel(modelData);
      toast.success('Model created successfully');
      setShowCreateModal(false);
      loadModels();
    } catch (error: any) {
      console.error('Failed to create model:', error);
      toast.error(error.response?.data?.detail || 'Failed to create model');
    }
  };

  const handleDeleteModel = async () => {
    if (!selectedModel) return;

    try {
      await modelService.deleteModel(selectedModel.id);
      toast.success('Model deleted successfully');
      setShowDeleteDialog(false);
      setSelectedModel(null);
      loadModels();
    } catch (error: any) {
      console.error('Failed to delete model:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete model');
    }
  };

  const handleTestModel = async (model: Model) => {
    try {
      const result = await modelService.testModel(model.id, { prompt: 'Hello, how are you?' });
      if (result.status === 'success') {
        toast.success('Model connection successful');
      } else {
        toast.error(result.message || 'Model test failed');
      }
    } catch (error: any) {
      console.error('Failed to test model:', error);
      toast.error(error.response?.data?.detail || 'Failed to test model');
    }
  };

  const handleDownloadModel = async (model: Model) => {
    try {
      await modelService.downloadModel(model.id);
      toast.success('Model download started');
      loadModels();
    } catch (error: any) {
      console.error('Failed to download model:', error);
      toast.error(error.response?.data?.detail || 'Failed to download model');
    }
  };

  const filteredModels = models.filter(model => {
    if (filter === 'all') return true;
    return model.model_type === filter;
  });

  const modelTypes = [...new Set(models.map(model => model.model_type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Models</h1>
          <p className="mt-2 text-gray-600">
            Manage AI models and configurations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Model
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          {modelTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No models</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first AI model.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Model
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {statusIcons[model.status]}
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {model.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {model.provider} • {model.model_name}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    model.status === 'SUCCESS' 
                      ? 'bg-green-100 text-green-800' 
                      : model.status === 'ERROR'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {statusLabels[model.status]}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Type: {model.model_type}</span>
                    <span>{model.permission_type}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  {model.status === 'SUCCESS' && (
                    <button
                      onClick={() => handleTestModel(model)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Test
                    </button>
                  )}
                  
                  {model.provider === 'OLLAMA' && model.status !== 'SUCCESS' && (
                    <button
                      onClick={() => handleDownloadModel(model)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <CloudArrowDownIcon className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedModel(model);
                      setShowDeleteDialog(true);
                    }}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Model Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Model"
        size="lg"
      >
        <ModelCreateForm
          onSubmit={handleCreateModel}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteModel}
        title="Delete Model"
        message={`Are you sure you want to delete "${selectedModel?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}; 