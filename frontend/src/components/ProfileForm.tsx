import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface ProfileFormData {
  occupation: string;
  blood_type: string;
  height: number;
  weight: number;
  emergency_contact_name: string;
  emergency_contact_number: string;
  insurance_provider: string;
  insurance_policy_number: string;
  allergies: string;
  current_medications: string;
  medical_conditions: string;
}

export default function ProfileForm() {
  const [bloodTypes, setBloodTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>();

  useEffect(() => {
    // Fetch blood types
    fetch('/api/blood-types')
      .then(res => res.json())
      .then(data => setBloodTypes(data))
      .catch(error => console.error('Error fetching blood types:', error));

    // Fetch current profile data
    fetch('/api/profile/me')
      .then(res => res.json())
      .then(data => {
        Object.keys(data).forEach(key => {
          setValue(key as keyof ProfileFormData, data[key]);
        });
      })
      .catch(error => console.error('Error fetching profile:', error));
  }, [setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Occupation */}
          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
              Occupation
            </label>
            <input
              type="text"
              id="occupation"
              {...register('occupation', { required: 'Occupation is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.occupation && (
              <p className="mt-1 text-sm text-red-600">{errors.occupation.message}</p>
            )}
          </div>

          {/* Blood Type */}
          <div>
            <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
              Blood Type
            </label>
            <select
              id="blood_type"
              {...register('blood_type', { required: 'Blood type is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Blood Type</option>
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.blood_type && (
              <p className="mt-1 text-sm text-red-600">{errors.blood_type.message}</p>
            )}
          </div>

          {/* Height */}
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">
              Height (cm)
            </label>
            <input
              type="number"
              id="height"
              {...register('height', {
                required: 'Height is required',
                min: { value: 0, message: 'Height must be positive' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.height && (
              <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              {...register('weight', {
                required: 'Weight is required',
                min: { value: 0, message: 'Weight must be positive' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Emergency Contact</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Contact Name */}
          <div>
            <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700">
              Emergency Contact Name
            </label>
            <input
              type="text"
              id="emergency_contact_name"
              {...register('emergency_contact_name', { required: 'Emergency contact name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.emergency_contact_name && (
              <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_name.message}</p>
            )}
          </div>

          {/* Emergency Contact Number */}
          <div>
            <label htmlFor="emergency_contact_number" className="block text-sm font-medium text-gray-700">
              Emergency Contact Number
            </label>
            <input
              type="tel"
              id="emergency_contact_number"
              {...register('emergency_contact_number', { required: 'Emergency contact number is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.emergency_contact_number && (
              <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_number.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Insurance Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insurance Provider */}
          <div>
            <label htmlFor="insurance_provider" className="block text-sm font-medium text-gray-700">
              Insurance Provider
            </label>
            <input
              type="text"
              id="insurance_provider"
              {...register('insurance_provider', { required: 'Insurance provider is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.insurance_provider && (
              <p className="mt-1 text-sm text-red-600">{errors.insurance_provider.message}</p>
            )}
          </div>

          {/* Insurance Policy Number */}
          <div>
            <label htmlFor="insurance_policy_number" className="block text-sm font-medium text-gray-700">
              Insurance Policy Number
            </label>
            <input
              type="text"
              id="insurance_policy_number"
              {...register('insurance_policy_number', { required: 'Insurance policy number is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.insurance_policy_number && (
              <p className="mt-1 text-sm text-red-600">{errors.insurance_policy_number.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Medical Information</h2>
        
        <div className="space-y-6">
          {/* Allergies */}
          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
              Allergies
            </label>
            <textarea
              id="allergies"
              {...register('allergies')}
              placeholder="Enter allergies separated by commas"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Current Medications */}
          <div>
            <label htmlFor="current_medications" className="block text-sm font-medium text-gray-700">
              Current Medications
            </label>
            <textarea
              id="current_medications"
              {...register('current_medications')}
              placeholder="Enter medications separated by commas"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Medical Conditions */}
          <div>
            <label htmlFor="medical_conditions" className="block text-sm font-medium text-gray-700">
              Medical Conditions
            </label>
            <textarea
              id="medical_conditions"
              {...register('medical_conditions')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
