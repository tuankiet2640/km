import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import adminService from '../../services/adminService';
import SimpleApiModeToggle from './SimpleApiModeToggle';

// Initial state for dashboard stats
const initialStats = {
  users: 342,
  agents: 48,
  services: 12,
  apiCalls: 5843,
  averageResponseTime: 1.8,
  tokenUsage: {
    total: 12584629,
    available: 5000000,
    used: 7584629,
    byModel: [
      { name: 'GPT-4', usage: 3245789, color: '#8884d8' },
      { name: 'Claude-3', usage: 2654321, color: '#82ca9d' },
      { name: 'Mistral', usage: 952461, color: '#ffc658' },
      { name: 'Llama', usage: 732058, color: '#ff8042' }
    ]
  },
  crushEncounters: [
    { week: 'Week 1', count: 2 },
    { week: 'Week 2', count: 1 },
    { week: 'Week 3', count: 3 },
    { week: 'Week 4', count: 0 },
    { week: 'Week 5', count: 4 },
    { week: 'Week 6', count: 2 },
  ],
  userGrowth: [
    { month: 'Jan', count: 120 },
    { month: 'Feb', count: 150 },
    { month: 'Mar', count: 200 },
    { month: 'Apr', count: 250 },
    { month: 'May', count: 300 },
    { month: 'Jun', count: 342 },
  ],
  popularAgents: [
    { name: 'Minion', usage: 456, avgTokens: 1250 },
    { name: 'Claude', usage: 322, avgTokens: 1850 },
    { name: 'GPT', usage: 287, avgTokens: 1640 },
    { name: 'Custom', usage: 224, avgTokens: 950 },
  ],
  servicePerformance: [
    { name: 'Task Management', requests: 2145, avgLatency: 220, errorRate: 1.2 },
    { name: 'Content Creation', requests: 1856, avgLatency: 350, errorRate: 0.8 },
    { name: 'Research Assistant', requests: 1542, avgLatency: 420, errorRate: 1.5 },
    { name: 'Code Helper', requests: 1320, avgLatency: 280, errorRate: 1.1 },
    { name: 'Meeting Summarizer', requests: 980, avgLatency: 190, errorRate: 0.5 },
  ],
  dailyTokenUsage: [
    { date: '06/01', usage: 425000 },
    { date: '06/02', usage: 392000 },
    { date: '06/03', usage: 510000 },
    { date: '06/04', usage: 380000 },
    { date: '06/05', usage: 405000 },
    { date: '06/06', usage: 425000 },
    { date: '06/07', usage: 460000 },
  ],
  // New mock data for users
  userData: {
    active: 298,
    inactive: 44,
    new: {
      daily: 8,
      weekly: 42,
      monthly: 124
    },
    byPlan: [
      { name: 'Bellow Basic', count: 184, color: '#8884d8' },
      { name: 'Basic', count: 87, color: '#82ca9d' },
      { name: 'Pro', count: 59, color: '#ffc658' },
      { name: 'Provip', count: 12, color: '#ff8042' }
    ],
    topUsers: [
      { id: 'U1001', name: 'Alice Johnson', email: 'alice@example.com', tokenUsage: 450000, lastActive: '2023-06-07T14:32:21' },
      { id: 'U1002', name: 'Bob Smith', email: 'bob@example.com', tokenUsage: 380500, lastActive: '2023-06-07T09:15:43' },
      { id: 'U1003', name: 'Carol Davis', email: 'carol@example.com', tokenUsage: 325800, lastActive: '2023-06-06T18:22:10' },
      { id: 'U1004', name: 'David Wilson', email: 'david@example.com', tokenUsage: 290450, lastActive: '2023-06-07T11:45:32' },
      { id: 'U1005', name: 'Eva Brown', email: 'eva@example.com', tokenUsage: 275900, lastActive: '2023-06-07T16:08:55' }
    ]
  },
  // New mock data for detailed agent information
  agentData: {
    types: [
      { type: 'Assistant', count: 18, color: '#8884d8' },
      { type: 'Specialist', count: 14, color: '#82ca9d' },
      { type: 'Workflow', count: 9, color: '#ffc658' },
      { type: 'Custom', count: 7, color: '#ff8042' }
    ],
    models: [
      { name: 'GPT-4', count: 22, avgLatency: 850 },
      { name: 'Claude-3', count: 15, avgLatency: 920 },
      { name: 'Mistral', count: 8, avgLatency: 540 },
      { name: 'Llama', count: 3, avgLatency: 780 }
    ],
    recentAgents: [
      { id: 'A1001', name: 'Research Assistant', type: 'Specialist', model: 'GPT-4', creator: 'System', created: '2023-05-28', uses: 456 },
      { id: 'A1002', name: 'Code Review Helper', type: 'Assistant', model: 'Claude-3', creator: 'System', created: '2023-05-15', uses: 322 },
      { id: 'A1003', name: 'Email Summarizer', type: 'Workflow', model: 'GPT-4', creator: 'Alice Johnson', created: '2023-06-02', uses: 198 },
      { id: 'A1004', name: 'Document Analyzer', type: 'Specialist', model: 'Mistral', creator: 'System', created: '2023-05-10', uses: 287 },
      { id: 'A1005', name: 'Custom Assistant', type: 'Custom', model: 'GPT-4', creator: 'Bob Smith', created: '2023-06-05', uses: 67 }
    ]
  },
  // New mock data for detailed service information
  serviceData: {
    status: [
      { status: 'Operational', count: 10, color: '#4ade80' },
      { status: 'Degraded', count: 2, color: '#facc15' },
      { status: 'Down', count: 0, color: '#f87171' }
    ],
    uptime: [
      { date: '06/01', percentage: 99.98 },
      { date: '06/02', percentage: 99.95 },
      { date: '06/03', percentage: 99.99 },
      { date: '06/04', percentage: 100.00 },
      { date: '06/05', percentage: 99.92 },
      { date: '06/06', percentage: 99.97 },
      { date: '06/07', percentage: 99.99 }
    ],
    serviceIncidents: [
      { id: 'INC1001', service: 'Content Creation', startTime: '2023-06-02T15:22:10', endTime: '2023-06-02T16:45:32', impact: 'Minor', status: 'Resolved' },
      { id: 'INC1002', service: 'Research Assistant', startTime: '2023-06-05T09:15:00', endTime: '2023-06-05T11:30:45', impact: 'Moderate', status: 'Resolved' },
      { id: 'INC1003', service: 'Task Management', startTime: '2023-06-07T08:10:22', endTime: null, impact: 'Minor', status: 'Investigating' }
    ]
  },
  // New mock data for system settings
  settingsData: {
    tokenLimits: {
      default: 100000,
      basic: 500000,
      pro: 2000000,
      enterprise: 10000000
    },
    modelSettings: [
      { model: 'GPT-4', enabled: true, defaultForRoles: ['Admin', 'Power User'], costPerToken: 0.00006 },
      { model: 'Claude-3', enabled: true, defaultForRoles: ['Standard User'], costPerToken: 0.00005 },
      { model: 'Mistral', enabled: true, defaultForRoles: [], costPerToken: 0.00002 },
      { model: 'Llama', enabled: true, defaultForRoles: [], costPerToken: 0.00001 }
    ],
    securitySettings: {
      mfaRequired: true,
      sessionTimeout: 30, // minutes
      passwordPolicy: {
        minLength: 12,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        expiryDays: 90
      },
      dataRetention: {
        conversationHistory: 60, // days
        userLogs: 90, // days
        backups: 30 // days
      }
    },
    integrations: [
      { name: 'Slack', status: 'Connected', lastSync: '2023-06-07T12:30:45' },
      { name: 'Microsoft Teams', status: 'Connected', lastSync: '2023-06-07T08:15:22' },
      { name: 'Google Drive', status: 'Connected', lastSync: '2023-06-06T18:45:10' },
      { name: 'GitHub', status: 'Disconnected', lastSync: '2023-06-01T14:20:38' },
      { name: 'Jira', status: 'Connected', lastSync: '2023-06-07T10:05:17' }
    ]
  }
};

