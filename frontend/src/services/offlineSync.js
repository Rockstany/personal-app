import api from './api';

const DB_NAME = 'HabitTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineCompletions';

let db = null;

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('habitId', 'habitId', { unique: false });
        objectStore.createIndex('date', 'date', { unique: false });
        objectStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

export async function saveOfflineCompletion(habitId, date, status, value = null) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const completion = {
      habitId,
      date,
      status,
      value,
      synced: false,
      timestamp: new Date().toISOString()
    };

    const request = store.add(completion);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineCompletions() {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('synced');
    const request = index.getAll(false);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function markAsSynced(id) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function syncOfflineData() {
  if (!navigator.onLine) {
    console.log('Offline - will sync when connection is restored');
    return;
  }

  const offlineCompletions = await getOfflineCompletions();

  for (const completion of offlineCompletions) {
    try {
      await api.post(`/habits/${completion.habitId}/completions/sync`, {
        date: completion.date,
        status: completion.status,
        value: completion.value,
        marked_offline: true
      });

      await markAsSynced(completion.id);
      console.log(`Synced completion for habit ${completion.habitId} on ${completion.date}`);
    } catch (error) {
      console.error(`Failed to sync completion ${completion.id}:`, error);
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Connection restored - syncing offline data');
    syncOfflineData();
  });

  initDB().catch(console.error);
}
