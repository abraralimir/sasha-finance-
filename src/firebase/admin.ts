import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { config } from 'dotenv';

// IMPORTANT: This file is for SERVER-SIDE use only.

// Load environment variables from .env file
config();

// Memoization variable to store the initialized app.
let adminApp: App | null = null;

// Function to initialize the Firebase Admin SDK.
// It ensures that initialization only happens once.
export function initAdmin(): App {
  // If the app is already initialized, return it.
  if (adminApp) {
    return adminApp;
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set. This is required for all server-side Firebase Admin operations.');
  }

  try {
    // Decode the base64 string and parse it as JSON.
    const serviceAccount: ServiceAccount = JSON.parse(Buffer.from(serviceAccountString, 'base64').toString('utf8'));
    
    // Initialize the app and store it in the memoization variable.
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    
    return adminApp;

  } catch (error) {
    console.error('Failed to parse Firebase service account key:', error);
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY is not a valid base64 encoded JSON string.');
  }
}
