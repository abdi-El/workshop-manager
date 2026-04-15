// Firebase init — usato solo per l'upload dei dati al backend della versione web.
// Config pubblica via .env.local (stesse chiavi della web app).

import { initializeApp } from 'firebase/app';
import { inMemoryPersistence, initializeAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

// NOTA: initializeAuth (non getAuth) volutamente senza popupRedirectResolver.
// getAuth() carica gapi.iframes da https://apis.google.com per supportare i
// flussi OAuth popup/redirect; in Tauri (origine tauri://localhost) quel frame
// fallisce per CORS e blocca l'inizializzazione dell'auth con "gapi.iframes" TypeError.
// In-memory persistence perché è un upload one-shot: non serve persistere il login.
export const auth = initializeAuth(app, {
    persistence: inMemoryPersistence,
});

// Tauri WebView non supporta bene WebChannel/gRPC-Web: lo stream rimane
// sospeso indefinitamente. Force-long-polling bypassa detection.
export const firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

// Flag sintetico: se manca anche solo una env var, il modulo non è usabile e la UI
// deve mostrare un messaggio invece di provare a loggare.
export const firebaseConfigured = Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
);
