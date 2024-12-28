import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

interface AnalyticsProps {
  data: {
    daily: Array<{
      date: string;
      newPatients: number;
      followUps: number;
    }>;
    demographics: Array<{
      name: string;
      value: number;
    }>;
  };
}

export default function PatientAnalytics({ data }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'demographics'>('trends');
  const [timeRange, setTimeRange] = useState<'1w' | '1m' | '3m' | '1y'>('1m');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-x-4">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'trends'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Patient Trends
          </button>
          <button
            onClick={() => setActiveTab('demographics')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'demographics'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Demographics
          </button>
        </div>

        {activeTab === 'trends' && (
          <div className="flex space-x-2">
            {(['1w', '1m', '3m', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  timeRange === range
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {range === '1w'
                  ? '1 Week'
                  : range === '1m'
                  ? '1 Month'
                  : range === '3m'
                  ? '3 Months'
                  : '1 Year'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-80">
        {activeTab === 'trends' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.daily}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="newPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="followUps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="newPatients"
                stroke="#4F46E5"
                fillOpacity={1}
                fill="url(#newPatients)"
                name="New Patients"
              />
              <Area
                type="monotone"
                dataKey="followUps"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#followUps)"
                name="Follow-ups"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.demographics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomPieLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.demographics.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {activeTab === 'demographics' && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {data.demographics.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center p-3 rounded-lg"
              style={{ backgroundColor: `${COLORS[index]}10` }}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index] }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.name}
                </p>
                <p className="text-sm text-gray-500">
                  {item.value} patients
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
