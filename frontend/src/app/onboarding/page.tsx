'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    occupation: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    insurance_provider: '',
    insurance_policy_number: '',
    allergies: '',
    current_medications: '',
    medical_conditions: '',
    blood_type: '',
    height: '',
    weight: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // In production, get the user_id from your auth state management
      const user_id = 1; // Replace with actual user_id
      const response = await fetch(`http://localhost:8080/auth/onboarding/${user_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
          current_medications: formData.current_medications ? formData.current_medications.split(',').map(m => m.trim()) : [],
          medical_conditions: formData.medical_conditions ? formData.medical_conditions.split(',').map(c => c.trim()) : [],
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.detail || 'Onboarding failed');
      }
    } catch (err) {
      setError('An error occurred during onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Complete Your Medical Profile</h2>
          <p className="mt-2 text-sm text-gray-600">
            This information helps us provide better healthcare services
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                Occupation
              </label>
              <input
                type="text"
                id="occupation"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700">
                Emergency Contact Name
              </label>
              <input
                type="text"
                id="emergency_contact_name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="emergency_contact_number" className="block text-sm font-medium text-gray-700">
                Emergency Contact Number
              </label>
              <input
                type="tel"
                id="emergency_contact_number"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.emergency_contact_number}
                onChange={(e) => setFormData({ ...formData, emergency_contact_number: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="insurance_provider" className="block text-sm font-medium text-gray-700">
                Insurance Provider (Optional)
              </label>
              <input
                type="text"
                id="insurance_provider"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.insurance_provider}
                onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="insurance_policy_number" className="block text-sm font-medium text-gray-700">
                Insurance Policy Number (Optional)
              </label>
              <input
                type="text"
                id="insurance_policy_number"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.insurance_policy_number}
                onChange={(e) => setFormData({ ...formData, insurance_policy_number: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
                Blood Type
              </label>
              <select
                id="blood_type"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.blood_type}
                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                type="number"
                id="height"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                Allergies (Optional, separate with commas)
              </label>
              <textarea
                id="allergies"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows={3}
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="e.g., Penicillin, Peanuts, Latex"
              />
            </div>

            <div>
              <label htmlFor="current_medications" className="block text-sm font-medium text-gray-700">
                Current Medications (Optional, separate with commas)
              </label>
              <textarea
                id="current_medications"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows={3}
                value={formData.current_medications}
                onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
                placeholder="e.g., Aspirin 81mg daily, Metformin 500mg twice daily"
              />
            </div>

            <div>
              <label htmlFor="medical_conditions" className="block text-sm font-medium text-gray-700">
                Medical Conditions (Optional, separate with commas)
              </label>
              <textarea
                id="medical_conditions"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows={3}
                value={formData.medical_conditions}
                onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                placeholder="e.g., Hypertension, Type 2 Diabetes, Asthma"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Complete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
