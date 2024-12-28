'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@headlessui/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface NotificationSettings {
  appointments: boolean;
  medicationReminders: boolean;
  labResults: boolean;
  newsletters: boolean;
}

interface UserPreferences {
  language: string;
  theme: string;
  timeZone: string;
}

interface PrivacySettings {
  shareDataWithDoctors: boolean;
  shareDataWithResearchers: boolean;
  allowAnalytics: boolean;
}

interface UserSettings {
  notifications: NotificationSettings;
  preferences: UserPreferences;
  privacy: PrivacySettings;
}

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    appointments: true,
    medicationReminders: true,
    labResults: true,
    newsletters: false,
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    theme: 'light',
    timeZone: 'UTC+8',
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    shareDataWithDoctors: true,
    shareDataWithResearchers: false,
    allowAnalytics: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`http://localhost:8080/api/settings/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setPreferences(data.preferences);
          setPrivacy(data.privacy);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id]);

  const handleNotificationChange = async (key: keyof NotificationSettings) => {
    if (!user?.id) return;

    const newNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };

    try {
      const response = await fetch(`http://localhost:8080/api/settings/${user.id}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNotifications),
      });

      if (response.ok) {
        setNotifications(newNotifications);
        toast.success('Notification settings updated');
      } else {
        throw new Error('Failed to update notifications');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notification settings');
    }
  };

  const handlePreferenceChange = async (key: keyof UserPreferences, value: string) => {
    if (!user?.id) return;

    const newPreferences = {
      ...preferences,
      [key]: value,
    };

    try {
      const response = await fetch(`http://localhost:8080/api/settings/${user.id}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      if (response.ok) {
        setPreferences(newPreferences);
        toast.success('Preferences updated');

        // Apply theme change immediately
        if (key === 'theme') {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(value);
        }
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const handlePrivacyChange = async (key: keyof PrivacySettings) => {
    if (!user?.id) return;

    const newPrivacy = {
      ...privacy,
      [key]: !privacy[key],
    };

    try {
      const response = await fetch(`http://localhost:8080/api/settings/${user.id}/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrivacy),
      });

      if (response.ok) {
        setPrivacy(newPrivacy);
        toast.success('Privacy settings updated');
      } else {
        throw new Error('Failed to update privacy settings');
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Account Settings</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1">
                    <input
                      type="email"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={user?.phone_number || ''}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
              <div className="mt-4 space-y-4">
                {Object.entries(notifications).map(([key, enabled]) => (
                  <Switch.Group key={key} as="div" className="flex items-center justify-between">
                    <Switch.Label as="span" className="flex-grow flex flex-col" passive>
                      <span className="text-sm font-medium text-gray-900">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </span>
                    </Switch.Label>
                    <Switch
                      checked={enabled}
                      onChange={() => handleNotificationChange(key as keyof NotificationSettings)}
                      className={cn(
                        enabled ? 'bg-indigo-600' : 'bg-gray-200',
                        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          enabled ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                        )}
                      />
                    </Switch>
                  </Switch.Group>
                ))}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Preferences</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Theme</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={preferences.theme}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={preferences.timeZone}
                    onChange={(e) => handlePreferenceChange('timeZone', e.target.value)}
                  >
                    <option value="UTC-12">UTC-12</option>
                    <option value="UTC-11">UTC-11</option>
                    <option value="UTC-10">UTC-10</option>
                    <option value="UTC-9">UTC-9</option>
                    <option value="UTC-8">UTC-8</option>
                    <option value="UTC-7">UTC-7</option>
                    <option value="UTC-6">UTC-6</option>
                    <option value="UTC-5">UTC-5</option>
                    <option value="UTC-4">UTC-4</option>
                    <option value="UTC-3">UTC-3</option>
                    <option value="UTC-2">UTC-2</option>
                    <option value="UTC-1">UTC-1</option>
                    <option value="UTC+0">UTC+0</option>
                    <option value="UTC+1">UTC+1</option>
                    <option value="UTC+2">UTC+2</option>
                    <option value="UTC+3">UTC+3</option>
                    <option value="UTC+4">UTC+4</option>
                    <option value="UTC+5">UTC+5</option>
                    <option value="UTC+6">UTC+6</option>
                    <option value="UTC+7">UTC+7</option>
                    <option value="UTC+8">UTC+8</option>
                    <option value="UTC+9">UTC+9</option>
                    <option value="UTC+10">UTC+10</option>
                    <option value="UTC+11">UTC+11</option>
                    <option value="UTC+12">UTC+12</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Privacy</h3>
              <div className="mt-4 space-y-4">
                {Object.entries(privacy).map(([key, enabled]) => (
                  <Switch.Group key={key} as="div" className="flex items-center justify-between">
                    <Switch.Label as="span" className="flex-grow flex flex-col" passive>
                      <span className="text-sm font-medium text-gray-900">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </span>
                    </Switch.Label>
                    <Switch
                      checked={enabled}
                      onChange={() => handlePrivacyChange(key as keyof PrivacySettings)}
                      className={cn(
                        enabled ? 'bg-indigo-600' : 'bg-gray-200',
                        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          enabled ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                        )}
                      />
                    </Switch>
                  </Switch.Group>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
