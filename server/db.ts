import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where } from 'firebase/firestore';
import { LotteryGame, User, Transaction, AdminConfig, Purchase } from '../types';

// Read Firebase Config directly
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const LOCAL_DB_PATH = path.join(process.cwd(), 'database.json');

interface LocalDB {
  users: Record<string, User & { password?: string }>;
  transactions: Record<string, Transaction>;
  config: {
    global: AdminConfig;
  };
}

const DEFAULT_CONFIG: AdminConfig = {
  lineLink: 'https://line.me/ti/p/service123',
  logoUrl: "", 
  winningNumbers: {
    loto7: { 
      '2026-03-13': [5, 8, 14, 20, 25, 31, 37],
      '2026-03-12': [3, 9, 12, 18, 22, 29, 35],
      '2026-03-11': [1, 6, 10, 15, 24, 30, 36]
    },
    loto6: { 
      '2026-03-13': [6, 13, 20, 27, 34, 40],
      '2026-03-12': [4, 11, 19, 25, 33, 41],
      '2026-03-11': [2, 8, 14, 20, 31, 39]
    },
    miniloto: { 
      '2026-03-13': [2, 9, 16, 23, 28],
      '2026-03-12': [5, 12, 19, 26, 30],
      '2026-03-11': [7, 14, 21, 28, 31]
    }
  },
  prizeSettings: {
    loto7: { rank1: 10000000, rank2: 100000, rank3: 1000, rank4: 500, rank5: 200, rank6: 100 },
    loto6: { rank1: 6000000, rank2: 60000, rank3: 600, rank4: 300, rank5: 100 },
    miniloto: { rank1: 1000000, rank2: 10000, rank3: 100, rank4: 50 }
  }
};

export function readLocalDB(): LocalDB {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initial: LocalDB = {
      users: {},
      transactions: {},
      config: {
        global: DEFAULT_CONFIG
      }
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const content = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error("Local DB read error, resetting:", e);
    const initial: LocalDB = {
      users: {},
      transactions: {},
      config: {
        global: DEFAULT_CONFIG
      }
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

export function writeLocalDB(data: LocalDB) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Failed to write database.json:", error);
  }
}

// ---------------------- Dual Database Operations with Robust Fallback ----------------------

export async function getDocument(col: 'users' | 'transactions' | 'config', docId: string): Promise<any> {
  try {
    const docRef = doc(db, col, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Sync to local DB
      const local = readLocalDB();
      if (col === 'config') {
        local.config[docId as 'global'] = data as AdminConfig;
      } else {
        local[col][docId] = data as any;
      }
      writeLocalDB(local);
      return data;
    }
    return null;
  } catch (error) {
    console.warn(`[Firestore Fallback Active] getDocument failed for ${col}/${docId}. Falling back to database.json. Error:`, error);
    const local = readLocalDB();
    if (col === 'config') {
      return local.config[docId as 'global'] || null;
    }
    return local[col][docId] || null;
  }
}

export async function getCollection(col: 'users' | 'transactions'): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(db, col));
    const items = snapshot.docs.map(d => d.data());
    
    // Sync to local DB
    const local = readLocalDB();
    items.forEach(item => {
      if (item && item.id) {
        local[col][item.id] = item as any;
      }
    });
    writeLocalDB(local);
    
    return items;
  } catch (error) {
    console.warn(`[Firestore Fallback Active] getCollection failed for ${col}. Falling back to database.json. Error:`, error);
    const local = readLocalDB();
    return Object.values(local[col]);
  }
}

export async function setDocument(col: 'users' | 'transactions' | 'config', docId: string, data: any): Promise<void> {
  // Always update local DB first as the bulletproof backup
  const local = readLocalDB();
  if (col === 'config') {
    local.config[docId as 'global'] = data;
  } else {
    local[col][docId] = data;
  }
  writeLocalDB(local);

  try {
    const docRef = doc(db, col, docId);
    await setDoc(docRef, data);
    console.log(`[Firestore Success] Saved ${col}/${docId}`);
  } catch (error) {
    console.warn(`[Firestore Fallback Active] setDocument failed for ${col}/${docId}. Saved to database.json only. Error:`, error);
  }
}

export async function updateDocument(col: 'users' | 'transactions' | 'config', docId: string, data: any): Promise<void> {
  // Update local DB
  const local = readLocalDB();
  if (col === 'config') {
    local.config[docId as 'global'] = { ...local.config[docId as 'global'], ...data };
  } else {
    if (!local[col][docId]) {
      local[col][docId] = { id: docId } as any;
    }
    local[col][docId] = { ...local[col][docId], ...data };
  }
  writeLocalDB(local);

  try {
    const docRef = doc(db, col, docId);
    await updateDoc(docRef, data);
    console.log(`[Firestore Success] Updated ${col}/${docId}`);
  } catch (error) {
    console.warn(`[Firestore Fallback Active] updateDocument failed for ${col}/${docId}. Updated database.json only. Error:`, error);
  }
}

export async function findUserByEmail(email: string): Promise<any | null> {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data();
      // Sync
      const local = readLocalDB();
      local.users[userData.id] = userData as any;
      writeLocalDB(local);
      return userData;
    }
    return null;
  } catch (error) {
    console.warn(`[Firestore Fallback Active] findUserByEmail failed for ${email}. Falling back to database.json. Error:`, error);
    const local = readLocalDB();
    const user = Object.values(local.users).find((u: any) => u.email === email);
    return user || null;
  }
}
