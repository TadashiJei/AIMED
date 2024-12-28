import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MenuIcon,
  XIcon,
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CashIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  LogoutIcon,
} from '@heroicons/react/outline';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Patients', href: '/patients', icon: UserGroupIcon },
  { name: 'Appointments', href: '/appointments', icon: CalendarIcon },
  { name: 'Medical Records', href: '/records', icon: DocumentTextIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Billing', href: '/billing', icon: CashIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
  { name: 'Help Center', href: '/help', icon: QuestionMarkCircleIcon },
];

export default function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="AIMED Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="text-xl font-semibold gradient-text">AIMED</span>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
              <Image
                src="/logo.png"
                alt="AIMED Logo"
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="text-xl font-semibold gradient-text">AIMED</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4">
              <button
                onClick={() => {/* Add logout logic */}}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg"
              >
                <LogoutIcon className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-gray-900">
          <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
            <Image
              src="/logo.png"
              alt="AIMED Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="text-xl font-semibold gradient-text">AIMED</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4">
            <button
              onClick={() => {/* Add logout logic */}}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg"
            >
              <LogoutIcon className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
