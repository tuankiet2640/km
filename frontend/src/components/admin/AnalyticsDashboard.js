import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { 
  ArrowUpIcon, ArrowDownIcon, 
  ExclamationTriangleIcon,
  CloudIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { format, parseISO, subDays } from 'date-fns';

// Import analytics service
import analyticsService from '../../services/analyticsService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Widget component for displaying summary stats
const StatWidget = ({ title, value, change, icon, color }) => {
  const isPositiveChange = change >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold dark:text-white">{value}</p>
          <div className={`flex items-center ${isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositiveChange ? 
              <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            }
            <span className="text-xs">{Math.abs(change)}% vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-md rounded">
        <p className="font-medium dark:text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

// Log Level Badge Component
const LogLevelBadge = ({ level }) => {
  const getBadgeColor = () => {
    switch (level) {
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'CRITICAL': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`${getBadgeColor()} text-xs font-medium px-2.5 py-0.5 rounded`}>
      {level}
    </span>
  );
};

const AnalyticsDashboard = () => {
  // State for different analytics data
  const [timeRange, setTimeRange] = useState(30);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [modelUsage, setModelUsage] = useState(null);
  const [kbUsage, setKbUsage] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [systemLogs, setSystemLogs] = useState(null);

  // States for loading and error handling
  const [loading, setLoading] = useState({
    metrics: false,
    models: false,
    kb: false,
    users: false,
    logs: false
  });
  
  const [error, setError] = useState({
    metrics: null,
    models: null,
    kb: null,
    users: null,
    logs: null
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      // Reset errors
      setError({
        metrics: null,
        models: null,
        kb: null,
        users: null,
        logs: null
      });
      
      // Fetch system metrics
      setLoading(prev => ({ ...prev, metrics: true }));
      try {
        const metricsData = await analyticsService.getSystemMetrics({ days: timeRange });
        setSystemMetrics(metricsData);
      } catch (err) {
        console.error('Error fetching system metrics:', err);
        setError(prev => ({ ...prev, metrics: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, metrics: false }));
      }
      
      // Fetch model usage
      setLoading(prev => ({ ...prev, models: true }));
      try {
        const modelsData = await analyticsService.getModelUsage({ days: timeRange });
        setModelUsage(modelsData);
      } catch (err) {
        console.error('Error fetching model usage:', err);
        setError(prev => ({ ...prev, models: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, models: false }));
      }
      
      // Fetch knowledge base usage
      setLoading(prev => ({ ...prev, kb: true }));
      try {
        const kbData = await analyticsService.getKnowledgeBaseUsage({ days: timeRange });
        setKbUsage(kbData);
      } catch (err) {
        console.error('Error fetching knowledge base usage:', err);
        setError(prev => ({ ...prev, kb: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, kb: false }));
      }
      
      // Fetch user activity
      setLoading(prev => ({ ...prev, users: true }));
      try {
        const userData = await analyticsService.getUserActivity({ days: timeRange });
        setUserActivity(userData);
      } catch (err) {
        console.error('Error fetching user activity:', err);
        setError(prev => ({ ...prev, users: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
      
      // Fetch system logs
      setLoading(prev => ({ ...prev, logs: true }));
      try {
        const logsData = await analyticsService.getSystemLogs({ limit: 10 });
        setSystemLogs(logsData);
      } catch (err) {
        console.error('Error fetching system logs:', err);
        setError(prev => ({ ...prev, logs: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, logs: false }));
      }
    };

    fetchData();
  }, [timeRange]);

  // Calculate period over period changes (for stat widgets)
  const calculateChange = (data, metric) => {
    if (!data || !data.metrics || data.metrics.length < 2) return 0;
    
    const halfLength = Math.floor(data.metrics.length / 2);
    const currentPeriod = data.metrics.slice(halfLength);
    const previousPeriod = data.metrics.slice(0, halfLength);
    
    const currentSum = currentPeriod.reduce((sum, day) => sum + day.metrics[metric], 0);
    const previousSum = previousPeriod.reduce((sum, day) => sum + day.metrics[metric], 0);
    
    if (previousSum === 0) return 100; // Avoid division by zero
    
    return Math.round(((currentSum - previousSum) / previousSum) * 100);
  };

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num;
  };

  // Helper function to get latest metrics
  const getLatestMetric = (metricName) => {
    if (!systemMetrics || !systemMetrics.metrics || systemMetrics.metrics.length === 0) {
      return 0;
    }
    const latestDay = systemMetrics.metrics[systemMetrics.metrics.length - 1];
    return latestDay.metrics[metricName];
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <label htmlFor="timeRange" className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics && (
          <>
            <StatWidget 
              title="Total Requests" 
              value={formatNumber(getLatestMetric('request_count'))}
              change={calculateChange(systemMetrics, 'request_count')}
              icon={<CloudIcon className="h-6 w-6 text-blue-500" />}
              color="blue"
            />
            <StatWidget 
              title="Response Time (ms)" 
              value={getLatestMetric('avg_response_time_ms')}
              change={-calculateChange(systemMetrics, 'avg_response_time_ms')}
              icon={<CloudIcon className="h-6 w-6 text-green-500" />}
              color="green"
            />
            <StatWidget 
              title="Error Rate (%)" 
              value={getLatestMetric('error_rate_percent').toFixed(1)}
              change={-calculateChange(systemMetrics, 'error_rate_percent')}
              icon={<ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />}
              color="orange"
            />
            <StatWidget 
              title="Active Users" 
              value={getLatestMetric('active_users')}
              change={calculateChange(systemMetrics, 'active_users')}
              icon={<UserGroupIcon className="h-6 w-6 text-indigo-500" />}
              color="indigo"
            />
          </>
        )}
      </div>

      {/* System Metrics Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4 dark:text-white">System Performance</h2>
        {loading.metrics ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : error.metrics ? (
          <div className="text-red-500 dark:text-red-400 text-center py-8">{error.metrics}</div>
        ) : systemMetrics && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={systemMetrics.metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left" 
                type="monotone" 
                dataKey="metrics.request_count" 
                name="Requests" 
                stroke="#0088FE" 
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="metrics.active_users"
                name="Active Users"
                stroke="#00C49F"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="metrics.avg_response_time_ms"
                name="Avg. Response Time (ms)"
                stroke="#FFBB28"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 dark:text-white">Model Usage</h2>
          {loading.models ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
          ) : error.models ? (
            <div className="text-red-500 dark:text-red-400 text-center py-8">{error.models}</div>
          ) : modelUsage && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelUsage.models}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model_id" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="total_requests" 
                  name="Total Requests" 
                  fill="#0088FE" 
                />
                <Bar 
                  dataKey="avg_tokens_per_request" 
                  name="Avg Tokens/Request" 
                  fill="#00C49F" 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Knowledge Base Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 dark:text-white">Knowledge Base Usage</h2>
          {loading.kb ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
          ) : error.kb ? (
            <div className="text-red-500 dark:text-red-400 text-center py-8">{error.kb}</div>
          ) : kbUsage && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kbUsage.knowledge_bases}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="kb_id" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 1]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="total_queries" 
                  name="Total Queries" 
                  fill="#8884d8" 
                />
                <Bar 
                  yAxisId="left"
                  dataKey="total_retrievals" 
                  name="Total Retrievals" 
                  fill="#82ca9d" 
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="relevance_score"
                  name="Relevance Score"
                  stroke="#ff7300"
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 dark:text-white">User Activity Trend</h2>
          {loading.users ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
          ) : error.users ? (
            <div className="text-red-500 dark:text-red-400 text-center py-8">{error.users}</div>
          ) : userActivity && (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userActivity.activity.active_users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  name="Active Users" 
                  fill="#8884d8" 
                  stroke="#8884d8"
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="returning" 
                  name="Returning Users" 
                  fill="#82ca9d" 
                  stroke="#82ca9d"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Token Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 dark:text-white">Token Usage Distribution</h2>
          {loading.models ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
          ) : error.models ? (
            <div className="text-red-500 dark:text-red-400 text-center py-8">{error.models}</div>
          ) : modelUsage && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={modelUsage.models}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total_tokens"
                  nameKey="model_id"
                >
                  {modelUsage.models.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium dark:text-white">Recent System Logs</h2>
          <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium">
            View All Logs
          </button>
        </div>

        {loading.logs ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : error.logs ? (
          <div className="text-red-500 dark:text-red-400 text-center py-8">{error.logs}</div>
        ) : systemLogs && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {systemLogs.logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LogLevelBadge level={log.level} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.service}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {log.message}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
