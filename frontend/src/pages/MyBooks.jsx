import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyBooks = () => {
  const [loans, setLoans] = useState([]);
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // 1. Fetch active book loans
    const fetchLoans = fetch('http://localhost:5000/api/loans', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []);

    // 2. Fetch user profile to get purchased book ID references
    const fetchProfileData = fetch('http://localhost:5000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : null);

    // 3. Fetch all inventory books to map details for purchased items
    const fetchInventory = fetch('http://localhost:5000/api/books').then(res => res.ok ? res.json() : []);

    Promise.all([fetchLoans, fetchProfileData, fetchInventory])
      .then(([loansData, profileData, inventoryData]) => {
        setLoans(Array.isArray(loansData) ? loansData : []);
        
        // Map full book data details for items the user has purchased
        if (profileData && Array.isArray(inventoryData)) {
          const storedUserString = localStorage.getItem('user');
          const fullUserObj = storedUserString ? JSON.parse(storedUserString) : {};
          const purchasedIds = fullUserObj.purchased_books || [];
          
          const filteredPurchased = inventoryData.filter(book => purchasedIds.includes(book._id));
          setPurchasedBooks(filteredPurchased);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading user ledger history:", err);
        setLoading(false);
      });
  }, [navigate]);

  const handleReturnBook = async (loanId, bookId) => {
    if (actionLoading) return;
    setActionLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/return', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loanId })
      });

      if (response.ok) {
        // 🔥 RULE 1 ACCORDING TO YOUR REQUEST: Teleport borrowers straight to review page on return!
        navigate(`/write-review/${bookId}?source=return`);
      } else {
        alert("Failed to settle return parameters with backend.");
        setActionLoading(false);
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-500 flex items-center justify-center font-mono text-xs uppercase tracking-widest animate-pulse">
        Synchronizing Personal Ledger History...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 sm:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate('/profile')} 
          className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-colors mb-8"
        >
          ← Back to Account Hub
        </button>

        <div className="border-b border-slate-800 pb-6 mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Digital Ledger History</h1>
          <p className="text-sm text-slate-400 mt-1">Manage active catalog checkouts, leases, and permanent volume acquisitions.</p>
        </div>

        {/* SECTION 1: ACTIVE BORROWED LOANS */}
        <div className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Active Standard Leases
          </h2>
          
          {loans.length === 0 ? (
            <div className="bg-[#1E293B] border border-slate-800/60 p-6 rounded-xl text-center text-xs text-slate-500 italic">
              No active open loan records detected on this account track.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map((loan) => (
                <div key={loan.loan_id} className="bg-[#1E293B] border border-slate-800/80 p-5 rounded-xl shadow-md flex justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-tight">{loan.title}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Issued: <span className="font-mono">{loan.borrowed_at}</span></p>
                    <p className="text-[11px] text-indigo-400 font-medium mt-0.5">Return Deadline: <span className="font-mono font-bold">{loan.due_date}</span></p>
                  </div>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleReturnBook(loan.loan_id, loan.book_id)}
                    className="bg-slate-800 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-900 text-slate-200 hover:text-indigo-400 font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow-sm shrink-0"
                  >
                    {actionLoading ? 'Closing...' : 'Return Volume'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: PERMANENT ACQUISITIONS */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Permanent Digital Acquisitions
          </h2>
          
          {purchasedBooks.length === 0 ? (
            <div className="bg-[#1E293B] border border-slate-800/60 p-6 rounded-xl text-center text-xs text-slate-500 italic">
              No digital vault assets purchased outright yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchasedBooks.map((book) => (
                <div key={book._id} className="bg-[#1E293B] border border-slate-800/80 p-5 rounded-xl shadow-md flex justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-tight">{book.title}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">by {book.author}</p>
                    <span className="inline-block text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase mt-2">
                      Owned Asset
                    </span>
                  </div>
                  
                  {/* 🔥 RULE 2 ACCORDING TO YOUR REQUEST: Direct link to write a review with 'source=purchase' */}
                  <button
                    onClick={() => navigate(`/write-review/${book._id}?source=purchase`)}
                    className="bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow-sm shrink-0"
                  >
                    Write Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyBooks;