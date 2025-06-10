export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Total Datasets</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">12</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Applications</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">8</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Documents</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">156</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Chat Sessions</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">89</p>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Welcome to KM - AI Knowledge Base Platform
        </h2>
        <p className="text-gray-600">
          Get started by creating your first dataset or application. 
          Use the navigation menu to explore different features.
        </p>
      </div>
    </div>
  )
} 