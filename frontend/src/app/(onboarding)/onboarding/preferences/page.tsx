import { type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';
import { type UserPreferences } from '@/types';

const schema = yup.object({
  notifications: yup.object({
    email: yup.boolean(),
    sms: yup.boolean(),
    push: yup.boolean(),
  }),
  preferences: yup.object({
    language: yup.string().required('Language preference is required'),
    timeZone: yup.string().required('Time zone is required'),
    measurementSystem: yup
      .string()
      .oneOf(['metric', 'imperial'])
      .required('Measurement system is required'),
  }),
  privacy: yup.object({
    shareDataWithDoctors: yup.boolean(),
    allowAnonymousDataUsage: yup.boolean(),
    receiveUpdates: yup.boolean(),
  }),
  accessibility: yup.object({
    fontSize: yup.string().oneOf(['small', 'medium', 'large']),
    highContrast: yup.boolean(),
    screenReader: yup.boolean(),
  }),
});

export default function PreferencesPage(): ReactElement {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      preferences: {
        language: 'en',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        measurementSystem: 'metric',
      },
      privacy: {
        shareDataWithDoctors: true,
        allowAnonymousDataUsage: true,
        receiveUpdates: true,
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        screenReader: false,
      },
    },
  });

  const onSubmit = async (data: UserPreferences) => {
    try {
      // Save preferences
      // TODO: Implement API call
      toast.success('Preferences saved successfully');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save preferences');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">Preferences</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Customize your experience with AIMED.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Notifications */}
        <div>
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Notifications
          </h3>
          <div className="mt-4 space-y-4">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  {...register('notifications.email')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="email" className="font-medium text-gray-900">
                  Email notifications
                </label>
                <p className="text-gray-500">Get updates via email</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  {...register('notifications.sms')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="sms" className="font-medium text-gray-900">
                  SMS notifications
                </label>
                <p className="text-gray-500">Get updates via SMS</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  {...register('notifications.push')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="push" className="font-medium text-gray-900">
                  Push notifications
                </label>
                <p className="text-gray-500">Get updates via push notifications</p>
              </div>
            </div>
          </div>
        </div>

        {/* General Preferences */}
        <div>
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            General Preferences
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Language
              </label>
              <div className="mt-2">
                <select
                  {...register('preferences.language')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
                {errors.preferences?.language && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.preferences.language.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="measurementSystem"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Measurement System
              </label>
              <div className="mt-2">
                <select
                  {...register('preferences.measurementSystem')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
                {errors.preferences?.measurementSystem && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.preferences.measurementSystem.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Privacy Settings
          </h3>
          <div className="mt-4 space-y-4">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  {...register('privacy.shareDataWithDoctors')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label
                  htmlFor="shareDataWithDoctors"
                  className="font-medium text-gray-900"
                >
                  Share data with doctors
                </label>
                <p className="text-gray-500">
                  Allow your doctors to access your health data
                </p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  {...register('privacy.allowAnonymousDataUsage')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label
                  htmlFor="allowAnonymousDataUsage"
                  className="font-medium text-gray-900"
                >
                  Anonymous data usage
                </label>
                <p className="text-gray-500">
                  Allow anonymous usage of your data for research
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div>
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Accessibility
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
            <div>
              <label
                htmlFor="fontSize"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Font Size
              </label>
              <div className="mt-2">
                <select
                  {...register('accessibility.fontSize')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  {...register('accessibility.highContrast')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="highContrast" className="font-medium text-gray-900">
                  High Contrast
                </label>
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
            {isSubmitting ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>
      </form>
    </div>
  );
}
