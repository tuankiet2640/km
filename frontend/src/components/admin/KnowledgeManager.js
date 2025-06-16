import React, { useState, useEffect } from 'react';
import {
  useGetKnowledgeBasesQuery,
  useCreateKnowledgeBaseMutation,
  useGetKnowledgeBaseQuery,
  useGetEmbeddingModelsQuery,
  useUpdateKnowledgeBaseMutation,
  useIngestDocumentMutation,
  useDeleteKnowledgeBaseMutation, // Import hook
} from '../../features/api/knowledgeApi';

// Simple icon for knowledge base
function KnowledgeBaseIcon() {
  return (
    <svg className="inline mr-2 w-5 h-5 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" opacity="0.1" />
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" />
      <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
    </svg>
  );
}

function FileUpload({ kbId }) {
  const [ingestDocument, { isLoading: isIngesting, error: ingestError }] = useIngestDocumentMutation();
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({ message: '', error: false, success: false });

  const handleChange = (e) => {
    setFiles([...e.target.files]);
    setUploadStatus({ message: '', error: false, success: false });
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) return;

    setUploadStatus({ message: `Ingesting ${files.length} file(s)...`, error: false, success: false });
    let successCount = 0;
    let errorDetails = [];

    for (const file of files) {
      try {
        const source = await readFileAsText(file);
        const documentData = { source, filename: file.name };
        await ingestDocument({ kbId, documentData }).unwrap();
        successCount++;
      } catch (err) {
        console.error(`Failed to ingest ${file.name}:`, err);
        const detail = err.data?.detail || err.error || `Failed to read/ingest ${file.name}`;
        errorDetails.push(`${file.name}: ${detail}`);
      }
    }

    if (errorDetails.length > 0) {
      setUploadStatus({
        message: `Ingestion finished. ${successCount}/${files.length} succeeded. Errors: ${errorDetails.join('; ')}`,
        error: true,
        success: successCount > 0,
      });
    } else {
      setUploadStatus({
        message: `Successfully ingested ${successCount}/${files.length} file(s).`,
        error: false,
        success: true,
      });
    }
    setFiles([]);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="file" multiple onChange={handleChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
      <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50" disabled={isIngesting || !files.length}>
        {isIngesting ? 'Ingesting...' : 'Ingest Selected Files'}
      </button>
      {uploadStatus.message && (
        <div className={`text-sm ${uploadStatus.error ? 'text-red-600' : (uploadStatus.success ? 'text-green-600' : 'text-gray-600')}`}>
          {uploadStatus.message}
        </div>
      )}
    </form>
  );
}

