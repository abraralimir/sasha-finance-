import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// IMPORTANT: Do not expose this to the client-side.
// This is a server-only file.

// Load the service account key from environment variables.
// The value is expected to be a base64 encoded string.
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  // In a local development environment, you might not have the service account key.
  // We can return a mock or minimal app, but server-side actions requiring auth/firestore will fail.
  // For production, this should always be set.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set. This is required for server-side Firebase Admin operations.');
  }
}

// Function to initialize the Firebase Admin SDK.
// It ensures that initialization only happens once.
export function initAdmin(): App {
  const a = getApps();
  if (a.length > 0) {
    return a[0];
  }

  if (!serviceAccountString) {
     // This is a fallback for local dev where the env var might not be set.
     // Operations will likely fail, but it prevents a hard crash on startup.
     return initializeApp();
  }

  try {
    // Decode the base64 string and parse it as JSON.
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountString, 'base64').toString('utf8'));
    
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('Failed to parse Firebase service account key:', error);
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY is not a valid base64 encoded JSON string.');
  }
}
