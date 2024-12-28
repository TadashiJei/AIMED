export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
}

export interface Profile {
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
}

export interface HealthMetrics {
  height: number;
  weight: number;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: Array<{
    type: string;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  conditions: Array<{
    name: string;
    diagnosedDate: Date;
    status: 'active' | 'managed' | 'resolved';
  }>;
  lifestyle: {
    smokingStatus: 'never' | 'former' | 'current';
    alcoholConsumption: 'none' | 'occasional' | 'moderate' | 'frequent';
    exerciseFrequency: 'none' | '1-2 times/week' | '3-4 times/week' | '5+ times/week';
  };
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  preferences: {
    language: string;
    timeZone: string;
    measurementSystem: 'metric' | 'imperial';
  };
  privacy: {
    shareDataWithDoctors: boolean;
    allowAnonymousDataUsage: boolean;
    receiveUpdates: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    screenReader: boolean;
  };
}
