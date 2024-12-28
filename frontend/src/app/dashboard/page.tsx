'use client';

import { type ReactElement } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import {
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  HeartIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    id: 1,
    name: 'Health Score',
    stat: '85',
    icon: HeartIcon,
    change: '4.5%',
    changeType: 'increase',
  },
  {
    id: 2,
    name: 'Active Records',
    stat: '12',
    icon: DocumentTextIcon,
    change: '2',
    changeType: 'increase',
  },
  {
    id: 3,
    name: 'Last Check-up',
    stat: '2 weeks ago',
    icon: ClockIcon,
    change: 'On track',
    changeType: 'neutral',
  },
  {
    id: 4,
    name: 'Analysis Reports',
    stat: '8',
    icon: ChartBarIcon,
    change: '3',
    changeType: 'increase',
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardPage(): ReactElement {
  const { user } = useAuthStore();

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between lg:border-t lg:border-gray-200">
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <div>
                  <div className="flex items-center">
                    <UserCircleIcon className="h-16 w-16 text-gray-300" aria-hidden="true" />
                    <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:leading-9">
                      Welcome back, {user?.name}
                    </h1>
                  </div>
                  <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                    <dt className="sr-only">Role</dt>
                    <dd className="flex items-center text-sm font-medium capitalize text-gray-500 sm:mr-6">
                      {user?.role}
                    </dd>
                    <dt className="sr-only">Account status</dt>
                    <dd className="mt-3 flex items-center text-sm font-medium text-gray-500 sm:mr-6 sm:mt-0">
                      <div className="mr-2 flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                      </div>
                      Verified account
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-3 md:ml-4 md:mt-0">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                View Profile
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                New Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stats */}
            {stats.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
              >
                <dt>
                  <div className="absolute rounded-md bg-indigo-500 p-3">
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">
                    {item.name}
                  </p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                  <p
                    className={classNames(
                      item.changeType === 'increase'
                        ? 'text-green-600'
                        : item.changeType === 'decrease'
                        ? 'text-red-600'
                        : 'text-gray-600',
                      'ml-2 flex items-baseline text-sm font-semibold'
                    )}
                  >
                    {item.change}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a
                        href="#"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View details
                      </a>
                    </div>
                  </div>
                </dd>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div className="mt-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-lg font-medium leading-6 text-gray-900">
                Recent Activity
              </h2>

              {/* Activity list */}
              <div className="mt-4">
                <div className="overflow-hidden bg-white shadow sm:rounded-md">
                  <ul role="list" className="divide-y divide-gray-200">
                    <li>
                      <a href="#" className="block hover:bg-gray-50">
                        <div className="flex items-center px-4 py-4 sm:px-6">
                          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                            <div className="truncate">
                              <div className="flex text-sm">
                                <p className="truncate font-medium text-indigo-600">
                                  Health Analysis Report
                                </p>
                                <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                  in Medical Records
                                </p>
                              </div>
                              <div className="mt-2 flex">
                                <div className="flex items-center text-sm text-gray-500">
                                  <ClockIcon
                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  <p>Generated 2 days ago</p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex-shrink-0 sm:ml-5 sm:mt-0">
                              <div className="flex -space-x-1 overflow-hidden">
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                  Completed
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="block hover:bg-gray-50">
                        <div className="flex items-center px-4 py-4 sm:px-6">
                          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                            <div className="truncate">
                              <div className="flex text-sm">
                                <p className="truncate font-medium text-indigo-600">
                                  Medication Schedule
                                </p>
                                <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                  in Treatment Plan
                                </p>
                              </div>
                              <div className="mt-2 flex">
                                <div className="flex items-center text-sm text-gray-500">
                                  <ClockIcon
                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  <p>Updated 5 days ago</p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex-shrink-0 sm:ml-5 sm:mt-0">
                              <div className="flex -space-x-1 overflow-hidden">
                                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                                  In Progress
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
