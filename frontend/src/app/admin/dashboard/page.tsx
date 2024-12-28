'use client';

import {
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Total Patients',
    stat: '1,234',
    icon: UsersIcon,
    change: '12%',
    changeType: 'increase',
  },
  {
    name: 'Appointments Today',
    stat: '45',
    icon: ClockIcon,
    change: '8%',
    changeType: 'increase',
  },
  {
    name: 'Average Wait Time',
    stat: '15 min',
    icon: ChartBarIcon,
    change: '4%',
    changeType: 'decrease',
  },
  {
    name: 'Revenue This Month',
    stat: '$54,230',
    icon: CurrencyDollarIcon,
    change: '15%',
    changeType: 'increase',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-gray-400">
          Welcome back, Administrator
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-gray-900/95 backdrop-blur-sm pt-5 px-4 pb-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <div>
              <div className="absolute rounded-md p-3 bg-blue-600/10">
                <item.icon
                  className="h-6 w-6 text-blue-500"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-16 truncate text-sm font-medium text-gray-300">
                {item.name}
              </div>
            </div>
            <div className="ml-16 flex items-baseline mt-2">
              <p className="text-2xl font-semibold text-white">{item.stat}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'increase'
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {item.changeType === 'increase' ? '↑' : '↓'} {item.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900/95 backdrop-blur-sm shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-white">Recent Activity</h3>
        </div>
        <div className="border-t border-gray-800">
          <ul role="list" className="divide-y divide-gray-800">
            {[1, 2, 3, 4, 5].map((item) => (
              <li key={item} className="px-4 py-4 sm:px-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                      <UsersIcon className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      New patient registration
                    </p>
                    <p className="text-sm text-gray-400">2 minutes ago</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
