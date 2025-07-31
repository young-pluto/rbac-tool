// lib/firebase-config.js
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };
  
  // 🔥 Service Account - Use environment variables for production
  const serviceAccount = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID || "portfolio-415e1",
    "private_key_id": process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID || "YOUR_PRIVATE_KEY_ID",
    "private_key": process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY || "YOUR_PRIVATE_KEY",
    "client_email": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL || "firebase-adminsdk-xxxxx@portfolio-415e1.iam.gserviceaccount.com",
    "client_id": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID || "YOUR_CLIENT_ID",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40portfolio-415e1.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };
  
  // 🤖 GET THIS FROM: https://makersuite.google.com/app/apikey
  const googleAiApiKey = process.env.GOOGLE_AI_API_KEY || "YOUR_GOOGLE_AI_API_KEY";
  
  module.exports = {
    firebaseConfig,
    serviceAccount,
    googleAiApiKey
  };