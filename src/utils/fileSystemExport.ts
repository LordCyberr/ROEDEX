export async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('roedex-fs-db', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('handles');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    const store = tx.objectStore('handles');
    const req = store.put(handle, 'export-folder-handle');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readonly');
    const store = tx.objectStore('handles');
    const req = store.get('export-folder-handle');
    req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function promptForExportFolder(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'downloads'
    });
    if (handle) {
      await saveDirectoryHandle(handle);
      return handle;
    }
  } catch (err) {
    console.warn('User aborted or API not supported', err);
  }
  return null;
}

export async function verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const options = { mode: 'readwrite' };
  if ((await (handle as any).queryPermission(options)) === 'granted') {
    return true;
  }
  if ((await (handle as any).requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}

export async function exportDataToCustomFolder(folderType: 'drawn data' | 'export global data', filename: string, dataStr: string): Promise<boolean> {
  try {
    let handle = await getDirectoryHandle();
    if (!handle) return false;
    
    const hasPermission = await verifyPermission(handle);
    if (!hasPermission) return false;

    // 1. Get or create "ROEDEX map logs"
    const rootLogsHandle = await handle.getDirectoryHandle('ROEDEX map logs', { create: true });
    
    // 2. Get or create subfolder
    const subFolderHandle = await rootLogsHandle.getDirectoryHandle(folderType, { create: true });
    
    // 3. Create file
    const fileHandle = await subFolderHandle.getFileHandle(filename, { create: true });
    
    // 4. Write data
    const writable = await (fileHandle as any).createWritable();
    await writable.write(dataStr);
    await writable.close();
    
    return true;
  } catch (err) {
    console.error('Error exporting to custom folder', err);
    return false;
  }
}
