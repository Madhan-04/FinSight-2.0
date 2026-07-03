// Client-side IndexedDB database service for FinSight AI 3.0

const DB_NAME = 'FinSightDB';
const DB_VERSION = 1;

export interface DBTransaction {
  id?: number;
  date: string;
  raw_description: string;
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  payment_method: string;
  is_recurring: boolean;
  statement_id?: number;
}

export interface DBStatement {
  id?: number;
  filename: string;
  uploaded_at: string;
  bank_name?: string;
  period?: string;
  total_transactions: number;
  total_debits: number;
  total_credits: number;
}

export interface DBGoal {
  id?: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
}

export interface DBChatMessage {
  id?: number;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export class StorageService {
  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB is only available in the browser'));
        return;
      }
      
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('statements')) {
          db.createObjectStore('statements', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('chat_history')) {
          db.createObjectStore('chat_history', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // Generic store helper methods
  private static getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<{ store: IDBObjectStore, transaction: IDBTransaction }> {
    return this.openDB().then(db => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      return { store, transaction };
    });
  }

  public static getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName).then(({ store }) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }).catch(reject);
    });
  }

  public static add<T>(storeName: string, item: T): Promise<T> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName, 'readwrite').then(({ store }) => {
        const request = store.add(item);
        request.onsuccess = () => {
          const addedItem = { ...item, id: request.result as number };
          resolve(addedItem);
        };
        request.onerror = () => reject(request.error);
      }).catch(reject);
    });
  }

  public static bulkAdd<T>(storeName: string, items: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (items.length === 0) {
        resolve();
        return;
      }
      this.getStore(storeName, 'readwrite').then(({ store, transaction }) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        items.forEach(item => store.add(item));
      }).catch(reject);
    });
  }

  public static update<T>(storeName: string, id: number, item: Partial<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName, 'readwrite').then(({ store }) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const existing = getRequest.result;
          if (!existing) {
            reject(new Error(`Item with id ${id} not found in ${storeName}`));
            return;
          }
          const updated = { ...existing, ...item, id };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve(updated);
          putRequest.onerror = () => reject(putRequest.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
      }).catch(reject);
    });
  }

  public static delete(storeName: string, id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName, 'readwrite').then(({ store }) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }).catch(reject);
    });
  }

  public static deleteByFilter(storeName: string, predicate: (item: any) => boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName, 'readwrite').then(({ store }) => {
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
          if (cursor) {
            if (predicate(cursor.value)) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      }).catch(reject);
    });
  }

  public static clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getStore(storeName, 'readwrite').then(({ store }) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }).catch(reject);
    });
  }

  // Backup and Restore (JSON)
  public static async exportBackup(): Promise<string> {
    const transactions = await this.getAll<DBTransaction>('transactions');
    const statements = await this.getAll<DBStatement>('statements');
    const goals = await this.getAll<DBGoal>('goals');
    const chat_history = await this.getAll<DBChatMessage>('chat_history');

    const backupData = {
      version: DB_VERSION,
      timestamp: new Date().toISOString(),
      transactions,
      statements,
      goals,
      chat_history
    };

    return JSON.stringify(backupData, null, 2);
  }

  public static async importBackup(jsonString: string): Promise<void> {
    const backup = JSON.parse(jsonString);
    if (!backup.transactions || !backup.statements || !backup.goals) {
      throw new Error('Invalid backup file structure');
    }

    // Clear existing data
    await this.clear('transactions');
    await this.clear('statements');
    await this.clear('goals');
    await this.clear('chat_history');

    // Restore new data
    await this.bulkAdd('transactions', backup.transactions);
    await this.bulkAdd('statements', backup.statements);
    await this.bulkAdd('goals', backup.goals);
    if (backup.chat_history) {
      await this.bulkAdd('chat_history', backup.chat_history);
    }
  }
}
