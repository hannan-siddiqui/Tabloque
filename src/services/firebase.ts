import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  Firestore, 
  Unsubscribe 
} from 'firebase/firestore';
import { FirebaseConfig, TabloqueState } from '../types';

let currentApp: FirebaseApp | null = null;
let currentDb: Firestore | null = null;
let snapshotUnsubscribe: Unsubscribe | null = null;

/**
 * Initializes Firebase with user credentials.
 */
export function initFirebase(config: FirebaseConfig): { app: FirebaseApp; db: Firestore } | null {
  try {
    if (!config.apiKey || !config.projectId) {
      return null;
    }

    // Clean up previous instance if any
    if (getApps().length > 0) {
      currentApp = getApp();
    } else {
      currentApp = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
    }

    currentDb = getFirestore(currentApp);
    return { app: currentApp, db: currentDb };
  } catch (err) {
    console.error('[TabLoque Firebase] Initialization failed:', err);
    return null;
  }
}

/**
 * Pushes local state to Firestore document.
 */
export async function pushStateToCloud(config: FirebaseConfig, state: TabloqueState): Promise<boolean> {
  try {
    const initialized = initFirebase(config);
    if (!initialized) return false;

    const { db } = initialized;
    const userId = config.userId?.trim() || 'default_user';
    const docRef = doc(db, 'tabloque_sync', userId);

    // Save state payload with timestamp
    const payload = {
      pages: state.pages,
      boards: state.boards,
      bookmarks: state.bookmarks,
      pageOrder: state.pageOrder,
      activePageId: state.activePageId,
      lastSyncedAt: Date.now(),
    };

    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.error('[TabLoque Firebase] Failed to push state to Firestore:', error);
    return false;
  }
}

/**
 * Pulls latest state from Firestore document.
 */
export async function pullStateFromCloud(config: FirebaseConfig): Promise<Partial<TabloqueState> | null> {
  try {
    const initialized = initFirebase(config);
    if (!initialized) return null;

    const { db } = initialized;
    const userId = config.userId?.trim() || 'default_user';
    const docRef = doc(db, 'tabloque_sync', userId);

    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as Partial<TabloqueState>;
    }
    return null;
  } catch (error) {
    console.error('[TabLoque Firebase] Failed to pull state from Firestore:', error);
    return null;
  }
}

/**
 * Subscribes to real-time changes in Firestore.
 */
export function subscribeToCloudSync(
  config: FirebaseConfig, 
  onRemoteUpdate: (remoteState: Partial<TabloqueState>) => void
): () => void {
  if (snapshotUnsubscribe) {
    snapshotUnsubscribe();
    snapshotUnsubscribe = null;
  }

  const initialized = initFirebase(config);
  if (!initialized) return () => {};

  const { db } = initialized;
  const userId = config.userId?.trim() || 'default_user';
  const docRef = doc(db, 'tabloque_sync', userId);

  snapshotUnsubscribe = onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data) {
        onRemoteUpdate(data as Partial<TabloqueState>);
      }
    }
  }, (err) => {
    console.warn('[TabLoque Firebase] Snapshot subscription error:', err);
  });

  return () => {
    if (snapshotUnsubscribe) {
      snapshotUnsubscribe();
      snapshotUnsubscribe = null;
    }
  };
}
