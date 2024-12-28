import { useState } from 'react';
import {
  ChartBarIcon,
  ExclamationIcon,
  TrendingUpIcon,
  UserGroupIcon,
} from '@heroicons/react/outline';

interface Insight {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'trend' | 'alert' | 'prediction' | 'demographic';
  timestamp: string;
}

interface HealthInsightsProps {
  insights: Insight[];
}

export default function HealthInsights({ insights }: HealthInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Insights', icon: ChartBarIcon },
    { id: 'trend', name: 'Trends', icon: TrendingUpIcon },
    { id: 'alert', name: 'Alerts', icon: ExclamationIcon },
    { id: 'demographic', name: 'Demographics', icon: UserGroupIcon },
  ];

  const filteredInsights = insights.filter(
    (insight) => selectedCategory === 'all' || insight.category === selectedCategory
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    const CategoryIcon = categories.find((c) => c.id === category)?.icon || ChartBarIcon;
    return <CategoryIcon className="h-5 w-5" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="border-b border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900">Health Insights</h2>
          <p className="mt-1 text-sm text-gray-500">
            Latest trends, alerts, and predictions based on patient data
          </p>
        </div>
        <div className="flex overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredInsights.map((insight) => (
          <div key={insight.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div
                  className={`p-2 rounded-lg ${
                    insight.category === 'alert'
                      ? 'bg-red-50'
                      : insight.category === 'trend'
                      ? 'bg-blue-50'
                      : insight.category === 'prediction'
                      ? 'bg-purple-50'
                      : 'bg-green-50'
                  }`}
                >
                  {getCategoryIcon(insight.category)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    {insight.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                      insight.severity
                    )}`}
                  >
                    {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{insight.description}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{new Date(insight.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
