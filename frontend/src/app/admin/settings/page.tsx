'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Settings {
  emailNotifications: boolean;
  dailyReports: boolean;
  autoVerification: boolean;
  maintenanceMode: boolean;
  systemEmail: string;
  backupFrequency: string;
  maxUploadSize: number;
  retentionDays: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings');
      setSettings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch settings');
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof Settings) => {
    if (!settings) return;

    try {
      setSuccess('');
      setError('');
      
      const newValue = !settings[key];
      await axios.patch('/api/admin/settings', {
        [key]: newValue
      });
      
      setSettings({
        ...settings,
        [key]: newValue
      });
      
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError('Failed to update settings');
    }
  };

  const handleInputChange = async (key: keyof Settings, value: string | number) => {
    if (!settings) return;

    try {
      setSuccess('');
      setError('');
      
      await axios.patch('/api/admin/settings', {
        [key]: value
      });
      
      setSettings({
        ...settings,
        [key]: value
      });
      
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-red-500 text-center p-4">
        No settings data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
        <p className="mt-1 text-sm text-gray-400">
          Configure system preferences and behavior
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg divide-y divide-gray-800">
        {/* Notification Settings */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Email Notifications</h3>
              <p className="text-sm text-gray-400">Receive system notifications via email</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-700'
              }`}
              onClick={() => handleToggle('emailNotifications')}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Daily Reports */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Daily Reports</h3>
              <p className="text-sm text-gray-400">Automatically generate and send daily reports</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.dailyReports ? 'bg-blue-600' : 'bg-gray-700'
              }`}
              onClick={() => handleToggle('dailyReports')}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.dailyReports ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Auto Verification */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Auto Verification</h3>
              <p className="text-sm text-gray-400">Automatically verify new user registrations</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.autoVerification ? 'bg-blue-600' : 'bg-gray-700'
              }`}
              onClick={() => handleToggle('autoVerification')}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.autoVerification ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Maintenance Mode</h3>
              <p className="text-sm text-gray-400">Put the system in maintenance mode</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-700'
              }`}
              onClick={() => handleToggle('maintenanceMode')}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* System Email */}
        <div className="p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">System Email</h3>
            <p className="text-sm text-gray-400">Email address for system notifications</p>
            <input
              type="email"
              value={settings.systemEmail}
              onChange={(e) => handleInputChange('systemEmail', e.target.value)}
              className="block w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Backup Frequency */}
        <div className="p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Backup Frequency</h3>
            <p className="text-sm text-gray-400">How often to backup system data</p>
            <select
              value={settings.backupFrequency}
              onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
              className="block w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Max Upload Size */}
        <div className="p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Max Upload Size (MB)</h3>
            <p className="text-sm text-gray-400">Maximum file upload size in megabytes</p>
            <input
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) => handleInputChange('maxUploadSize', parseInt(e.target.value))}
              min="1"
              max="100"
              className="block w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Data Retention */}
        <div className="p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Data Retention (Days)</h3>
            <p className="text-sm text-gray-400">Number of days to retain system data</p>
            <input
              type="number"
              value={settings.retentionDays}
              onChange={(e) => handleInputChange('retentionDays', parseInt(e.target.value))}
              min="30"
              max="365"
              className="block w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
