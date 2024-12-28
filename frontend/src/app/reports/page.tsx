'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Report {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  prescription: string;
  status: 'pending' | 'completed';
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: Fetch reports from API
  // useEffect(() => {
  //   const fetchReports = async () => {
  //     try {
  //       const response = await fetch(`${API_BASE_URL}/api/reports`);
  //       const data = await response.json();
  //       setReports(data);
  //     } catch (error) {
  //       console.error('Error fetching reports:', error);
  //       toast.error('Failed to load reports');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchReports();
  // }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Medical Reports</h1>
        {user?.role === 'doctor' && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => toast.error('Create report feature coming soon!')}
          >
            Create New Report
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reports found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">{report.patientName}</h3>
                  <p className="text-sm text-gray-500">Dr. {report.doctorName}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    report.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {report.date}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Diagnosis:</span>{' '}
                  {report.diagnosis}
                </p>
              </div>
              <button
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                onClick={() => toast.error('View details feature coming soon!')}
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
