import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase, queryDb } from './db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing requests
  app.use(express.json());

  // Bootstrap structural schemas in Neon PostgreSQL (or fallback file DB)
  await initializeDatabase();

  // --- API ROUTE: Registration ---
  app.post('/api/register', async (req, res) => {
    try {
      const { name, phone, email, password, referCode } = req.body;

      if (!name || !phone || !email || !password) {
        return res.status(400).json({ error: 'সবগুলো ইনপুট ফিল্ড সঠিকভাবে পূরণ করুন।' });
      }

      // Check if user already exists
      const existing = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'এই ইমেইল দিয়ে ইতিপূর্বে একাউন্ট খোলা হয়েছে।' });
      }

      // In real prod, hash the password. For our visual simulation, we store text or simple representation.
      const result = await queryDb(
        'INSERT INTO users(name, phone, email, password) VALUES($1, $2, $3, $4) RETURNING *',
        [name, phone, email.toLowerCase(), password]
      );

      const user = result.rows[0];

      // Handle referral bonus if a valid referCode is provided
      if (referCode) {
        // Find referrer. For simplistic demonstration, we add to referrer balance or create referral log.
        // We'll insert a referral transaction record for demonstration
        await queryDb(
          'INSERT INTO transactions(id, user_email, type, amount, title, date, status) VALUES($1, $2, $3, $4, $5, $6, $7)',
          [`tx_ref_${Date.now()}`, email.toLowerCase(), 'earning', 50.00, `রেফারেল সাইনআপ বোনাস (কোড: ${referCode})`, new Date().toISOString().replace('T', ' ').substring(0, 16), 'success']
        );
        
        // Update current user balance if refer code gets them more money
        const newBalance = Number(user.wallet_balance || 250.00) + 50.00;
        await queryDb(
          'UPDATE users SET wallet_balance = $1, total_earnings = $2 WHERE email = $3',
          [newBalance, newBalance, email.toLowerCase()]
        );
        user.wallet_balance = newBalance;
        user.total_earnings = newBalance;
      }

      res.status(201).json({
        success: true,
        message: 'নিবন্ধন সফল হয়েছে!',
        user: {
          name: user.name,
          phone: user.phone,
          email: user.email,
          wallet_balance: Number(user.wallet_balance),
          today_earnings: Number(user.today_earnings),
          total_earnings: Number(user.total_earnings),
          rank_status: user.rank_status
        }
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'সার্ভার ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।' });
    }
  });

  // --- API ROUTE: Login ---
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন।' });
      }

      // Check by email OR phone
      const result = await queryDb('SELECT * FROM users WHERE email = $1 OR phone = $1', [email.toLowerCase()]);
      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'প্রদত্ত ইমেইল/নম্বরটি নিবন্ধিত নয়।' });
      }

      const user = result.rows[0];
      if (user.password !== password) {
        return res.status(400).json({ error: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' });
      }

      res.json({
        success: true,
        message: 'লগইন সফল হয়েছে!',
        user: {
          name: user.name,
          phone: user.phone,
          email: user.email,
          wallet_balance: Number(user.wallet_balance),
          today_earnings: Number(user.today_earnings),
          total_earnings: Number(user.total_earnings),
          rank_status: user.rank_status
        }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'সার্ভার ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।' });
    }
  });

  // --- API ROUTE: Get Profile & Stats ---
  app.get('/api/user-profile', async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: 'ইমেইল নির্দেশ করা প্রয়োজন।' });
      }

      const userResult = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
      }

      const user = userResult.rows[0];
      const txResult = await queryDb('SELECT * FROM transactions WHERE user_email = $1 ORDER BY date DESC', [email.toLowerCase()]);
      const jobsResult = await queryDb('SELECT job_id FROM completed_jobs WHERE user_email = $1', [email.toLowerCase()]);

      res.json({
        user: {
          name: user.name,
          phone: user.phone,
          email: user.email,
          wallet_balance: Number(user.wallet_balance),
          today_earnings: Number(user.today_earnings),
          total_earnings: Number(user.total_earnings),
          rank_status: user.rank_status
        },
        transactions: txResult.rows,
        completedJobIds: jobsResult.rows.map((row: any) => row.job_id)
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
    }
  });

  // --- API ROUTE: Complete Interactive / Standard Job ---
  app.post('/api/complete-job', async (req, res) => {
    try {
      const { email, jobId, reward, title } = req.body;

      if (!email || !jobId || reward === undefined) {
        return res.status(400).json({ error: 'অসম্পূর্ণ ডেটা টেমপ্লেট।' });
      }

      // Check if already completed
      const checkResult = await queryDb('SELECT * FROM completed_jobs WHERE user_email = $1 AND job_id = $2', [email.toLowerCase(), jobId]);
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'আপনি ইতিপূর্বে কাজটি সম্পন্ন করেছেন!' });
      }

      // Record job completion
      await queryDb('INSERT INTO completed_jobs(user_email, job_id) VALUES($1, $2)', [email.toLowerCase(), jobId]);

      // Add to user funds
      const userResult = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        const newBalance = Number(user.wallet_balance) + Number(reward);
        const newToday = Number(user.today_earnings) + Number(reward);
        const newTotal = Number(user.total_earnings) + Number(reward);

        await queryDb(
          'UPDATE users SET wallet_balance = $1, today_earnings = $2, total_earnings = $3 WHERE email = $4',
          [newBalance, newToday, newTotal, email.toLowerCase()]
        );

        // Record Earning transaction
        const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        await queryDb(
          'INSERT INTO transactions(id, user_email, type, amount, title, date, status) VALUES($1, $2, $3, $4, $5, $6, $7)',
          [`tx_job_${Date.now()}`, email.toLowerCase(), 'earning', reward, title, dateStr, 'success']
        );

        return res.json({
          success: true,
          reward,
          wallet_balance: newBalance,
          today_earnings: newToday,
          total_earnings: newTotal
        });
      }

      res.status(404).json({ error: 'ব্যবহারকারী খুজে পাওয়া যায়নি।' });
    } catch (err) {
      console.error('Job completion error:', err);
      res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
    }
  });

  // --- API ROUTE: Submit Withdraw ---
  app.post('/api/submit-withdraw', async (req, res) => {
    try {
      const { email, amount, method, recipient } = req.body;
      if (!email || !amount || !method || !recipient) {
        return res.status(400).json({ error: 'সবগুলো ইনপুট ফিল্ড সঠিকভাবে পূরণ করুন।' });
      }

      const userResult = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
      }

      const user = userResult.rows[0];
      if (Number(user.wallet_balance) < Number(amount)) {
        return res.status(400).json({ error: 'অপর্যাপ্ত ব্যালেন্স! আপনার একাউন্টে পর্যাপ্ত টাকা নেই।' });
      }

      const newBalance = Number(user.wallet_balance) - Number(amount);
      await queryDb(
        'UPDATE users SET wallet_balance = $1 WHERE email = $2',
        [newBalance, email.toLowerCase()]
      );

      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      await queryDb(
        'INSERT INTO transactions(id, user_email, type, amount, title, date, status, payment_method, recipient) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [`tx_with_${Date.now()}`, email.toLowerCase(), 'withdrawal', amount, `ক্যাশআউট রিকোয়েস্ট (${method})`, dateStr, 'pending', method, recipient]
      );

      res.json({
        success: true,
        wallet_balance: newBalance,
        message: 'ক্যাশআউট রিকোয়েস্ট সফলভাবে সাবমিট করা হয়েছে এবং এটি পেন্ডিং রয়েছে।'
      });
    } catch (err) {
      console.error('Withdraw request error:', err);
      res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
    }
  });

  // --- API ROUTE: Submit Deposit ---
  app.post('/api/submit-deposit', async (req, res) => {
    try {
      const { email, amount, method, sender, transactionId } = req.body;
      if (!email || !amount || !method || !sender || !transactionId) {
        return res.status(400).json({ error: 'সবগুলো ইনপুট ফিল্ড সঠিকভাবে পূরণ করুন।' });
      }

      const depositAmt = Number(amount);
      if (isNaN(depositAmt) || depositAmt <= 0) {
        return res.status(400).json({ error: 'সঠিক ডিপোজিট অ্যামাউন্ট প্রদান করুন।' });
      }

      const userResult = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
      }

      const user = userResult.rows[0];

      // DO NOT update balance immediately. Admin must approve.
      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      
      // Save deposit record as 'pending' with transaction id and sender info
      await queryDb(
        'INSERT INTO transactions(id, user_email, type, amount, title, date, status, payment_method, recipient) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [`tx_dep_${Date.now()}`, email.toLowerCase(), 'deposit', depositAmt, `ডিপোজিট রিকোয়েস্ট (${method}) - TrxID: ${transactionId}`, dateStr, 'pending', method, sender]
      );

      res.json({
        success: true,
        wallet_balance: Number(user.wallet_balance), // unchanged
        message: `৳ ${depositAmt} ডিপোজিট রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে! এডমিন ভেরিফাই করলে ব্যালেন্স এড হবে।`
      });
    } catch (err) {
      console.error('Deposit request error:', err);
      res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
    }
  });

  // --- API ROUTE: Submit Charity Donation ---
  app.post('/api/submit-charity', async (req, res) => {
    try {
      const { email, amount } = req.body;

      const userResult = await queryDb('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
      }

      const user = userResult.rows[0];
      if (Number(user.wallet_balance) < Number(amount)) {
        return res.status(400).json({ error: 'অপোর্যাপ্ত ব্যালেন্স।' });
      }

      const newBalance = Number(user.wallet_balance) - Number(amount);
      await queryDb(
        'UPDATE users SET wallet_balance = $1 WHERE email = $2',
        [newBalance, email.toLowerCase()]
      );

      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      await queryDb(
        'INSERT INTO transactions(id, user_email, type, amount, title, date, status) VALUES($1, $2, $3, $4, $5, $6, $7)',
        [`tx_char_${Date.now()}`, email.toLowerCase(), 'withdrawal', amount, 'ইউজার ফান্ড কল্যাণ ট্রাস্ট অনুদান', dateStr, 'success']
      );

      res.json({
        success: true,
        wallet_balance: newBalance,
        message: 'মহৎ অনুদান সফল হয়েছে! ধন্যবাদ আপনার সহযোগিতার জন্য।'
      });
    } catch (err) {
      console.error('Charity error:', err);
      res.status(500).json({ error: 'সার্ভার ত্রুটি।' });
    }
  });

  // --- ADMIN ROUTES ---
  app.get('/api/admin/pending-transactions', async (req, res) => {
    try {
      if (req.query.email !== 'asiful@gmail.com') return res.status(403).json({ error: 'Forbidden' });
      const result = await queryDb("SELECT * FROM transactions WHERE status = 'pending' ORDER BY date DESC");
      res.json({ transactions: result.rows });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/admin/approve-transaction', async (req, res) => {
    try {
      const { adminEmail, transactionId } = req.body;
      if (adminEmail !== 'asiful@gmail.com') return res.status(403).json({ error: 'Forbidden' });

      const txRes = await queryDb("SELECT * FROM transactions WHERE id = $1 AND status = 'pending'", [transactionId]);
      if (txRes.rows.length === 0) return res.status(404).json({ error: 'Transaction not found or not pending' });
      const tx = txRes.rows[0];

      // If deposit, add to user balance. (If withdraw, balance was already deducted on submit).
      if (tx.type === 'deposit') {
        const userRes = await queryDb('SELECT * FROM users WHERE email = $1', [tx.user_email]);
        if (userRes.rows.length > 0) {
          const user = userRes.rows[0];
          const newBal = Number(user.wallet_balance) + Number(tx.amount);
          await queryDb('UPDATE users SET wallet_balance = $1 WHERE email = $2', [newBal, tx.user_email]);
        }
      }

      await queryDb("UPDATE transactions SET status = 'success' WHERE id = $1", [transactionId]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/admin/reject-transaction', async (req, res) => {
    try {
      const { adminEmail, transactionId } = req.body;
      if (adminEmail !== 'asiful@gmail.com') return res.status(403).json({ error: 'Forbidden' });

      const txRes = await queryDb("SELECT * FROM transactions WHERE id = $1 AND status = 'pending'", [transactionId]);
      if (txRes.rows.length === 0) return res.status(404).json({ error: 'Transaction not found or not pending' });
      const tx = txRes.rows[0];

      // If withdraw, refund the deducted balance!
      if (tx.type === 'withdrawal') {
        const userRes = await queryDb('SELECT * FROM users WHERE email = $1', [tx.user_email]);
        if (userRes.rows.length > 0) {
          const user = userRes.rows[0];
          const newBal = Number(user.wallet_balance) + Number(tx.amount);
          await queryDb('UPDATE users SET wallet_balance = $1 WHERE email = $2', [newBal, tx.user_email]);
        }
      }

      await queryDb("UPDATE transactions SET status = 'failed' WHERE id = $1", [transactionId]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // --- API ROUTING FOR VITE AND PRODUCTION ASSETS ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Unified Full-Stack Express Server started on http://localhost:${PORT}`);
  });
}

startServer();
