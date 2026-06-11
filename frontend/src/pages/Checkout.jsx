import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const transactionType = searchParams.get('type'); // Reads 'borrow' or 'purchase' from route query
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [enteredLibraryId, setEnteredLibraryId] = useState('');

  // 🔥 NEW: State metrics for custom lease data collection parameters
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDueStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultDueStr);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Extract user details securely cached inside local storage variables
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Student', email: 'Unknown', library_id: 'BH-NOT-FOUND' };

  useEffect(() => {
    fetch(`http://localhost:5000/api/book/${id}`)
      .then(res => res.json())
      .then(data => {
        setBook(data);
        setLoading(false);
      })
      .catch(() => {
        setStatus({ type: 'error', message: 'Failed to synchronize inventory parameters from cloud.' });
        setLoading(false);
      });
  }, [id]);

  const handleConfirmTransaction = async () => {
    setStatus({ type: '', message: '' });

    // 1. SECURITY IDENTITY GATEWAY CHECK
    if (enteredLibraryId.trim().toUpperCase() !== user.library_id?.toUpperCase()) {
      setStatus({ 
        type: 'error', 
        message: `Validation Exception: Card ID does not match account card signature (${user.library_id || "Verify in Profile"}).` 
      });
      return;
    }

    // 2. ADDITIONAL CONDITIONAL LEASE FORMS INPUT VALIDATION
    if (transactionType === 'borrow') {
      if (!phone.trim()) {
        setStatus({ type: 'error', message: 'Validation Exception: A phone contact string is mandatory for administrative oversight tracking.' });
        return;
      }
      if (new Date(endDate) <= new Date(startDate)) {
        setStatus({ type: 'error', message: 'Validation Exception: Specified end timeline selection must exceed start deployment date.' });
        return;
      }
    }

    setStatus({ type: 'loading', message: 'Processing ledger adjustments across database...' });
    const token = localStorage.getItem('token');
    const targetEndpoint = transactionType === 'purchase' ? 'purchase' : 'borrow';

    try {
      const response = await fetch(`http://localhost:5000/api/${targetEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          bookId: id,
          // Forwarding custom configuration details straight to Atlas cluster
          startDate: transactionType === 'borrow' ? startDate : null,
          endDate: transactionType === 'borrow' ? endDate : null,
          phone: transactionType === 'borrow' ? phone : null,
          notes: transactionType === 'borrow' ? notes : null
        })
      });
      
      if (response.status === 401) {
        setStatus({ type: 'error', message: '⚠️ Session expired or invalid. Re-routing to authentication gate...' });
        localStorage.clear();
        setTimeout(() => navigate('/login'), 2500);
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setStatus({ type: 'success', message: data.message });
        
        // Auto-update local cache parameters with fresh database parameters
        fetch('http://localhost:5000/api/auth/profile', { 
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(freshUser => {
            localStorage.setItem('user', JSON.stringify(freshUser));
          });

        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Transaction transaction refused by server node.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Communication fault reaching cloud network system node.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">
        Initializing Secure Transaction Gate...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 sm:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-2xl mx-auto">
        
        <button 
          onClick={() => navigate(-1)} 
          className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-colors mb-6"
        >
          ← Abort & Return to Index
        </button>

        <div className="bg-[#1E293B] border border-slate-800 p-6 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-8 border-b border-slate-800 pb-6">
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">
              Secure Checkout Statement
            </h1>
            <p className="text-slate-400 text-xs font-medium mt-1">Review operational ledger parameters before execution.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-[#0F172A]/50 p-5 rounded-xl border border-slate-800/60 mb-6">
            <img 
              src={book?.image_url} 
              alt="Cover Allocation" 
              className="w-24 rounded shadow-md border border-slate-800"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500';
              }}
            />
            <div className="flex-1 w-full text-center sm:text-left">
              <h2 className="text-lg font-bold text-white tracking-tight">{book?.title}</h2>
              <p className="text-xs text-indigo-400 font-semibold mt-0.5">by {book?.author}</p>
              
              <div className="space-y-2 text-xs border-t border-slate-800 mt-4 pt-4 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Owner email:</span>
                  <span className="text-slate-200 font-mono">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction Classification:</span>
                  <span className={`font-bold uppercase tracking-wider text-[10px] ${
                    transactionType === 'purchase' ? 'text-emerald-400' : 'text-indigo-400'
                  }`}>
                    {transactionType === 'purchase' ? 'Outright Purchase Asset' : 'Standard Custom Lease'}
                  </span>
                </div>
                
                {transactionType === 'purchase' && (
                  <div className="flex justify-between border-t border-slate-800 mt-3 pt-3">
                    <span className="text-slate-200 font-bold">Total Statement Fee:</span>
                    <span className="text-emerald-400 font-bold text-base">${book?.price || '14.99'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🔥 NEW DYNAMIC SECTION: RENDER CUSTOM FORM GATES IF TRANSACTION CLASSIFICATION IS BORROW 🔥 */}
          {transactionType === 'borrow' && (
            <div className="mb-6 bg-[#0F172A]/40 border border-slate-800 p-5 rounded-xl space-y-4">
              <h3 className="text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
                📋 Custom Lease Schedule Parameters
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Start Tracking Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Expected Return Deadline</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Active Contact Phone Number (Required)</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Alternative Communications / Admin Notes</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Preferred alternative email address or delivery track updates..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 🔥 STRICT FINE COMPLIANCE WARNING BLOCK RULE 🔥 */}
              <div className="text-[11px] text-amber-400 font-medium bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg leading-relaxed">
                <span className="font-bold">⚠️ Overdue Regulation Mandate:</span> If this asset selection exceeds your selected return deadline date (<span className="font-mono font-bold text-white">{endDate}</span>), a strict overdue fine of <span className="font-bold text-white">$1.50 per day</span> will automatically scale against your preloaded account balance metrics.
              </div>
            </div>
          )}

          {/* DYNAMIC SECURITY VERIFICATION MANDATE INPUT BOX */}
          <div className="mb-6 bg-[#0F172A]/30 border border-slate-800 p-4 rounded-xl">
            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 text-center">
              Enter Unique Library Card ID Signature To Sign Order
            </label>
            <input 
              type="text" 
              placeholder="e.g. BH-000000" 
              value={enteredLibraryId}
              onChange={(e) => setEnteredLibraryId(e.target.value)}
              disabled={status.type === 'loading'}
              className="w-full text-center py-2.5 bg-[#0F172A] border border-slate-700/80 rounded-lg text-white font-mono uppercase tracking-widest font-black focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all placeholder-slate-600"
            />
          </div>

          {/* Dynamic Transaction Runtime Message Displays */}
          {status.message && (
            <div className={`p-4 rounded-lg text-xs font-semibold mb-6 text-center border ${
              status.type === 'success' ? 'bg-[#0F172A] text-emerald-400 border-emerald-500/20' : 
              status.type === 'error' ? 'bg-rose-950/20 text-rose-400 border-rose-500/20' : 
              'bg-[#0F172A] text-amber-400 border-amber-500/20 animate-pulse'
            }`}>
              {status.message}
            </div>
          )}

          {/* Transaction Core Trigger Action Button */}
          <button 
            onClick={handleConfirmTransaction}
            disabled={status.type === 'loading'}
            className={`w-full py-4 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-md ${
              transactionType === 'purchase' 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
            } ${status.type === 'loading' ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.99]'}`}
          >
            {status.type === 'loading' ? 'Settling Assets...' : `Authorize ${transactionType === 'purchase' ? 'Purchase Order' : 'Loan Agreement'}`}
          </button>

        </div>
      </div>
    </div>
  );
};

export default Checkout;