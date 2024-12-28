'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface AnalyticsData {
  userStats: {
    totalUsers: number;
    doctors: number;
    patients: number;
    pendingVerifications: number;
    dailySignups: Array<{ date: string; count: number }>;
  };
  analysisMetrics: {
    totalAnalyses: number;
    statusDistribution: Record<string, number>;
    avgProcessingTime: number;
    analysisTypes: Record<string, number>;
  };
  systemUsage: {
    dailyActiveUsers: Array<{ date: string; count: number }>;
    dailyAnalyses: Array<{ date: string; count: number }>;
    peakHours: Array<{ hour: number; count: number }>;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/analytics');
      setAnalytics(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch analytics data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-red-500 text-center p-4">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <p className="mt-1 text-sm text-gray-400">
          Real-time insights and statistics
        </p>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-white">{analytics.userStats.totalUsers}</p>
        </div>
        <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Doctors</h3>
          <p className="mt-2 text-3xl font-semibold text-white">{analytics.userStats.doctors}</p>
        </div>
        <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Patients</h3>
          <p className="mt-2 text-3xl font-semibold text-white">{analytics.userStats.patients}</p>
        </div>
        <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Pending Verifications</h3>
          <p className="mt-2 text-3xl font-semibold text-white">{analytics.userStats.pendingVerifications}</p>
        </div>
      </div>

      {/* Daily Signups Chart */}
      <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Daily Signups</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.userStats.dailySignups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analysis Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Analysis Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(analytics.analysisMetrics.statusDistribution).map(([name, value]) => ({
                    name,
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {Object.entries(analytics.analysisMetrics.statusDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Analysis Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(analytics.analysisMetrics.analysisTypes).map(([name, value]) => ({
                name,
                value
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Usage */}
      <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">System Usage</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.systemUsage.dailyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10B981" name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
