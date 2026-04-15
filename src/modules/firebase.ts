// Firebase init — usato solo per l'upload dei dati al backend della versione web.
// Config pubblica via .env.local (stesse chiavi della web app).

import { initializeApp } from 'firebase/app';
import { getAuth, inMemoryPersistence, setPersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
// One-shot upload: non serve persistere login fra sessioni. Di default Firebase usa
// browserLocalPersistence (IndexedDB/localStorage) che in prod Tauri WebView può
// hang-are indefinitamente, bloccando signInWithEmailAndPassword.
setPersistence(auth, inMemoryPersistence).catch(() => {
    // Se anche questa fallisce continuiamo: la chiamata in-memory non dovrebbe mai rompersi.
});

// Di default Firestore usa WebChannel/gRPC-Web; in alcune WebView
// (soprattutto Windows WebView2 dietro proxy corporate) lo stream rimane appeso.
// auto-detect fa fallback a long polling HTTP → più robusto, poco più lento.
export const firestore = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
});

// Flag sintetico: se manca anche solo una env var, il modulo non è usabile e la UI
// deve mostrare un messaggio invece di provare a loggare.
export const firebaseConfigured = Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
);
