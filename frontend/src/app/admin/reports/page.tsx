'use client';

import { useState, useEffect } from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface Report {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  status: string;
  downloadUrl: string;
}

export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/admin/reports');
      setReports(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reports');
      setLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    try {
      await axios.post('/api/admin/reports/generate', { type });
      fetchReports();
    } catch (err) {
      setError('Failed to generate report');
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Reports</h2>
        <p className="mt-1 text-sm text-gray-400">
          Generate and view system reports
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={() => generateReport('patient-summary')}
          className="p-4 bg-gray-900/95 backdrop-blur-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-lg font-medium text-white">Patient Summary</h3>
          <p className="mt-1 text-sm text-gray-400">
            Generate a summary of all patient activities
          </p>
        </button>

        <button
          onClick={() => generateReport('staff-activity')}
          className="p-4 bg-gray-900/95 backdrop-blur-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-lg font-medium text-white">Staff Activity</h3>
          <p className="mt-1 text-sm text-gray-400">
            View staff performance and activity logs
          </p>
        </button>

        <button
          onClick={() => generateReport('system-health')}
          className="p-4 bg-gray-900/95 backdrop-blur-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-lg font-medium text-white">System Health</h3>
          <p className="mt-1 text-sm text-gray-400">
            Check system performance and usage statistics
          </p>
        </button>
      </div>

      <div className="bg-gray-900/95 backdrop-blur-sm shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-white">Generated Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Report Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Generated At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {report.generatedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {report.status === 'completed' && (
                      <a
                        href={report.downloadUrl}
                        className="text-blue-500 hover:text-blue-400 inline-flex items-center"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                        Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
