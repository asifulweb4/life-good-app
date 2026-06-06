import express from 'express';
import { initializeDatabase, queryDb } from '../db.js';

const app = express();
app.use(express.json());

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
}

app.post('/api/register', async (req, res) => {
  await ensureInit();
  try {
    const { name, phone, email, password, referCode } = req.body;
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ error: 'সবগুলো ইনপুট ফিল্ড সঠিকভাবে পূরণ করুন।' });
    }
    const existing = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'এই ইমেইল দিয়ে ইতিপূর্বে একাউন্ট খোলা হয়েছে।' });
    }
    const result = await queryDb(
      'INSERT INTO users(name, phone, email, password) VALUES($1, $2, $3, $4) RETURNING *',
      [name, phone, email.toLowerCase(), password]
    );
    const user = result.rows[0];
    if (referCode) {
      await queryDb(
        'INSERT INTO transactions(id, user_email, type, amount, title, date, status) VALUES($1, $2, $3, $4, $5, $6, $7)',
        [`tx_ref_${Date.now()}`, email.toLowerCase(), 'earning', 50.00, `রেফারেল বোনাস (কোড: ${referCode})`, new Date().toISOString().replace('T', ' ').substring(0, 16), 'success']
      );
      const newBalance = Number(user.wallet_balance || 250.00) + 50.00;
      await queryDb('UPDATE users SET wallet_balance = $1, total_earnings = $2 WHERE email = $3', [newBalance, newBalance, email.toLowerCase()]);
      user.wallet_balance = newBalance;
      user.total_earnings = newBalance;
    }
    res.status(201).json({
      success: true,
      message: 'নিবন্ধন সফল হয়েছে!',
      user: { name: user.name, phone: user.phone, email: user.email, wallet_balance: Number(user.wallet_balance), today_earnings: Number(user.today_earnings), total_earnings: Number(user.total_earnings), rank_status: user.rank_status }
    });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
  }
});

app.post('/api/login', async (req, res) => {
  await ensureInit();
  try {
    const { email, password } = req.body;
    const loginId = (email || '').toString().trim();
    if (!loginId || !password) return res.status(400).json({ error: 'ইমেইল এবং পাসওয়ার্ড দিন।' });
    const result = await queryDb('SELECT * FROM users WHERE lower(email) = $1 OR phone = $2', [loginId.toLowerCase(), loginId]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'প্রদত্ত ইমেইল নিবন্ধিত নয়।' });
    const user = result.rows[0];
    if (user.password !== password) return res.status(400).json({ error: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' });
    res.json({ success: true, user: { name: user.name, phone: user.phone, email: user.email, wallet_balance: Number(user.wallet_balance), today_earnings: Number(user.today_earnings), total_earnings: Number(user.total_earnings), rank_status: user.rank_status } });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
  }
});

app.get('/api/user-profile', async (req, res) => {
  await ensureInit();
  try {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: 'ইমেইল প্রয়োজন।' });
    const userResult = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    const user = userResult.rows[0];
    const txResult = await queryDb('SELECT * FROM transactions WHERE user_email = $1 ORDER BY date DESC', [email.toLowerCase()]);
    const jobsResult = await queryDb('SELECT job_id FROM completed_jobs WHERE user_email = $1', [email.toLowerCase()]);
    res.json({ user: { name: user.name, phone: user.phone, email: user.email, wallet_balance: Number(user.wallet_balance), today_earnings: Number(user.today_earnings), total_earnings: Number(user.total_earnings), rank_status: user.rank_status }, transactions: txResult.rows, completedJobIds: jobsResult.rows.map((r: any) => r.job_id) });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
  }
});

app.post('/api/complete-job', async (req, res) => {
  await ensureInit();
  try {
    const { email, jobId, reward, title } = req.body;
    if (!email || !jobId || reward === undefined) return res.status(400).json({ error: 'অসম্পূর্ণ ডেটা।' });
    const check = await queryDb('SELECT * FROM completed_jobs WHERE user_email = $1 AND job_id = $2', [email.toLowerCase(), jobId]);
    if (check.rows.length > 0) return res.status(400).json({ error: 'আপনি ইতিপূর্বে কাজটি সম্পন্ন করেছেন!' });
    await queryDb('INSERT INTO completed_jobs(user_email, job_id) VALUES($1, $2)', [email.toLowerCase(), jobId]);
    const userResult = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const newBalance = Number(user.wallet_balance) + Number(reward);
      const newToday = Number(user.today_earnings) + Number(reward);
      const newTotal = Number(user.total_earnings) + Number(reward);
      await queryDb('UPDATE users SET wallet_balance = $1, today_earnings = $2, total_earnings = $3 WHERE email = $4', [newBalance, newToday, newTotal, email.toLowerCase()]);
      await queryDb('INSERT INTO transactions(id, user_email, type, amount, title, date, status) VALUES($1, $2, $3, $4, $5, $6, $7)', [`tx_job_${Date.now()}`, email.toLowerCase(), 'earning', reward, title, new Date().toISOString().replace('T', ' ').substring(0, 16), 'success']);
      return res.json({ success: true, reward, wallet_balance: newBalance, today_earnings: newToday, total_earnings: newTotal });
    }
    res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
  }
});

