export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyBD52KublIlamgChAI0jlmLF-bAGMX2DD8',
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'tcf-canada-5b8c2.firebaseapp.com',
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'tcf-canada-5b8c2',
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || '1:656933850573:web:166a60f1e7591946a68884',
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '656933850573',
}