// COLORS
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    // In a real app, we would fetch the dashboard data here
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard stats from our admin service
        const response = await adminService.getDashboardStats();
        if (response && response.data) {
          setStats({
            ...initialStats,
            ...response.data
          });
        } else {
          setStats(initialStats);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Function to calculate total crush encounters
  const totalCrushEncounters = stats.crushEncounters.reduce((total, week) => total + week.count, 0);

  // Calculate token usage percentage
  const tokenUsagePercentage = Math.round((stats.tokenUsage.used / stats.tokenUsage.total) * 100);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* API Mode Toggle - Only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <SimpleApiModeToggle />
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, Admin. Here's what's happening across your platform.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button 
            onClick={() => setLoading(true)}
            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.users}</h3>
            </div>
            <div className="rounded-full p-3 bg-rose-100 dark:bg-rose-900/30">
              <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm text-green-600 dark:text-green-400">↑ 14% from last {timeRange}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Agents</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.agents}</h3>
            </div>
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/30">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm text-green-600 dark:text-green-400">↑ 8% from last {timeRange}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">API Calls</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.apiCalls}</h3>
            </div>
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/30">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm text-green-600 dark:text-green-400">↑ 18% from last {timeRange}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Response Time</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.averageResponseTime}s</h3>
            </div>
            <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/30">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm text-green-600 dark:text-green-400">↓ 5% from last {timeRange}</span>
          </div>
        </div>
      </div>

      {/* Token Usage Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Token Usage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Used: {(stats.tokenUsage.used / 1000000).toFixed(2)}M</span>
              <span className="text-gray-600 dark:text-gray-400">Available: {(stats.tokenUsage.available / 1000000).toFixed(2)}M</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${tokenUsagePercentage > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${tokenUsagePercentage}%` }}
              ></div>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {tokenUsagePercentage}% of monthly allocation used
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total: {(stats.tokenUsage.total / 1000000).toFixed(2)}M tokens
              </span>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.tokenUsage.byModel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="usage"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.tokenUsage.byModel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${(value / 1000000).toFixed(2)}M tokens`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Token Usage Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily Token Consumption
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats.dailyTokenUsage}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                domain={['dataMin', 'dataMax']} 
              />
              <Tooltip formatter={(value) => `${(value / 1000).toFixed(0)}k tokens`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Token Usage" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Crush Encounters and User Growth Charts - now with Recharts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Crush Encounters
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.crushEncounters}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ff6b81" name="Encounters" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400">Total Encounters</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalCrushEncounters}</p>
            </div>
            <div className="mt-1">
              <span className="text-sm text-rose-600 dark:text-rose-400">❤️ {totalCrushEncounters > 10 ? "You're getting closer!" : "Keep trying!"}</span>
            </div>
          </div>
        </div> */}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Growth
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.userGrowth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400">Monthly Growth</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">+14%</p>
            </div>
            <div className="mt-1">
              <span className="text-sm text-blue-600 dark:text-blue-400">🚀 Strong growth this quarter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Popular Agents
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Share</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.popularAgents.map((agent, index) => {
                const totalUsage = stats.popularAgents.reduce((sum, a) => sum + a.usage, 0);
                const percentage = Math.round((agent.usage / totalUsage) * 100);
                
                // Generate a random trend indicator
                const trends = ['↑', '↓', '→'];
                const trendColors = {
                  '↑': 'text-green-600 dark:text-green-400',
                  '↓': 'text-red-600 dark:text-red-400',
                  '→': 'text-gray-600 dark:text-gray-400'
                };
                const randomTrend = trends[Math.floor(Math.random() * trends.length)];
                
                return (
                  <tr key={agent.name} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{agent.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{agent.usage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{agent.avgTokens}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{percentage}%</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${trendColors[randomTrend]}`}>{randomTrend} {Math.floor(Math.random() * 20)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Service Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Latency (ms)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Error Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.servicePerformance.map((service, index) => (
                <tr key={service.name} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{service.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{service.requests}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{service.avgLatency}ms</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className={service.errorRate > 1.0 ? 'text-amber-500' : 'text-green-500'}>
                      {service.errorRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link 
          to="/admin/users" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="rounded-full p-3 bg-rose-100 dark:bg-rose-900/30 mb-4">
            <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Manage Users</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">View and manage user accounts</p>
        </Link>
        
        <Link 
          to="/admin/agents" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/30 mb-4">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Manage Agents</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure and deploy AI agents</p>
        </Link>
        
        <Link 
          to="/admin/services" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/30 mb-4">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Manage Services</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor and configure services</p>
        </Link>
        
        <Link 
          to="/admin/tokens" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/30 mb-4">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Token Management</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor and manage token usage</p>
        </Link>
      </div>
    </div>
  );
} 