import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Category,
  ClientData,
  Coupon,
  Order,
  Product,
  StoreSettings,
} from './types';
import {
  initialCategories,
  initialClients,
  initialCoupons,
  initialOrders,
  initialProducts,
  initialStoreSettings,
} from './mock-data';

interface AppDatabase {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
  clients: ClientData[];
  coupons: Coupon[];
  adminAuth: {
    username: string;
    salt: string;
    passwordHash: string;
    isTemporaryPassword: boolean;
    failedAttempts: number;
    lockedUntil?: number;
  };
  auditLogs: {
    id: string;
    action: string;
    entity: string;
    entityId?: string;
    details: string;
    timestamp: string;
    ip?: string;
  }[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'recriar_database.json');

// Helper to hash password with PBKDF2/SHA256
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
}

// Generate initial salt and hash for temp password "recriar123"
const INITIAL_SALT = crypto.randomBytes(16).toString('hex');
const INITIAL_HASH = hashPassword('recriar123', INITIAL_SALT);

let memoryDb: AppDatabase | null = null;

function getInitialDb(): AppDatabase {
  return {
    settings: JSON.parse(JSON.stringify(initialStoreSettings)),
    categories: JSON.parse(JSON.stringify(initialCategories)),
    products: JSON.parse(JSON.stringify(initialProducts)),
    orders: JSON.parse(JSON.stringify(initialOrders)),
    clients: JSON.parse(JSON.stringify(initialClients)),
    coupons: JSON.parse(JSON.stringify(initialCoupons)),
    adminAuth: {
      username: 'Recriar',
      salt: INITIAL_SALT,
      passwordHash: INITIAL_HASH,
      isTemporaryPassword: true,
      failedAttempts: 0,
    },
    auditLogs: [
      {
        id: 'log-init',
        action: 'SISTEMA_INICIADO',
        entity: 'Sistema',
        details: 'Banco de dados inicializado com sucesso para Papelaria Recriar.',
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export function getDatabase(): AppDatabase {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      memoryDb = JSON.parse(data);
      if (memoryDb) return memoryDb;
    }
  } catch (err) {
    console.error('Erro ao ler DB do disco, inicializando em memória:', err);
  }

  memoryDb = getInitialDb();
  saveDatabase(memoryDb);
  return memoryDb;
}

export function saveDatabase(db: AppDatabase): void {
  memoryDb = db;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao gravar DB no disco:', err);
  }
}

export function logAudit(action: string, entity: string, details: string, entityId?: string) {
  const db = getDatabase();
  db.auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    action,
    entity,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  });
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
  saveDatabase(db);
}
