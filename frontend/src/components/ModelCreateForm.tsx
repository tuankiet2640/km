/**
 * Model creation form component.
 */

import React, { useState, useEffect } from 'react';
import { modelService, type Provider, type ModelType, type ModelInfo, type FormField, type ModelCreateData } from '../services/modelService';

interface ModelCreateFormProps {
  onSubmit: (data: ModelCreateData) => Promise<void>;
  onCancel: () => void;
}

export const ModelCreateForm: React.FC<ModelCreateFormProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Provider/Type/Model, 2: Configuration, 3: Parameters
  const [loading, setLoading] = useState(false);
  
  // Step 1 state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [modelTypes, setModelTypes] = useState<ModelType[]>([]);
  const [selectedModelType, setSelectedModelType] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  // Step 2 state
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [modelName, setModelName] = useState<string>('');
  
  // Step 3 state
  const [defaultParams, setDefaultParams] = useState<any[]>([]);
  const [permissionType, setPermissionType] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await modelService.getProviders();
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const handleProviderChange = async (provider: string) => {
    setSelectedProvider(provider);
    setSelectedModelType('');
    setSelectedModel('');
    
    try {
      const types = await modelService.getProviderModelTypes(provider);
      setModelTypes(types);
    } catch (error) {
      console.error('Failed to load model types:', error);
    }
  };

  const handleModelTypeChange = async (modelType: string) => {
    setSelectedModelType(modelType);
    setSelectedModel('');
    
    try {
      const response = await modelService.getProviderModels(selectedProvider, modelType);
      setAvailableModels(response.models);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      // Load form fields for step 2
      try {
        setLoading(true);
        const formResponse = await modelService.getModelForm(selectedProvider, selectedModelType, selectedModel);
        setFormFields(formResponse.fields);
        
        const paramsResponse = await modelService.getModelDefaultParams(selectedProvider, selectedModelType, selectedModel);
        setDefaultParams(paramsResponse.params || []);
        
        setStep(2);
      } catch (error) {
        console.error('Failed to load form fields:', error);
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Submit the form
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data: ModelCreateData = {
        name: modelName,
        model_type: selectedModelType,
        model_name: selectedModel,
        provider: selectedProvider,
        credential: credentials,
        permission_type: permissionType,
        model_params_form: defaultParams,
      };
      
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to create model:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return selectedProvider && selectedModelType && selectedModel;
    } else if (step === 2) {
      const requiredFields = formFields.filter(field => field.required);
      return requiredFields.every(field => credentials[field.field]) && modelName.trim();
    } else if (step === 3) {
      return true;
    }
    return false;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            i <= step ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
          }`}>
            {i}
          </div>
          {i < 3 && (
            <div className={`w-12 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-gray-300'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Choose Provider and Model</h3>
      
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Provider
        </label>
        <select
          value={selectedProvider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a provider</option>
          {providers.map((provider) => (
            <option key={provider.provider} value={provider.provider}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      {/* Model Type Selection */}
      {selectedProvider && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model Type
          </label>
          <select
            value={selectedModelType}
            onChange={(e) => handleModelTypeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a model type</option>
            {modelTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Model Selection */}
      {selectedModelType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a model</option>
            {availableModels.map((model) => (
              <option key={model.name} value={model.name}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Configuration</h3>
      
      {/* Model Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model Name *
        </label>
        <input
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="Enter a name for this model"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Dynamic Form Fields */}
      {formFields.map((field) => (
        <div key={field.field}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label} {field.required && '*'}
          </label>
          {field.type === 'password' ? (
            <input
              type="password"
              value={credentials[field.field] || ''}
              onChange={(e) => setCredentials(prev => ({ ...prev, [field.field]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : field.type === 'number' ? (
            <input
              type="number"
              value={credentials[field.field] || ''}
              onChange={(e) => setCredentials(prev => ({ ...prev, [field.field]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <input
              type="text"
              value={credentials[field.field] || ''}
              onChange={(e) => setCredentials(prev => ({ ...prev, [field.field]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Parameters & Permissions</h3>
      
      {/* Permission Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Permission Type
        </label>
        <select
          value={permissionType}
          onChange={(e) => setPermissionType(e.target.value as 'PRIVATE' | 'PUBLIC')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="PRIVATE">Private - Only accessible to you</option>
          <option value="PUBLIC">Public - Accessible to all users</option>
        </select>
      </div>

      {/* Default Parameters Preview */}
      {defaultParams.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Parameters
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            {defaultParams.map((param, index) => (
              <div key={index} className="flex justify-between py-1">
                <span className="text-sm text-gray-600">{param.label}:</span>
                <span className="text-sm font-medium">{param.default_value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {renderStepIndicator()}
      
      <div className="min-h-[400px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <div>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : step === 3 ? 'Create Model' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}; 