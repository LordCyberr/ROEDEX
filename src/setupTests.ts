export {};

class WorkerMock {
  url: string;
  onmessage: ((e: any) => void) | null = null;
  constructor(stringUrl: string) {
    this.url = stringUrl;
  }
  postMessage(_msg: any) {
    // mock behavior if needed
  }
  terminate() {}
}

(globalThis as any).Worker = WorkerMock;

const indexedDBMock = {
  open: () => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: () => ({
        createIndex: () => {}
      }),
      transaction: () => ({
        objectStore: () => ({
          get: () => ({ onsuccess: null, onerror: null }),
          put: () => ({ onsuccess: null, onerror: null }),
          delete: () => ({ onsuccess: null, onerror: null }),
          getAll: () => ({ onsuccess: null, onerror: null })
        })
      })
    }
  })
};

(globalThis as any).indexedDB = indexedDBMock;
