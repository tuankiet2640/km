import React, { useState } from 'react';

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock services data from the dashboard
  const services = [
    { id: 'S1001', name: 'Task Management', status: 'Operational', requests: 2145, avgLatency: 220, errorRate: 1.2, uptime: 99.97, lastIncident: '2023-06-07T08:10:22' },
    { id: 'S1002', name: 'Content Creation', status: 'Operational', requests: 1856, avgLatency: 350, errorRate: 0.8, uptime: 99.95, lastIncident: '2023-06-02T15:22:10' },
    { id: 'S1003', name: 'Research Assistant', status: 'Degraded', requests: 1542, avgLatency: 420, errorRate: 1.5, uptime: 99.82, lastIncident: '2023-06-05T09:15:00' },
    { id: 'S1004', name: 'Code Helper', status: 'Operational', requests: 1320, avgLatency: 280, errorRate: 1.1, uptime: 99.99, lastIncident: '2023-05-18T14:35:42' },
    { id: 'S1005', name: 'Meeting Summarizer', status: 'Operational', requests: 980, avgLatency: 190, errorRate: 0.5, uptime: 100.00, lastIncident: '2023-04-22T10:12:18' },
    { id: 'S1006', name: 'Email Assistant', status: 'Operational', requests: 1745, avgLatency: 175, errorRate: 0.7, uptime: 99.98, lastIncident: '2023-05-28T16:40:33' },
    { id: 'S1007', name: 'Data Analyzer', status: 'Degraded', requests: 675, avgLatency: 520, errorRate: 2.3, uptime: 99.75, lastIncident: '2023-06-06T11:22:45' },
    { id: 'S1008', name: 'Customer Support Bot', status: 'Operational', requests: 3245, avgLatency: 230, errorRate: 1.0, uptime: 99.96, lastIncident: '2023-05-31T08:55:21' },
    { id: 'S1009', name: 'Translation Service', status: 'Operational', requests: 845, avgLatency: 310, errorRate: 0.9, uptime: 99.94, lastIncident: '2023-05-15T13:20:14' },
    { id: 'S1010', name: 'Document Processor', status: 'Operational', requests: 1125, avgLatency: 450, errorRate: 1.3, uptime: 99.93, lastIncident: '2023-06-01T09:30:56' }
  ];
 
  // Filter and search services
  const filteredServices = services
    .filter(service => {
      if (filter === 'all') return true;
      return service.status.toLowerCase() === filter.toLowerCase();
    })
    .filter(service => {
      if (!searchTerm) return true;
      return (
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const formatDate = (dateString) => {
    if (!dateString) return 'None';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Operational': return 'bg-green-100 text-green-800';
      case 'Degraded': return 'bg-yellow-100 text-yellow-800';
      case 'Down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getErrorRateColor = (rate) => {
    if (rate < 1.0) return 'text-green-600';
    if (rate < 2.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLatencyColor = (latency) => {
    if (latency < 200) return 'text-green-600';
    if (latency < 400) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Services Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage AI services across your platform.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors">
            Add Service
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Service Status</h3>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <span className="block text-2xl font-bold text-green-600 dark:text-green-400">
                {services.filter(s => s.status === 'Operational').length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Operational</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {services.filter(s => s.status === 'Degraded').length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Degraded</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-red-600 dark:text-red-400">
                {services.filter(s => s.status === 'Down').length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Down</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Total Requests (24h)</h3>
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {services.reduce((sum, service) => sum + service.requests, 0).toLocaleString()}
            </span>
            <span className="text-sm text-green-600 dark:text-green-400 mt-2">
              ↑ 12% from yesterday
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Avg. System Uptime</h3>
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {(services.reduce((sum, service) => sum + service.uptime, 0) / services.length).toFixed(2)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last 30 days
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
              >
                <option value="all">All</option>
                <option value="operational">Operational</option>
                <option value="degraded">Degraded</option>
                <option value="down">Down</option>
              </select>
            </div>
            <div className="sm:w-64">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
              <input
                type="text"
                id="search"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              Export
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              Incidents
            </button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Requests (24h)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avg. Latency
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Error Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Uptime
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Incident
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {service.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(service.status)}`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {service.requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${getLatencyColor(service.avgLatency)}`}>
                      {service.avgLatency} ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${getErrorRateColor(service.errorRate)}`}>
                      {service.errorRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {service.uptime}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(service.lastIncident)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 mr-3">
                      Config
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                <span className="font-medium">{filteredServices.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button aria-current="page" className="z-10 bg-rose-50 dark:bg-rose-900/30 border-rose-500 dark:border-rose-400 text-rose-600 dark:text-rose-300 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 