app.post('/api/submit-withdraw', async (req, res) => {
  await ensureInit();
  try {
    const { email, amount, method, recipient } = req.body;
    if (!email || !amount || !method || !recipient) return res.status(400).json({ error: 'সব ফিল্ড পূরণ করুন।' });
    const userResult = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    const user = userResult.rows[0];
    if (Number(user.wallet_balance) < Number(amount)) return res.status(400).json({ error: 'অপর্যাপ্ত ব্যালেন্স!' });
    const newBalance = Number(user.wallet_balance) - Number(amount);
    await queryDb('UPDATE users SET wallet_balance = $1 WHERE email = $2', [newBalance, email.toLowerCase()]);
    await queryDb('INSERT INTO transactions(id, user_email, type, amount, title, date, status, payment_method, recipient) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', [`tx_with_${Date.now()}`, email.toLowerCase(), 'withdrawal', amount, `ক্যাশআউট (${method})`, new Date().toISOString().replace('T', ' ').substring(0, 16), 'pending', method, recipient]);
    res.json({ success: true, wallet_balance: newBalance, message: 'ক্যাশআউট রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে!' });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
  }
});

app.post('/api/submit-deposit', async (req, res) => {
  await ensureInit();
  try {
    const { email, amount, method, sender, transactionId } = req.body;
    if (!email || !amount || !method || !sender || !transactionId) return res.status(400).json({ error: 'সব ফিল্ড পূরণ করুন।' });
    const depositAmt = Number(amount);
    if (isNaN(depositAmt) || depositAmt <= 0) return res.status(400).json({ error: 'সঠিক অ্যামাউন্ট দিন।' });
    const userResult = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    await queryDb('INSERT INTO transactions(id, user_email, type, amount, title, date, status, payment_method, recipient) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', [`tx_dep_${Date.now()}`, email.toLowerCase(), 'deposit', depositAmt, `ডিপোজিট (${method}) - TrxID: ${transactionId}`, new Date().toISOString().replace('T', ' ').substring(0, 16), 'pending', method, sender]);
    res.json({ success: true, message: 'ডিপোজিট আবেদন সফলভাবে সাবমিট হয়েছে!' });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
  }
});

app.get('/api/admin/system-stats', async (req, res) => {
  await ensureInit();
  try {
    const usersRes = await queryDb('SELECT * FROM users');
    const txsRes = await queryDb('SELECT * FROM transactions');
    res.json({ users: usersRes.rows, transactions: txsRes.rows });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
  }
});

app.post('/api/admin/approve-transaction', async (req, res) => {
  await ensureInit();
  try {
    const { id } = req.body;
    const txs = await queryDb('SELECT * FROM transactions WHERE id = $1', [id]);
    if (txs.rows.length === 0) return res.status(404).json({ error: 'ট্রানজেকশন পাওয়া যায়নি।' });
    const tx = txs.rows[0];
    if (tx.type === 'deposit') {
      const userRes = await queryDb('SELECT * FROM users WHERE email = $1', [tx.user_email]);
      if (userRes.rows.length > 0) {
        const newBalance = Number(userRes.rows[0].wallet_balance) + Number(tx.amount);
        await queryDb('UPDATE users SET wallet_balance = $1 WHERE email = $2', [newBalance, tx.user_email]);
      }
    }
    await queryDb('UPDATE transactions SET status = $1 WHERE id = $2', ['success', id]);
    res.json({ success: true, message: 'অনুমোদন সফল!' });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
  }
});

app.post('/api/admin/reject-transaction', async (req, res) => {
  await ensureInit();
  try {
    const { id } = req.body;
    const txs = await queryDb('SELECT * FROM transactions WHERE id = $1', [id]);
    if (txs.rows.length === 0) return res.status(404).json({ error: 'ট্রানজেকশন পাওয়া যায়নি।' });
    const tx = txs.rows[0];
    if (tx.type === 'withdrawal') {
      const userRes = await queryDb('SELECT * FROM users WHERE email = $1', [tx.user_email]);
      if (userRes.rows.length > 0) {
        const newBalance = Number(userRes.rows[0].wallet_balance) + Number(tx.amount);
        await queryDb('UPDATE users SET wallet_balance = $1 WHERE email = $2', [newBalance, tx.user_email]);
      }
    }
    await queryDb('UPDATE transactions SET status = $1 WHERE id = $2', ['failed', id]);
    res.json({ success: true, message: 'প্রত্যাখ্যান সফল!' });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
  }
});

export default app;