'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getGravatarUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

interface MedicalInfo {
  occupation: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  allergies: string[];
  current_medications: string[];
  medical_conditions: string[];
  blood_type: string | null;
  height: number | null;
  weight: number | null;
}

export default function Profile() {
  const { user } = useAuth();
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<MedicalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchMedicalInfo = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`http://localhost:8080/auth/medical-info/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setMedicalInfo(data);
          setEditedInfo(data);
        } else {
          throw new Error('Failed to fetch medical info');
        }
      } catch (error) {
        console.error('Error fetching medical info:', error);
        toast.error('Failed to load medical information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalInfo();
  }, [user?.id]);

  const handleSave = async () => {
    if (!editedInfo || !user?.id) return;

    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:8080/auth/onboarding/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedInfo),
      });

      if (response.ok) {
        setMedicalInfo(editedInfo);
        setIsEditing(false);
        toast.success('Medical information updated successfully');
      } else {
        throw new Error('Failed to update medical info');
      }
    } catch (error) {
      console.error('Error updating medical info:', error);
      toast.error('Failed to update medical information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedInfo(medicalInfo);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof MedicalInfo, value: any) => {
    if (!editedInfo) return;

    setEditedInfo(prev => {
      if (!prev) return prev;

      if (field === 'allergies' || field === 'current_medications' || field === 'medical_conditions') {
        return {
          ...prev,
          [field]: value.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '')
        };
      }

      if (field === 'height' || field === 'weight') {
        return {
          ...prev,
          [field]: value === '' ? null : parseFloat(value)
        };
      }

      return {
        ...prev,
        [field]: value
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">Loading profile information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-5 mb-8">
              <div className="flex-shrink-0">
                <img
                  className="h-24 w-24 rounded-full"
                  src={user?.imageUrl || (user?.email ? getGravatarUrl(user.email, 96) : '/default-avatar.png')}
                  alt=""
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold leading-6 text-gray-900">{user?.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
                <p className="mt-1 text-sm text-gray-500">{user?.phone_number}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Medical Information</h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isEditing ? 'Cancel' : 'Edit Information'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Occupation</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={editedInfo?.occupation || ''}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={editedInfo?.blood_type || ''}
                        onChange={(e) => handleInputChange('blood_type', e.target.value)}
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
                      <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                      <input
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={editedInfo?.height || ''}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                      <input
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={editedInfo?.weight || ''}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={editedInfo?.emergency_contact_name || ''}
                      onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Number</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={editedInfo?.emergency_contact_number || ''}
                      onChange={(e) => handleInputChange('emergency_contact_number', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={editedInfo?.insurance_provider || ''}
                      onChange={(e) => handleInputChange('insurance_provider', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insurance Policy Number</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={editedInfo?.insurance_policy_number || ''}
                      onChange={(e) => handleInputChange('insurance_policy_number', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      rows={3}
                      value={editedInfo?.allergies.join(', ') || ''}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      placeholder="Enter allergies separated by commas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      rows={3}
                      value={editedInfo?.current_medications.join(', ') || ''}
                      onChange={(e) => handleInputChange('current_medications', e.target.value)}
                      placeholder="Enter medications separated by commas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      rows={3}
                      value={editedInfo?.medical_conditions.join(', ') || ''}
                      onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                      placeholder="Enter medical conditions separated by commas"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Occupation</dt>
                      <dd className="mt-1 text-sm text-gray-900">{medicalInfo?.occupation}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Blood Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{medicalInfo?.blood_type || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Height</dt>
                      <dd className="mt-1 text-sm text-gray-900">{medicalInfo?.height ? `${medicalInfo.height} cm` : 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Weight</dt>
                      <dd className="mt-1 text-sm text-gray-900">{medicalInfo?.weight ? `${medicalInfo.weight} kg` : 'Not specified'}</dd>
                    </div>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {medicalInfo?.emergency_contact_name} ({medicalInfo?.emergency_contact_number})
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Insurance Information</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {medicalInfo?.insurance_provider ? (
                        <>
                          {medicalInfo.insurance_provider}
                          {medicalInfo.insurance_policy_number && ` - Policy #${medicalInfo.insurance_policy_number}`}
                        </>
                      ) : (
                        'Not specified'
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {medicalInfo?.allergies?.length ? (
                        <ul className="list-disc pl-5">
                          {medicalInfo.allergies.map((allergy, index) => (
                            <li key={index}>{allergy}</li>
                          ))}
                        </ul>
                      ) : (
                        'None reported'
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Current Medications</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {medicalInfo?.current_medications?.length ? (
                        <ul className="list-disc pl-5">
                          {medicalInfo.current_medications.map((medication, index) => (
                            <li key={index}>{medication}</li>
                          ))}
                        </ul>
                      ) : (
                        'None reported'
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Medical Conditions</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {medicalInfo?.medical_conditions?.length ? (
                        <ul className="list-disc pl-5">
                          {medicalInfo.medical_conditions.map((condition, index) => (
                            <li key={index}>{condition}</li>
                          ))}
                        </ul>
                      ) : (
                        'None reported'
                      )}
                    </dd>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
