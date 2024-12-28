'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowTrendingUpIcon,
  CloudArrowDownIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  BarChart,
  Card,
  DonutChart,
  Title,
  Text,
} from '@tremor/react';

// Mock data - replace with actual API call
const report = {
  id: 1,
  title: 'Monthly Health Analysis',
  date: '2023-12-28',
  type: 'Comprehensive',
  status: 'Completed',
  summary: 'Overall health metrics show positive trends with stable vital signs and improved lifestyle markers.',
  metrics: {
    vitals: [
      { date: '2023-12-01', systolic: 120, diastolic: 80, heartRate: 75 },
      { date: '2023-12-07', systolic: 118, diastolic: 78, heartRate: 72 },
      { date: '2023-12-14', systolic: 122, diastolic: 82, heartRate: 78 },
      { date: '2023-12-21', systolic: 119, diastolic: 79, heartRate: 73 },
      { date: '2023-12-28', systolic: 121, diastolic: 81, heartRate: 74 },
    ],
    lifestyle: {
      exercise: 75,
      sleep: 85,
      nutrition: 70,
      stress: 65,
    },
    trends: [
      { category: 'Blood Pressure', trend: 'Stable', change: '+1%' },
      { category: 'Heart Rate', trend: 'Improving', change: '-2%' },
      { category: 'Sleep Quality', trend: 'Stable', change: '0%' },
      { category: 'Exercise', trend: 'Improving', change: '+5%' },
    ],
  },
  recommendations: [
    'Maintain current exercise routine',
    'Consider increasing water intake',
    'Continue monitoring blood pressure regularly',
    'Focus on stress management techniques',
  ],
};

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="min-h-full">
      <main className="py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mr-4 rounded-full bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <ArrowLeftIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    {report.title}
                  </h2>
                  <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      {report.date}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          report.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <ShareIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                Share
              </button>
              <button
                type="button"
                className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <CloudArrowDownIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Summary Card */}
          <Card className="mt-8">
            <Title>Summary</Title>
            <Text className="mt-4">{report.summary}</Text>
          </Card>

          {/* Vitals Chart */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card>
              <Title>Blood Pressure Trend</Title>
              <AreaChart
                className="mt-4 h-72"
                data={report.metrics.vitals}
                index="date"
                categories={['systolic', 'diastolic']}
                colors={['indigo', 'cyan']}
              />
            </Card>

            <Card>
              <Title>Heart Rate Trend</Title>
              <AreaChart
                className="mt-4 h-72"
                data={report.metrics.vitals}
                index="date"
                categories={['heartRate']}
                colors={['rose']}
              />
            </Card>
          </div>

          {/* Lifestyle Metrics */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card>
              <Title>Lifestyle Score</Title>
              <DonutChart
                className="mt-4 h-72"
                data={[
                  { name: 'Exercise', value: report.metrics.lifestyle.exercise },
                  { name: 'Sleep', value: report.metrics.lifestyle.sleep },
                  { name: 'Nutrition', value: report.metrics.lifestyle.nutrition },
                  { name: 'Stress Management', value: report.metrics.lifestyle.stress },
                ]}
                category="value"
                index="name"
                colors={['emerald', 'violet', 'indigo', 'rose']}
              />
            </Card>

            <Card>
              <Title>Metric Trends</Title>
              <BarChart
                className="mt-4 h-72"
                data={report.metrics.trends}
                index="category"
                categories={['change']}
                colors={['indigo']}
              />
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="mt-8">
            <Title>Recommendations</Title>
            <ul className="mt-4 space-y-4">
              {report.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <ArrowTrendingUpIcon
                    className="h-5 w-5 flex-shrink-0 text-indigo-500"
                    aria-hidden="true"
                  />
                  <span className="ml-3 text-sm text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
