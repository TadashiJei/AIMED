import Layout from '@/components/Layout';
import { LiveBPMonitor } from '@/components/LiveBPMonitor';
import PatientAnalytics from '@/components/PatientAnalytics';
import HealthInsights from '@/components/HealthInsights';
import {
  UsersIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  TrendingUpIcon,
  CashIcon
} from '@heroicons/react/outline';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  name: string;
  email: string;
  lastVisit: string;
}

interface Appointment {
  id: string;
  patientName: string;
  scheduledTime: string;
  type: string;
  status: string;
}

interface Analysis {
  id: string;
  patientName: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface PerformanceMetrics {
  patientsServed: number;
  analysisCompleted: number;
  averageRating: number;
  responseTime: number;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      router.push('/dashboard');
      return;
    }

    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`http://localhost:8888/dashboard/doctor/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients);
        setAppointments(data.upcoming_appointments);
        setAnalyses(data.pending_analyses);
        setMetrics(data.performance_metrics);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Add mock data for analytics
  const analyticsData = {
    daily: [
      { date: '2024-12-22', newPatients: 45, followUps: 32 },
      { date: '2024-12-23', newPatients: 52, followUps: 28 },
      { date: '2024-12-24', newPatients: 38, followUps: 35 },
      { date: '2024-12-25', newPatients: 41, followUps: 30 },
      { date: '2024-12-26', newPatients: 48, followUps: 38 },
      { date: '2024-12-27', newPatients: 55, followUps: 42 },
      { date: '2024-12-28', newPatients: 49, followUps: 36 },
    ],
    demographics: [
      { name: 'Adults', value: 850 },
      { name: 'Elderly', value: 620 },
      { name: 'Children', value: 380 },
      { name: 'Teens', value: 290 },
    ],
  };

  // Add mock data for insights
  const insightsData = [
    {
      id: '1',
      title: 'Unusual BP Pattern Detected',
      description: 'Multiple patients showing elevated blood pressure readings in the evening hours.',
      severity: 'high',
      category: 'alert',
      timestamp: '2024-12-28T09:30:00',
    },
    {
      id: '2',
      title: 'Patient Demographics Shift',
      description: 'Notable increase in elderly patients over the past month.',
      severity: 'low',
      category: 'demographic',
      timestamp: '2024-12-28T10:15:00',
    },
    {
      id: '3',
      title: 'Treatment Effectiveness Trend',
      description: 'Positive response to new hypertension management protocol.',
      severity: 'medium',
      category: 'trend',
      timestamp: '2024-12-28T11:00:00',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{metrics?.patientsServed}</p>
                  <p className="ml-2 text-sm text-green-600">+68.95%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">New This Week</h3>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{metrics?.analysisCompleted}</p>
                  <p className="ml-2 text-sm text-green-600">+4.11%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Critical Alerts</h3>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{analyses.length}</p>
                  <p className="ml-2 text-sm text-red-600">+92.05%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Appointments</h3>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{appointments.length}</p>
                  <p className="ml-2 text-sm text-green-600">+27.44%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
              <div className="flex space-x-3">
                <button className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                  1 Year
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-full">
                  6 Months
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-full">
                  1 Month
                </button>
              </div>
            </div>
            <div className="h-64">
              {/* Revenue Chart Component */}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Patient Analytics</h3>
              <button className="text-sm font-medium text-blue-600">
                View All
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-16 text-sm font-medium text-gray-600">
                  Neurology
                </div>
                <div className="flex-1 ml-4">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="ml-4 text-sm font-medium text-gray-900">120</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 text-sm font-medium text-gray-600">
                  Oncology
                </div>
                <div className="flex-1 ml-4">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="ml-4 text-sm font-medium text-gray-900">30</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 text-sm font-medium text-gray-600">
                  Urology
                </div>
                <div className="flex-1 ml-4">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div className="ml-4 text-sm font-medium text-gray-900">24</div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Analytics */}
        <div className="mb-8">
          <PatientAnalytics data={analyticsData} />
        </div>

        {/* Health Insights */}
        <div className="mb-8">
          <HealthInsights insights={insightsData} />
        </div>

        {/* Live BP Monitor */}
        <div className="mb-8">
          <LiveBPMonitor userId="current-user-id" />
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
            <div className="text-sm text-gray-500">September 11, 2024</div>
          </div>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                  <p className="text-sm text-gray-500">{new Date(appointment.scheduledTime).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
