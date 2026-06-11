import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PurchasedBooks = () => {
  const [purchasedList, setPurchasedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // 1. Fetch fresh profile data to see what items are owned
    const fetchProfile = fetch('http://localhost:5000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());

    // 2. Fetch all books from inventory to cross-reference details
    const fetchInventory = fetch('http://localhost:5000/api/books').then(res => res.json());

    Promise.all([fetchProfile, fetchInventory])
      .then(([profileData, inventoryData]) => {
        const ownedIds = profileData.purchased_books || [];
        if (Array.isArray(inventoryData)) {
          // Filter down to show only the books the user has purchased
          const filtered = inventoryData.filter(book => ownedIds.includes(book._id));
          setPurchasedList(filtered);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error synchronizing purchased digital assets:", err);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-500 flex items-center justify-center font-mono text-xs uppercase tracking-widest animate-pulse">
        Decrypting owned digital vault assets...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 sm:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        
        <button 
          onClick={() => navigate('/profile')} 
          className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-colors mb-6"
        >
          ← Back to Account Hub
        </button>

        <div className="border-b border-slate-800 pb-6 mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Digital Vault Assets</h1>
          <p className="text-sm text-slate-400 mt-1">Volumes purchased outright with permanent digital ownership parameters.</p>
        </div>

        {purchasedList.length === 0 ? (
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-16 text-center shadow-xl max-w-xl mx-auto">
            <span className="text-3xl block mb-4">🛍️</span>
            <p className="text-slate-300 font-medium">Your permanent digital vault is empty.</p>
            <p className="text-xs text-slate-500 mt-1 mb-6">Purchased books will appear here with a verified reader badge assignment link.</p>
            <button 
              onClick={() => navigate('/Dashboard')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-all shadow-md shadow-emerald-600/10"
            >
              Browse Master Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedList.map((book) => (
              <div 
                key={book._id}
                onClick={() => navigate(`/book/${book._id}`)}
                className="bg-[#1E293B] border border-slate-800/60 rounded-xl overflow-hidden hover:border-emerald-500/40 transition-all cursor-pointer shadow-xl flex flex-col justify-between group"
              >
                <div className="p-5 flex gap-4">
                  <img 
                    src={book.image_url} 
                    alt={book.title} 
                    className="w-20 h-28 object-cover rounded shadow-md border border-slate-800/40"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {book.category}
                    </span>
                    <h3 className="font-bold text-sm text-white truncate mt-2 group-hover:text-emerald-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">by {book.author}</p>
                  </div>
                </div>

                <div className="bg-[#131C2E] border-t border-slate-800/80 px-5 py-3 flex justify-between items-center">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                    ✓ Verified Owner
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Stops the card click navigation event from firing
                      navigate(`/write-review/${book._id}?source=purchase`);
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 px-3 py-1.5 rounded transition-all border border-indigo-500/20"
                  >
                    Write Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default PurchasedBooks;