export default function KnowledgeManager() {
  const { data: kbList = [], isLoading, error, refetch } = useGetKnowledgeBasesQuery();
  const [createKnowledgeBase, { isLoading: isCreatingKb }] = useCreateKnowledgeBaseMutation();
  const [updateKnowledgeBase, { isLoading: isUpdatingKb }] = useUpdateKnowledgeBaseMutation();
  const [deleteKnowledgeBase, { isLoading: isDeletingKb }] = useDeleteKnowledgeBaseMutation(); // Use hook
  const [selectedKbId, setSelectedKbId] = useState(null);
  const { data: kbDetails, refetch: refetchKbDetails } = useGetKnowledgeBaseQuery(selectedKbId, { skip: !selectedKbId });

  const { data: embeddingModelsData, isLoading: isLoadingEmbeddingModels } = useGetEmbeddingModelsQuery();
  const embeddingModelOptions = embeddingModelsData || [];

  const [formState, setFormState] = useState({
    name: '',
    description: '',
    chunkingStrategy: 'recursive',
    chunkSize: 1000,
    chunkOverlap: 200,
    embeddingModel: '',
  });

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!creating) return;
    if (!formState.embeddingModel && embeddingModelOptions.length > 0) {
      setFormState(prev => ({ ...prev, embeddingModel: embeddingModelOptions[0] }));
    }
  }, [embeddingModelOptions, formState.embeddingModel, creating]);

  useEffect(() => {
    if (!selectedKbId && !creating) { // Viewing list
      setEditing(false);
      setFormError('');
    }
  }, [selectedKbId, creating]);

  const resetFormFields = () => {
    setFormState({
      name: '',
      description: '',
      chunkingStrategy: 'recursive',
      chunkSize: 1000,
      chunkOverlap: 200,
      embeddingModel: embeddingModelOptions.length > 0 ? embeddingModelOptions[0] : '',
    });
    setFormError(null);
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!formState.name || !formState.embeddingModel) {
      setFormError("Name and Embedding Model are required.");
      return;
    }

    const body = {
      name: formState.name,
      description: formState.description || null,
      chunking_strategy: formState.chunkingStrategy,
      chunk_size: parseInt(formState.chunkSize, 10),
      chunk_overlap: parseInt(formState.chunkOverlap, 10),
      embedding_model: formState.embeddingModel,
    };

    try {
      await createKnowledgeBase(body).unwrap();
      resetFormFields();
      setCreating(false);
      refetch();
    } catch (err) {
      console.error("Failed to create knowledge base:", err);
      setFormError(err.data?.detail || err.error || 'Failed to create KB');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedKbId || !formState.name || !formState.embeddingModel) {
      setFormError("Name and Embedding Model are required.");
      return;
    }

    const body = {
      name: formState.name,
      description: formState.description || null,
      chunking_strategy: formState.chunkingStrategy,
      chunk_size: parseInt(formState.chunkSize, 10),
      chunk_overlap: parseInt(formState.chunkOverlap, 10),
      embedding_model: formState.embeddingModel,
    };

    try {
      await updateKnowledgeBase({ id: selectedKbId, ...body }).unwrap();
      setEditing(false);
      refetchKbDetails();
      refetch();
      setFormError(null);
    } catch (err) {
      console.error("Failed to update knowledge base:", err);
      setFormError(err.data?.detail || err.error || 'Failed to update KB');
    }
  };

  const handleDelete = async (kbIdToDelete, kbName) => {
    if (window.confirm(`Are you sure you want to delete the knowledge base "${kbName}"? This action cannot be undone.`)) {
      try {
        await deleteKnowledgeBase(kbIdToDelete).unwrap();
        // If the deleted KB was the one being viewed, deselect it
        if (selectedKbId === kbIdToDelete) {
          setSelectedKbId(null);
        }
        refetch(); // Refetch the list
      } catch (err) {
        console.error(`Failed to delete knowledge base ${kbIdToDelete}:`, err);
        // Display error to user if needed (e.g., using a toast notification or a dedicated error state)
        alert(`Error deleting knowledge base: ${err.data?.detail || err.error || 'Unknown error'}`);
      }
    }
  };

  const renderCreateForm = () => (
    <form className="p-4 border rounded bg-gray-50 dark:bg-gray-800 flex flex-col gap-3 mt-2" onSubmit={handleCreate}>
      <h2 className="text-xl font-semibold mb-2">Create New Knowledge Base</h2>
      <div>
        <label className="block text-sm font-medium">Name*</label>
        <input type="text" name="name" value={formState.name} onChange={handleFormChange} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea name="description" value={formState.description} onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Embedding Model*</label>
          <select name="embeddingModel" value={formState.embeddingModel} onChange={handleFormChange} required disabled={isLoadingEmbeddingModels}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50">
            {isLoadingEmbeddingModels ? (
              <option>Loading models...</option>
            ) : embeddingModelOptions.length > 0 ? (
              embeddingModelOptions.map(modelName => (
                <option key={modelName} value={modelName}>{modelName}</option>
              ))
            ) : (
              <option>No models available</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Chunking Strategy</label>
          <select name="chunkingStrategy" value={formState.chunkingStrategy} onChange={handleFormChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="recursive">Recursive Character</option>
            <option value="fixed_size">Fixed Size</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Chunk Size</label>
          <input type="number" name="chunkSize" value={formState.chunkSize} onChange={handleFormChange} required min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Chunk Overlap</label>
          <input type="number" name="chunkOverlap" value={formState.chunkOverlap} onChange={handleFormChange} required min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
      </div>
      {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}
      <div className="flex gap-2">
        <button type="submit" disabled={isCreatingKb} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 self-start disabled:opacity-50">
          {isCreatingKb ? 'Creating...' : 'Create'}
        </button>
        <button type="button" onClick={() => { setCreating(false); resetFormFields(); }} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 self-start">Cancel</button>
      </div>
    </form>
  );

  const renderEditForm = () => (
    <form className="p-4 border rounded bg-gray-50 dark:bg-gray-800 flex flex-col gap-3 mt-4" onSubmit={handleUpdate}>
      <h3 className="text-xl font-semibold mb-2">Edit Knowledge Base: {kbDetails?.name}</h3>
      <div>
        <label className="block text-sm font-medium">Name*</label>
        <input type="text" name="name" value={formState.name} onChange={handleFormChange} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea name="description" value={formState.description} onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Embedding Model*</label>
          <select name="embeddingModel" value={formState.embeddingModel} onChange={handleFormChange} required disabled={isLoadingEmbeddingModels}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50">
            {isLoadingEmbeddingModels ? (
              <option>Loading models...</option>
            ) : embeddingModelOptions.length > 0 ? (
              embeddingModelOptions.map(modelName => (
                <option key={modelName} value={modelName}>{modelName}</option>
              ))
            ) : (
              <option>No models available</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Chunking Strategy</label>
          <select name="chunkingStrategy" value={formState.chunkingStrategy} onChange={handleFormChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="recursive">Recursive Character</option>
            <option value="fixed_size">Fixed Size</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Chunk Size</label>
          <input type="number" name="chunkSize" value={formState.chunkSize} onChange={handleFormChange} required min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Chunk Overlap</label>
          <input type="number" name="chunkOverlap" value={formState.chunkOverlap} onChange={handleFormChange} required min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
      </div>
      {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}
      <div className="flex gap-2">
        <button type="submit" disabled={isUpdatingKb} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 self-start disabled:opacity-50">
          {isUpdatingKb ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" onClick={() => { setEditing(false); setFormError(null); }} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 self-start">Cancel</button>
      </div>
    </form>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Knowledge Bases</h1>

      <div className="mb-6">
        <button
          className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 mb-2"
          onClick={() => { setCreating((v) => !v); setEditing(false); resetFormFields(); } }
        >
          {creating ? 'Cancel Creation' : '+ New Knowledge Base'}
        </button>

        {creating && renderCreateForm()}
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error.error || error.toString()}</div>
      ) : (
        <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow mb-8">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Name / Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kbList.map((kb) => (
              <tr key={kb.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{kb.id}</td>
                <td className="px-4 py-2">
                  <button onClick={() => setSelectedKbId(kb.id)} className="flex items-center text-left hover:underline">
                    <KnowledgeBaseIcon />
                    {kb.name || 'Unnamed KB'}
                  </button>
                  <p className="text-xs text-gray-500 pl-7">{kb.description || 'No description'}</p>
                </td>
                <td className="px-4 py-2">
                  <button
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setSelectedKbId(kb.id)}
                  >
                    View Details / Ingest
                  </button>
                  <button
                    onClick={() => handleDelete(kb.id, kb.name)} // Call delete handler
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    disabled={isDeletingKb} // Disable while deleting
                  >
                    {isDeletingKb ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedKbId && kbDetails && (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded shadow">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold">Knowledge Base Details</h2>
            <div>
              {!editing && (
                <button
                  onClick={() => {
                    if (kbDetails) { // Ensure kbDetails is loaded
                      setFormState({ // Populate form state directly
                        name: kbDetails.name || '',
                        description: kbDetails.description || '',
                        chunkingStrategy: kbDetails.chunking_strategy || 'recursive',
                        chunkSize: kbDetails.chunk_size ?? 1000,
                        chunkOverlap: kbDetails.chunk_overlap ?? 200,
                        embeddingModel: kbDetails.embedding_model || 'text-embedding-ada-002', // Use raw value
                      });
                      setEditing(true); // Then enter editing mode
                      setFormError(''); // Clear previous errors
                    }
                  }}
                  className="mt-2 mr-2 px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit Config
                </button>
              )}
              <button onClick={() => { setSelectedKbId(null); setEditing(false); setFormError(null); }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
          </div>

          {editing ? (
            renderEditForm()
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><strong>ID:</strong> {kbDetails.id}</div>
                <div><strong>Name:</strong> {kbDetails.name}</div>
                <div className="md:col-span-2"><strong>Description:</strong> {kbDetails.description || 'N/A'}</div>
                <div><strong>Embedding Model:</strong> {kbDetails.embedding_model || 'Default'}</div>
                <div><strong>Chunking Strategy:</strong> {kbDetails.chunking_strategy || 'Default'}</div>
                <div><strong>Chunk Size:</strong> {kbDetails.chunk_size ?? 'Default'}</div>
                <div><strong>Chunk Overlap:</strong> {kbDetails.chunk_overlap ?? 'Default'}</div>
              </div>

              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Ingest Documents (File Upload)</h3>
                <FileUpload kbId={selectedKbId} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
