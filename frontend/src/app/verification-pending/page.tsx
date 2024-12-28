'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VerificationPendingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'doctor') {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Verification Pending
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for registering as a doctor. Your account is currently under review.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">What happens next?</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  1. Our team will review your submitted documents
                </p>
                <p className="text-sm text-gray-500">
                  2. We will verify your medical license and credentials
                </p>
                <p className="text-sm text-gray-500">
                  3. You will receive an email notification once your account is verified
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Need help?</h3>
              <p className="mt-2 text-sm text-gray-500">
                If you have any questions or need to update your information, please contact our support team at{' '}
                <a href="mailto:support@aimed.com" className="text-blue-600 hover:text-blue-500">
                  support@aimed.com
                </a>
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Verification usually takes 2-3 business days. You will be notified via email once your account is approved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
