import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

// Database Connection URL (e.g. from Neon Postgres console)
// Supported in process.env.DATABASE_URL
const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

let pool: any = null;
let useLocalFileFallback = true;
const FALLBACK_FILE_PATH = path.join(process.cwd(), 'data_store.json');

// Initialize local JSON storage fallback
if (!fs.existsSync(FALLBACK_FILE_PATH)) {
  const initialSchema = {
    users: [],
    transactions: [
      {
        id: 't_init',
        user_email: 'asifulislam268@gmail.com',
        type: 'earning',
        amount: 250.00,
        title: 'একাউন্ট বোনাস ও সাইনআপ বোনাস',
        date: '2026-06-02 10:42',
        status: 'success'
      }
    ],
    completed_jobs: []
  };
  fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(initialSchema, null, 2), 'utf-8');
}

// Helper to interact with Local JSON storage
export function getLocalStore() {
  try {
    const data = fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read fallback database, resetting...', err);
    return { users: [], transactions: [], completed_jobs: [] };
  }
}

export function saveLocalStore(data: any) {
  try {
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to fallback database:', err);
  }
}

// Attempt to initialize PG Pool if connection string exists
if (dbUrl) {
  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false } // Required for Neon secure connection
    });
    console.log('🔌 Connecting to Neon PostgreSQL Database...');
    useLocalFileFallback = false;
  } catch (error) {
    console.error('❌ Failed to create PG Connection pool, falling back to JSON store:', error);
    useLocalFileFallback = true;
  }
} else {
  console.log('ℹ️ No DATABASE_URL specified. Running with fallback Local JSON Database storage (data_store.json).');
  useLocalFileFallback = true;
}

// Function to bootstrap PostgreSQL table schemas
export async function initializeDatabase() {
  if (useLocalFileFallback) {
    console.log('✅ Local File Database Initialized successfully.');
    return;
  }

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon Postgres! Bootstrapping table schemas...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL,
        wallet_balance NUMERIC(12, 2) DEFAULT 250.00,
        today_earnings NUMERIC(12, 2) DEFAULT 0.00,
        total_earnings NUMERIC(12, 2) DEFAULT 250.00,
        rank_status VARCHAR(100) DEFAULT 'Bronze Manager Lvl 1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(100) PRIMARY KEY,
        user_email VARCHAR(150) NOT NULL,
        type VARCHAR(20) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'success',
        payment_method VARCHAR(50),
        recipient VARCHAR(50)
      );
    `);

    // Completed jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS completed_jobs (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(150) NOT NULL,
        job_id VARCHAR(100) NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_email, job_id)
      );
    `);

    client.release();
    console.log('🚀 Neon PostgreSQL DB bootstrap finished successfully!');
  } catch (err) {
    console.error('❌ database bootstrap failure, falling back to local file-based database:', err);
    useLocalFileFallback = true;
  }
}

// Core DB operations helper
export async function queryDb(text: string, params: any[] = []) {
  if (!useLocalFileFallback && pool) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.error(`Postgres Query failed: "${text}"`, err);
      throw err;
    }
  }

  // File fallback simulation
  const store = getLocalStore();
  
  if (text.trim().startsWith('SELECT') && (text.includes('FROM users WHERE email =') || text.includes('OR phone ='))) {
    const emailParam = params[0];
    const user = store.users.find((u: any) => u.email.toLowerCase() === emailParam.toLowerCase() || u.phone === emailParam);
    return { rows: user ? [user] : [] };
  }

  if (text.includes('INSERT INTO users')) {
    // text: INSERT INTO users(name, phone, email, password) VALUES($1, $2, $3, $4) RETURNING *
    const newUser = {
      id: store.users.length + 1,
      name: params[0],
      phone: params[1],
      email: params[2].toLowerCase(),
      password: params[3],
      wallet_balance: 250.00,
      today_earnings: 0.00,
      total_earnings: 250.00,
      rank_status: 'Bronze Manager Lvl 1'
    };
    store.users.push(newUser);
    saveLocalStore(store);
    return { rows: [newUser] };
  }

  if (text.includes('UPDATE users SET wallet_balance =')) {
    // UPDATE users SET wallet_balance = $1, today_earnings = $2, total_earnings = $3 WHERE email = $4
    const email = params[3].toLowerCase();
    const userIdx = store.users.findIndex((u: any) => u.email.toLowerCase() === email);
    if (userIdx !== -1) {
      store.users[userIdx].wallet_balance = Number(params[0]);
      store.users[userIdx].today_earnings = Number(params[1]);
      store.users[userIdx].total_earnings = Number(params[2]);
      saveLocalStore(store);
      return { rows: [store.users[userIdx]] };
    }
    return { rows: [] };
  }

  if (text.includes('INSERT INTO transactions')) {
    // INSERT INTO transactions(id, user_email, type, amount, title, date, status, payment_method, recipient)
    const newTx = {
      id: params[0],
      user_email: params[1].toLowerCase(),
      type: params[2],
      amount: Number(params[3]),
      title: params[4],
      date: params[5],
      status: params[6] || 'success',
      payment_method: params[7] || null,
      recipient: params[8] || null
    };
    store.transactions.unshift(newTx);
    saveLocalStore(store);
    return { rows: [newTx] };
  }

  if (text.includes('SELECT * FROM transactions WHERE user_email =')) {
    const email = params[0].toLowerCase();
    const filtered = store.transactions.filter((t: any) => t.user_email.toLowerCase() === email);
    return { rows: filtered };
  }

  if (text.includes('SELECT job_id FROM completed_jobs WHERE user_email =')) {
    const email = params[0].toLowerCase();
    const completed = store.completed_jobs
      .filter((cj: any) => cj.user_email.toLowerCase() === email)
      .map((cj: any) => ({ job_id: cj.job_id }));
    return { rows: completed };
  }

  if (text.includes('INSERT INTO completed_jobs')) {
    const email = params[0].toLowerCase();
    const jobId = params[1];
    const exists = store.completed_jobs.some((cj: any) => cj.user_email.toLowerCase() === email && cj.job_id === jobId);
    if (!exists) {
      store.completed_jobs.push({
        id: store.completed_jobs.length + 1,
        user_email: email,
        job_id: jobId,
        completed_at: new Date().toISOString()
      });
      saveLocalStore(store);
    }
    return { rows: [{ user_email: email, job_id: jobId }] };
  }

  return { rows: [] };
}
