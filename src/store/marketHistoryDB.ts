import { createIndexedDBStorage } from './indexedDBStorage';

export const marketHistoryDB = createIndexedDBStorage('roedex-market-db', 2000, 'market-backup');
