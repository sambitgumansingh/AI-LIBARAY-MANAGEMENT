import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/wishlist', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setWishlist(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error loading wishlist:", err);
      setLoading(false);
    });
  }, []);

  const handleRemove = async (e, bookId) => {
    e.stopPropagation(); // Prevents clicking the card when clicking the remove button
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookId })
      });
      if (res.ok) {
        // Instantly filter out from state
        setWishlist(prev => prev.filter(book => book._id !== bookId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-400 flex items-center justify-center text-xs tracking-widest uppercase font-mono">
        Syncing Secure Ledger...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 sm:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate('/profile')} 
          className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-colors mb-6"
        >
          ← Back to Account Hub
        </button>

        <div className="border-b border-slate-800 pb-6 mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">Saved Wishlist</h1>
          <p className="text-sm text-slate-400 mt-1">Curated volumes reserved for your academic tracks.</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-16 text-center shadow-xl max-w-xl mx-auto">
            <span className="text-3xl block mb-4">✨</span>
            <p className="text-slate-300 font-medium">Your wishlist index is empty.</p>
            <p className="text-xs text-slate-500 mt-1 mb-6">Explore the master catalog to save interesting reading items.</p>
            <button 
              onClick={() => navigate('/Dashboard')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/10"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((book) => (
              <div 
                key={book._id}
                onClick={() => navigate(`/book/${book._id}`)}
                className="bg-[#1E293B] border border-slate-800/60 rounded-xl overflow-hidden hover:border-indigo-500/40 transition-all cursor-pointer shadow-xl flex flex-col justify-between group relative"
              >
                <div className="p-5 flex gap-4">
                  <img 
                    src={book.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'} 
                    alt={book.title} 
                    className="w-20 h-28 object-cover rounded-md shadow-md border border-slate-700/30"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {book.category}
                    </span>
                    <h3 className="font-bold text-base text-white truncate mt-2 group-hover:text-indigo-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">by {book.author}</p>
                    <p className="text-xs text-emerald-400 font-semibold mt-3">${book.price || '14.99'}</p>
                  </div>
                </div>

                <div className="bg-[#131C2E] border-t border-slate-800/80 px-5 py-3 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {book.available > 0 ? `${book.available} copies left` : 'Out of Stock'}
                  </span>
                  <button 
                    onClick={(e) => handleRemove(e, book._id)}
                    className="text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded"
                  >
                    Remove
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

export default Wishlist;