/**
 * Shared IndexedDB storage adapter for Zustand persist middleware.
 *
 * Eliminates the duplicate openDB + debouncedSetItem boilerplate
 * that was previously copy-pasted into trackerStore.ts and settingsStore.ts.
 *
 * Usage:
 *   import { createIndexedDBStorage } from './indexedDBStorage';
 *   const storage = createIndexedDBStorage('my-db', 5000);
 */

function openDB(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('keyval');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(db: IDBDatabase, name: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keyval', 'readwrite');
    const store = tx.objectStore('keyval');
    const req = store.put(value, name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(db: IDBDatabase, name: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keyval', 'readonly');
    const store = tx.objectStore('keyval');
    const req = store.get(name);
    req.onsuccess = () => resolve((req.result as string) || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(db: IDBDatabase, name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keyval', 'readwrite');
    const store = tx.objectStore('keyval');
    const req = store.delete(name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export interface IndexedDBStorage {
  getItem: (name: string) => Promise<string | null>;
  setItem: (name: string, value: string) => Promise<void>;
  removeItem: (name: string) => Promise<void>;
  /** Call on beforeunload to flush any pending debounced write immediately. */
  flushPending: () => void;
}

/**
 * @param dbName      - IndexedDB database name (e.g. 'roedex-db')
 * @param debounceMs  - How long to wait before writing. Reduces write I/O on rapid state changes.
 * @param lsKey       - Optional: the localStorage key for emergency beforeunload save.
 *                      Pass the same key you pass to Zustand persist `name`.
 */
export function createIndexedDBStorage(
  dbName: string,
  debounceMs: number,
  lsKey?: string
): IndexedDBStorage {
  let dbPromise: Promise<IDBDatabase> | null = null;
  let writeTimeout: ReturnType<typeof setTimeout> | null = null;
  let pendingValue: string | null = null;

  const getDB = () => {
    if (!dbPromise) dbPromise = openDB(dbName);
    return dbPromise;
  };

  const flushPending = () => {
    if (pendingValue && lsKey) {
      try { localStorage.setItem(lsKey, pendingValue); } catch (_) {}
    }
  };

  return {
    flushPending,

    getItem: async (name) => {
      try {
        const db = await getDB();
        const result = await idbGet(db, name);
        // Prioritise any emergency save written during beforeunload
        if (lsKey) {
          const lsValue = localStorage.getItem(lsKey);
          if (lsValue) {
            localStorage.removeItem(lsKey);
            return lsValue;
          }
        }
        return result;
      } catch (e) {
        console.warn(`[ROEDEX] IndexedDB get failed (${dbName}), falling back to localStorage`, e);
        return lsKey ? localStorage.getItem(lsKey) : null;
      }
    },

    setItem: async (name, value) => {
      pendingValue = value;
      if (writeTimeout) return; // timer already running; latest value is captured above
      writeTimeout = setTimeout(async () => {
        writeTimeout = null;
        const toWrite = pendingValue;
        if (toWrite) {
          try {
            const db = await getDB();
            await idbSet(db, name, toWrite);
            if (pendingValue === toWrite) pendingValue = null;
          } catch (e) {
            console.warn(`[ROEDEX] IndexedDB set failed (${dbName}), falling back to localStorage`, e);
            if (lsKey) localStorage.setItem(lsKey, toWrite);
          }
        }
      }, debounceMs);
    },

    removeItem: async (name) => {
      try {
        const db = await getDB();
        await idbDelete(db, name);
      } catch (e) {
        console.warn(`[ROEDEX] IndexedDB remove failed (${dbName}), falling back to localStorage`, e);
        if (lsKey) localStorage.removeItem(lsKey);
      }
    },
  };
}
