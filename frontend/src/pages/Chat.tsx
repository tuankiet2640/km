export function Chat() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold text-gray-900">AI Chat</h1>
      </div>
      
      <div className="flex-1 p-6">
        <div className="card h-full">
          <p className="text-gray-600">
            Chat interface - interact with your AI applications here.
          </p>
        </div>
      </div>
    </div>
  )
} 