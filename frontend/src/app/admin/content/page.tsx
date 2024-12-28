'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  start_date: string;
  end_date?: string;
  target_roles: string[];
  is_active: boolean;
}

interface MedicalForm {
  id: string;
  title: string;
  description: string;
  fields: any[];
  is_active: boolean;
  version: number;
}

interface StaticContent {
  id: string;
  key: string;
  content: string;
  last_updated: string;
}

export default function ContentManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'notifications' | 'forms' | 'content'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [medicalForms, setMedicalForms] = useState<MedicalForm[]>([]);
  const [staticContent, setStaticContent] = useState<StaticContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [newNotification, setNewNotification] = useState<Partial<Notification>>({
    type: 'info',
    target_roles: [],
    is_active: true
  });
  const [selectedForm, setSelectedForm] = useState<MedicalForm | null>(null);
  const [editingContent, setEditingContent] = useState<StaticContent | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchContent();
  }, [user, router]);

  const fetchContent = async () => {
    try {
      const [notificationsRes, formsRes, contentRes] = await Promise.all([
        fetch('http://localhost:8888/admin/notifications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://localhost:8888/admin/medical-forms', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://localhost:8888/admin/static-content', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const [notificationsData, formsData, contentData] = await Promise.all([
        notificationsRes.json(),
        formsRes.json(),
        contentRes.json()
      ]);

      setNotifications(notificationsData);
      setMedicalForms(formsData);
      setStaticContent(contentData);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8888/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newNotification)
      });

      if (response.ok) {
        toast.success('Notification created successfully');
        fetchContent();
        setNewNotification({
          type: 'info',
          target_roles: [],
          is_active: true
        });
      } else {
        toast.error('Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Error creating notification');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8888/admin/medical-forms', {
        method: selectedForm ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(selectedForm)
      });

      if (response.ok) {
        toast.success(`Form ${selectedForm ? 'updated' : 'created'} successfully`);
        fetchContent();
        setSelectedForm(null);
      } else {
        toast.error(`Failed to ${selectedForm ? 'update' : 'create'} form`);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Error saving form');
    }
  };

  const handleContentUpdate = async (content: StaticContent) => {
    try {
      const response = await fetch(`http://localhost:8888/admin/static-content/${content.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: content.content })
      });

      if (response.ok) {
        toast.success('Content updated successfully');
        fetchContent();
        setEditingContent(null);
      } else {
        toast.error('Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Error updating content');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Content Management</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={`${
                activeTab === 'forms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Medical Forms
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Static Content
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">System Notifications</h2>
              
              {/* Notification Form */}
              <form onSubmit={handleNotificationSubmit} className="mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={newNotification.title || ''}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      value={newNotification.message || ''}
                      onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="datetime-local"
                        value={newNotification.start_date || ''}
                        onChange={(e) => setNewNotification({ ...newNotification, start_date: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                      <input
                        type="datetime-local"
                        value={newNotification.end_date || ''}
                        onChange={(e) => setNewNotification({ ...newNotification, end_date: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as any })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="success">Success</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Roles</label>
                    <div className="mt-2 space-y-2">
                      {['patient', 'doctor', 'admin'].map((role) => (
                        <label key={role} className="inline-flex items-center mr-4">
                          <input
                            type="checkbox"
                            checked={newNotification.target_roles?.includes(role)}
                            onChange={(e) => {
                              const roles = new Set(newNotification.target_roles);
                              if (e.target.checked) {
                                roles.add(role);
                              } else {
                                roles.delete(role);
                              }
                              setNewNotification({ ...newNotification, target_roles: Array.from(roles) });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Notification
                  </button>
                </div>
              </form>

              {/* Notifications List */}
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg ${
                      notification.type === 'info'
                        ? 'bg-blue-50'
                        : notification.type === 'warning'
                        ? 'bg-yellow-50'
                        : notification.type === 'error'
                        ? 'bg-red-50'
                        : 'bg-green-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{notification.title}</h3>
                        <p className="text-sm mt-1">{notification.message}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <span>Start: {new Date(notification.start_date).toLocaleString()}</span>
                          {notification.end_date && (
                            <span className="ml-4">End: {new Date(notification.end_date).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Handle notification deletion
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Delete</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'forms' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Medical Forms</h2>
              
              {/* Forms List */}
              <div className="space-y-4">
                {medicalForms.map((form) => (
                  <div
                    key={form.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedForm(form)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{form.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{form.description}</p>
                        <div className="mt-2 text-xs text-gray-400">
                          Version: {form.version} | Fields: {form.fields.length}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            form.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {form.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Editor Modal */}
              {selectedForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <h3 className="text-lg font-medium mb-4">Edit Form: {selectedForm.title}</h3>
                    {/* Form editor component would go here */}
                    <div className="mt-4 flex justify-end space-x-4">
                      <button
                        onClick={() => setSelectedForm(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleFormSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Static Content</h2>
              
              {/* Static Content List */}
              <div className="space-y-4">
                {staticContent.map((content) => (
                  <div key={content.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{content.key}</h3>
                        <div className="mt-2 text-xs text-gray-400">
                          Last updated: {new Date(content.last_updated).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingContent(content)}
                        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-500"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="mt-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: content.content }} />
                  </div>
                ))}
              </div>

              {/* Content Editor Modal */}
              {editingContent && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <h3 className="text-lg font-medium mb-4">Edit Content: {editingContent.key}</h3>
                    <ReactQuill
                      value={editingContent.content}
                      onChange={(content) => setEditingContent({ ...editingContent, content })}
                      className="h-64 mb-12"
                    />
                    <div className="mt-4 flex justify-end space-x-4">
                      <button
                        onClick={() => setEditingContent(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleContentUpdate(editingContent)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
