import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const transactionType = searchParams.get('type'); // Reads 'borrow' or 'purchase' parameters from route URL
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // 🔥 NEW: State tracking input for structural signature validation
  const [enteredLibraryId, setEnteredLibraryId] = useState('');

  // Extract user details securely cached inside local storage
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
        setStatus({ type: 'error', message: 'Failed to synchronize inventory parameters.' });
        setLoading(false);
      });
  }, [id]);

  const handleConfirmTransaction = async () => {
    setStatus({ type: '', message: '' });

    // 🔥 SECURITY VERIFICATION GATEWAY 🔥
    if (enteredLibraryId.trim().toUpperCase() !== user.library_id?.toUpperCase()) {
      setStatus({ 
        type: 'error', 
        message: `Validation Exception: The token entered does not match your verified profile identity card signature (${user.library_id || "Verify in Profile"}).` 
      });
      return;
    }

    setStatus({ type: 'loading', message: 'Processing transaction nodes securely...' });
    const token = localStorage.getItem('token');

    // Simulate active transaction state settlement
    setTimeout(() => {
        setStatus({ 
          type: 'success', 
          message: `Transaction settled. You have successfully ${transactionType === 'purchase' ? 'claimed permanent ownership of' : 'borrowed'} this catalog volume.`
        });
        setTimeout(() => navigate('/my-books'), 2000); 
    }, 1500);
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
        
        {/* Navigation Escape Route */}
        <button 
          onClick={() => navigate(-1)} 
          className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-colors mb-6"
        >
          ← Abort & Return to Index
        </button>

        {/* Master Invoice Shell Card */}
        <div className="bg-[#1E293B] border border-slate-800 p-6 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-8 border-b border-slate-800 pb-6">
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">
              Secure Checkout Statement
            </h1>
            <p className="text-slate-400 text-xs font-medium mt-1">Review operational ledger parameters before execution.</p>
          </div>

          {/* Item Meta Properties Summary Subpanel */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-[#0F172A]/50 p-5 rounded-xl border border-slate-800/60 mb-6">
            <img 
              src={book?.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'} 
              alt="Cover Allocation" 
              className="w-24 rounded shadow-md border border-slate-800"
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
                    {transactionType === 'purchase' ? 'Outright Purchase Asset' : 'Standard 14-Day Lease'}
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

          {/* 🔥 DYNAMIC SECURITY VERIFICATION MANDATE INPUT BOX 🔥 */}
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