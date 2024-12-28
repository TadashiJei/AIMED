'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Card,
  Title,
  Text,
} from '@tremor/react';

// Mock data - replace with actual API calls
const healthMetrics = [
  {
    date: '2023-12-01',
    bloodPressure: 120,
    heartRate: 75,
    bloodSugar: 95,
  },
  {
    date: '2023-12-07',
    bloodPressure: 118,
    heartRate: 72,
    bloodSugar: 92,
  },
  {
    date: '2023-12-14',
    bloodPressure: 122,
    heartRate: 78,
    bloodSugar: 98,
  },
  {
    date: '2023-12-21',
    bloodPressure: 119,
    heartRate: 73,
    bloodSugar: 94,
  },
  {
    date: '2023-12-28',
    bloodPressure: 121,
    heartRate: 74,
    bloodSugar: 96,
  },
];

const reports = [
  {
    id: 1,
    title: 'Monthly Health Analysis',
    date: '2023-12-28',
    type: 'Comprehensive',
    status: 'Completed',
    insights: [
      'Blood pressure remains stable',
      'Heart rate shows improvement',
      'Blood sugar levels are well controlled',
    ],
  },
  {
    id: 2,
    title: 'Quarterly Health Trends',
    date: '2023-12-15',
    type: 'Quarterly Review',
    status: 'Completed',
    insights: [
      'Overall health metrics show positive trends',
      'Exercise routine is effective',
      'Diet adjustments recommended',
    ],
  },
];

export default function AnalysisPage() {
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState('bloodPressure');

  const metrics = [
    { id: 'bloodPressure', name: 'Blood Pressure', color: 'indigo' },
    { id: 'heartRate', name: 'Heart Rate', color: 'rose' },
    { id: 'bloodSugar', name: 'Blood Sugar', color: 'amber' },
  ];

  return (
    <div className="min-h-full">
      <main className="py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Health Analysis
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Track and analyze your health metrics over time
              </p>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                onClick={() => router.push('/analysis/new')}
                className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                New Analysis
              </button>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <Card
                key={metric.id}
                className="cursor-pointer hover:ring-2 hover:ring-indigo-500"
                onClick={() => setSelectedMetric(metric.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Text>{metric.name}</Text>
                    <Title className="mt-2">
                      {healthMetrics[healthMetrics.length - 1][metric.id as keyof typeof healthMetrics[0]]}
                    </Title>
                  </div>
                  <ArrowTrendingUpIcon
                    className={`h-12 w-12 text-${metric.color}-500`}
                    aria-hidden="true"
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Trend Chart */}
          <div className="mt-8">
            <Card>
              <Title>Health Metrics Trend</Title>
              <AreaChart
                className="mt-4 h-72"
                data={healthMetrics}
                index="date"
                categories={[selectedMetric]}
                colors={[metrics.find(m => m.id === selectedMetric)?.color || 'indigo']}
              />
            </Card>
          </div>

          {/* Analysis Reports */}
          <div className="mt-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h2 className="text-base font-semibold leading-6 text-gray-900">Analysis Reports</h2>
                <p className="mt-2 text-sm text-gray-700">
                  View detailed analysis reports and health insights
                </p>
              </div>
            </div>

            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Report
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Status
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">View</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {reports.map((report) => (
                          <tr key={report.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <div className="flex items-center">
                                <DocumentChartBarIcon
                                  className="h-5 w-5 flex-shrink-0 text-gray-400"
                                  aria-hidden="true"
                                />
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">{report.title}</div>
                                  <div className="text-gray-500">
                                    {report.insights[0]}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {report.date}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {report.type}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  report.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {report.status}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => router.push(`/analysis/reports/${report.id}`)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View<span className="sr-only">, {report.title}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
