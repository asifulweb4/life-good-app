import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';

interface AdminPanelProps {
  adminEmail: string;
}

export default function AdminPanel({ adminEmail }: AdminPanelProps) {
  const [pendingTx, setPendingTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/admin/pending-transactions?email=${adminEmail}`);
      
      const text = await res.text();
      if (text.trim().toLowerCase().startsWith('<!doctype')) {
        throw new Error('সার্ভারটি এখনো পুরনো কোডে চলছে! দয়া করে টার্মিনাল থেকে `Ctrl + C` চেপে সার্ভার বন্ধ করুন এবং আবার `npm run dev` দিন।');
      }

      if (!res.ok) {
        let errorMsg = 'Failed to fetch pending transactions';
        try { const data = JSON.parse(text); errorMsg = data.error; } catch(e) {}
        throw new Error(errorMsg);
      }
      
      const data = JSON.parse(text);
      setPendingTx(data.transactions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (txId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/${action}-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, transactionId: txId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(`Transaction ${action}d successfully!`);
      fetchPending();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-purple-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <ShieldCheck size={28} className="text-pink-400" />
            Admin Dashboard
          </h2>
          <p className="text-purple-200 text-sm mt-1">Manage Deposits & Withdrawals</p>
        </div>
        <button 
          onClick={fetchPending}
          className="p-3 bg-purple-800 hover:bg-purple-700 rounded-xl transition-colors"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Pending Requests</h3>
        
        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm flex gap-2 items-center mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {pendingTx.length === 0 && !loading ? (
          <div className="text-center py-10 text-gray-400">
            No pending transactions!
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTx.map(tx => (
              <div key={tx.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {tx.type}
                    </span>
                    <span className="text-sm font-mono text-gray-500">{tx.date}</span>
                  </div>
                  <h4 className="font-bold text-gray-800">{tx.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">User: <span className="font-mono text-purple-700 font-semibold">{tx.user_email}</span></p>
                  {tx.payment_method && (
                    <p className="text-xs text-gray-500">Method: {tx.payment_method} | Account/TrxID: {tx.recipient}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xl font-black text-gray-900">{tx.amount.toFixed(2)} ৳</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(tx.id, 'reject')}
                      className="p-2 bg-white text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-100 transition-colors"
                      title="Reject"
                    >
                      <XCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleAction(tx.id, 'approve')}
                      className="p-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg shadow-md shadow-emerald-200 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
