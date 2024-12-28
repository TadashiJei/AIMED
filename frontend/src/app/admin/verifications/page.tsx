'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface VerificationDocument {
  document_type: string;
  document_url: string;
  uploaded_at: string;
}

interface DoctorInfo {
  license_number: string;
  specialization: string;
  hospital_affiliation: string;
  years_of_experience: number;
  education: string;
  verification_documents: VerificationDocument[];
  verification_status: 'pending' | 'approved' | 'rejected';
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  doctor_info: DoctorInfo;
}

export default function VerificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingDoctors, setPendingDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchPendingVerifications();
  }, [user, router]);

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch('http://localhost:8888/admin/pending-verifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingDoctors(data);
      } else {
        toast.error('Failed to fetch pending verifications');
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Error loading verifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (doctorId: string, action: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:8888/admin/verify-doctor/${doctorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action,
          notes: action === 'rejected' ? rejectionReason : undefined
        })
      });

      if (response.ok) {
        toast.success(`Doctor ${action} successfully`);
        fetchPendingVerifications();
        setSelectedDoctor(null);
        setRejectionReason('');
      } else {
        toast.error('Failed to process verification');
      }
    } catch (error) {
      console.error('Error processing verification:', error);
      toast.error('Error processing verification');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Verifications</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {pendingDoctors.map((doctor) => (
              <li key={doctor.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.email}</p>
                    </div>
                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal for reviewing doctor details */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4">
                <h2 className="text-2xl font-bold mb-4">{selectedDoctor.name}</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Contact Information</h3>
                    <p>Email: {selectedDoctor.email}</p>
                    <p>Phone: {selectedDoctor.phone_number}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Professional Information</h3>
                    <p>License: {selectedDoctor.doctor_info.license_number}</p>
                    <p>Specialization: {selectedDoctor.doctor_info.specialization}</p>
                    <p>Hospital: {selectedDoctor.doctor_info.hospital_affiliation}</p>
                    <p>Experience: {selectedDoctor.doctor_info.years_of_experience} years</p>
                    <p>Education: {selectedDoctor.doctor_info.education}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Verification Documents</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {selectedDoctor.doctor_info.verification_documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {doc.document_type}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Rejection reason input */}
                  <div>
                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={() => setSelectedDoctor(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleVerification(selectedDoctor.id, 'rejected')}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerification(selectedDoctor.id, 'approved')}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
