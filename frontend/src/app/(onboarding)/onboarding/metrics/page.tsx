import { type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';
import { type HealthMetrics } from '@/types';

const schema = yup.object({
  height: yup.number().positive('Height must be positive').required('Height is required'),
  weight: yup.number().positive('Weight must be positive').required('Weight is required'),
  bloodType: yup
    .string()
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .required('Blood type is required'),
  allergies: yup.array().of(
    yup.object({
      type: yup.string().required('Allergy type is required'),
      severity: yup
        .string()
        .oneOf(['mild', 'moderate', 'severe'])
        .required('Severity is required'),
    })
  ),
  medications: yup.array().of(
    yup.object({
      name: yup.string().required('Medication name is required'),
      dosage: yup.string().required('Dosage is required'),
      frequency: yup.string().required('Frequency is required'),
    })
  ),
  conditions: yup.array().of(
    yup.object({
      name: yup.string().required('Condition name is required'),
      diagnosedDate: yup.date().required('Diagnosis date is required'),
      status: yup
        .string()
        .oneOf(['active', 'managed', 'resolved'])
        .required('Status is required'),
    })
  ),
  lifestyle: yup.object({
    smokingStatus: yup
      .string()
      .oneOf(['never', 'former', 'current'])
      .required('Smoking status is required'),
    alcoholConsumption: yup
      .string()
      .oneOf(['none', 'occasional', 'moderate', 'frequent'])
      .required('Alcohol consumption status is required'),
    exerciseFrequency: yup
      .string()
      .oneOf(['none', '1-2 times/week', '3-4 times/week', '5+ times/week'])
      .required('Exercise frequency is required'),
  }),
});

export default function MetricsCollectionPage(): ReactElement {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      allergies: [{ type: '', severity: 'mild' }],
      medications: [{ name: '', dosage: '', frequency: '' }],
      conditions: [{ name: '', diagnosedDate: '', status: 'active' }],
    },
  });

  const onSubmit = async (data: HealthMetrics) => {
    try {
      // Save metrics data
      // TODO: Implement API call
      toast.success('Health metrics saved successfully');
      router.push('/onboarding/preferences');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save health metrics');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Health Metrics
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Please provide your basic health information to help us personalize your
          experience.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Metrics */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
          <div>
            <label
              htmlFor="height"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Height (cm)
            </label>
            <div className="mt-2">
              <input
                {...register('height')}
                type="number"
                step="0.1"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {errors.height && (
                <p className="mt-2 text-sm text-red-600">{errors.height.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="weight"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Weight (kg)
            </label>
            <div className="mt-2">
              <input
                {...register('weight')}
                type="number"
                step="0.1"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              {errors.weight && (
                <p className="mt-2 text-sm text-red-600">{errors.weight.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="bloodType"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Blood Type
            </label>
            <div className="mt-2">
              <select
                {...register('bloodType')}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">Select blood type</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.bloodType && (
                <p className="mt-2 text-sm text-red-600">{errors.bloodType.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div>
          <h3 className="text-base font-semibold leading-7 text-gray-900">Lifestyle</h3>
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
            <div>
              <label
                htmlFor="smokingStatus"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Smoking Status
              </label>
              <div className="mt-2">
                <select
                  {...register('lifestyle.smokingStatus')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select status</option>
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </select>
                {errors.lifestyle?.smokingStatus && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.lifestyle.smokingStatus.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="alcoholConsumption"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Alcohol Consumption
              </label>
              <div className="mt-2">
                <select
                  {...register('lifestyle.alcoholConsumption')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select frequency</option>
                  <option value="none">None</option>
                  <option value="occasional">Occasional</option>
                  <option value="moderate">Moderate</option>
                  <option value="frequent">Frequent</option>
                </select>
                {errors.lifestyle?.alcoholConsumption && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.lifestyle.alcoholConsumption.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="exerciseFrequency"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Exercise Frequency
              </label>
              <div className="mt-2">
                <select
                  {...register('lifestyle.exerciseFrequency')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select frequency</option>
                  <option value="none">None</option>
                  <option value="1-2 times/week">1-2 times/week</option>
                  <option value="3-4 times/week">3-4 times/week</option>
                  <option value="5+ times/week">5+ times/week</option>
                </select>
                {errors.lifestyle?.exerciseFrequency && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.lifestyle.exerciseFrequency.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
