'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Patient {
  id: string;
  name: string;
  email: string;
}

interface AnalysisType {
  id: string;
  name: string;
  description: string;
  supportedFiles: string[];
  requiredTests: string[];
}

const analysisTypes: AnalysisType[] = [
  {
    id: 'xray',
    name: 'X-Ray Analysis',
    description: 'AI-powered analysis of chest X-rays for various conditions',
    supportedFiles: ['.jpg', '.png', '.dicom'],
    requiredTests: ['Chest X-Ray']
  },
  {
    id: 'skin',
    name: 'Skin Lesion Analysis',
    description: 'Dermatological analysis using advanced computer vision',
    supportedFiles: ['.jpg', '.png'],
    requiredTests: ['High-resolution skin photographs']
  },
  {
    id: 'mri',
    name: 'MRI Scan Analysis',
    description: 'Neural analysis of MRI scans for abnormalities',
    supportedFiles: ['.dicom', '.nii'],
    requiredTests: ['MRI Scan']
  }
];

export default function NewAnalysisPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      router.push('/dashboard');
      return;
    }

    fetchPatients();
  }, [user, router]);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:8888/api/patients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);

    // Create preview URLs
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisResults(null);

    try {
      const formData = new FormData();
      formData.append('patient_id', selectedPatient);
      formData.append('analysis_type', selectedType);
      formData.append('priority', priority);
      formData.append('notes', notes);
      files.forEach(file => formData.append('files', file));

      const response = await fetch('http://localhost:8888/api/analysis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const results = await response.json();
        setAnalysisResults(results);
        toast.success('Analysis completed successfully');
      } else {
        toast.error('Analysis failed');
      }
    } catch (error) {
      console.error('Error submitting analysis:', error);
      toast.error('Error submitting analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">New Analysis</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Analysis Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Analysis Type</label>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {analysisTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`relative rounded-lg border p-4 cursor-pointer ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <h3 className="text-sm font-medium text-gray-900">{type.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">{type.description}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Supported: {type.supportedFiles.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Files</label>
              <div className="mt-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".jpg,.png,.dicom,.nii"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              {/* File Previews */}
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <div className="mt-2 flex space-x-4">
                {['low', 'medium', 'high'].map((p) => (
                  <label key={p} className="inline-flex items-center">
                    <input
                      type="radio"
                      value={p}
                      checked={priority === p}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Add any relevant notes or observations..."
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isAnalyzing
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Start Analysis'
                )}
              </button>
            </div>
          </form>

          {/* Analysis Results */}
          {analysisResults && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Results</h2>
              
              {/* Risk Levels */}
              <div className="space-y-4">
                {['high', 'medium', 'low'].map((level) => {
                  const risks = analysisResults.risk_assessment.risk_levels[level];
                  if (risks.length === 0) return null;

                  return (
                    <div
                      key={level}
                      className={`p-4 rounded-lg ${
                        level === 'high'
                          ? 'bg-red-50'
                          : level === 'medium'
                          ? 'bg-yellow-50'
                          : 'bg-green-50'
                      }`}
                    >
                      <h3 className="font-medium capitalize text-gray-900">{level} Risk Findings</h3>
                      <ul className="mt-2 space-y-2">
                        {risks.map((risk: any, index: number) => (
                          <li key={index}>
                            <div className="flex justify-between">
                              <span className="font-medium">{risk.condition}</span>
                              <span>
                                {(risk.probability * 100).toFixed(1)}% probability
                              </span>
                            </div>
                            {risk.recommendation && (
                              <p className="text-sm text-gray-600 mt-1">
                                {risk.recommendation}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Summary and Actions */}
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Summary</h3>
                  <p className="mt-1 text-gray-600">{analysisResults.risk_assessment.summary}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Recommended Actions</h3>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    {analysisResults.risk_assessment.immediate_actions.map((action: string, index: number) => (
                      <li key={index} className="text-gray-600">{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
