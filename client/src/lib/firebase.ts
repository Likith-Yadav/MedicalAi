import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firestore collection references
export const usersCollection = 'users';
export const consultationsCollection = 'consultations';
export const uploadsCollection = 'uploads';

// Types
export interface FirebaseUser {
  uid: string;
  name: string;
  email: string;
  age?: number;
  bloodType?: string;
  allergies?: string;
  createdAt: Date;
}

export interface FirebaseConsultation {
  id: string;
  userId: string;
  title: string;
  status: 'ongoing' | 'completed';
  date: Date;
  symptoms?: string[];
  diagnosis?: string;
  recommendations?: string[];
}

export interface FirebaseUpload {
  id: string;
  consultationId: string;
  userId: string;
  fileName: string;
  fileType: string;
  url: string;
  uploadedAt: Date;
  analysisResult?: {
    conditions?: Array<{
      name: string;
      confidence: number;
    }>;
    observations?: string[];
    recommendations?: string[];
  };
}