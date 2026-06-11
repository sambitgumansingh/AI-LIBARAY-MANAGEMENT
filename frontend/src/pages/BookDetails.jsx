import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]); // 🔥 NEW: Review state array
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // 1. Fetch Book Details
    const fetchBookDetails = fetch(`http://localhost:5000/api/book/${id}`).then(res => res.json());
    
    // 2. Fetch Book Reviews List
    const fetchReviewsList = fetch(`http://localhost:5000/api/book/${id}/reviews`).then(res => res.json());

    // 3. Fetch Wishlist to check saved status
    const fetchWishlist = fetch('http://localhost:5000/api/wishlist', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []);

    Promise.all([fetchBookDetails, fetchReviewsList, fetchWishlist])
      .then(([bookData, reviewsData, wishlistData]) => {
        setBook(bookData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        if (Array.isArray(wishlistData)) {
          setIsWishlisted(wishlistData.some(b => b._id === bookData._id));
        }
        setLoading(false);
      })
      .catch((err) => {
        setErrorMessage("Failed to pull complete volume metadata arrays.");
        setLoading(false);
      });
  }, [id]);

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert("Please log in to save books.");

    try {
      const res = await fetch('http://localhost:5000/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookId: book._id })
      });
      const data = await res.json();
      if (res.ok) {
        setIsWishlisted(data.isSaved);
      }
    } catch (err) {
      setErrorMessage("Failed to update wishlist.");
    }
  };

  const handleBorrowTransaction = () => {
    navigate(`/checkout/${book._id}?type=borrow`);
  };

  const handlePurchaseClick = () => {
    navigate(`/checkout/${book._id}?type=purchase`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-500 flex items-center justify-center font-mono text-xs uppercase tracking-widest animate-pulse">
        Querying inventory details ledger...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 sm:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <button onClick={() => navigate('/Dashboard')} className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-colors">
            ← Back to Catalog Index
          </button>
          <div className="text-xs font-mono text-slate-500">BookHive Directory Shell</div>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-6 sm:p-10 border border-slate-800/80 shadow-2xl flex flex-col md:flex-row gap-10">
          
          {/* Left Panel Cover Area */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="bg-[#0F172A]/50 p-6 rounded-xl flex items-center justify-center border border-slate-800">
              <img 
                src={book.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'} 
                alt={book.title} 
                className="w-full h-auto object-cover rounded shadow-xl hover:scale-[1.01] transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500';
                }}
              />
            </div>
            
            <button 
              onClick={handleWishlistToggle}
              className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                isWishlisted 
                  ? 'bg-rose-950/20 text-rose-400 border-rose-900/40 hover:bg-rose-950/40' 
                  : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {isWishlisted ? '❤️ Saved to Wishlist' : '🤍 Save to Wishlist'}
            </button>
          </div>

          {/* Right Panel Main Data Area */}
          <div className="w-full md:w-2/3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] tracking-wider font-bold uppercase bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded">
                  {book.category}
                </span>
                
                <div className="flex items-center gap-1 bg-[#0F172A] px-2.5 py-1 rounded border border-slate-800">
                  <span className="text-amber-400 text-xs">⭐</span>
                  <span className="text-white font-bold text-xs">{book.rating || '4.8'}</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-extrabold text-white mt-4 tracking-tight leading-tight">{book.title}</h1>
              <p className="text-xs text-slate-400 mt-1 font-medium">Authored by <span className="text-slate-200 font-bold">{book.author}</span></p>
              
              <div className="mt-6 space-y-2 text-xs border-t border-slate-800/80 pt-4 font-medium">
                <p className="text-slate-400 flex justify-between max-w-sm border-b border-slate-800/40 pb-2">
                  <span>Permanent Ownership Fee:</span> 
                  <span className="text-emerald-400 font-bold text-sm">${book.price || '14.99'}</span>
                </p>
                <p className="text-slate-400 flex justify-between max-w-sm pb-2 border-b border-slate-800/40">
                  <span>ISBN System Registry Code:</span> 
                  <span className="text-slate-300 font-mono font-bold">{book.isbn || 'N/A'}</span>
                </p>
                <p className="text-slate-400 flex justify-between max-w-sm">
                  <span>Available Library Stocks:</span> 
                  <span className={`${book.available > 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold`}>
                    {book.available} copies remaining
                  </span>
                </p>
              </div>

              <p className="text-xs text-slate-300 mt-6 leading-relaxed font-medium bg-[#0F172A]/40 p-4 rounded-xl border border-slate-800/60">
                {book.description || "No plot synopsis record uploaded yet."}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/60">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handlePurchaseClick}
                  className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  🛒 Purchase Outright (${book.price || '14.99'})
                </button>

                <button 
                  onClick={handleBorrowTransaction}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                    book.available > 0 ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {book.available > 0 ? '🎟️ Borrow ' : '⏳ Join Waitlist Queue'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 NEW SECTION: READ-ONLY USER REVIEWS LOG 🔥 */}
        <div className="mt-12 bg-[#1E293B] rounded-2xl p-6 sm:p-10 border border-slate-800/80 shadow-2xl">
          <h2 className="text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-4 mb-6 flex items-center gap-2">
            <span>💬</span> Reader Opinions & Peer Reviews
          </h2>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">No structural reviews have been filed for this book index track yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-[#0F172A]/40 p-5 rounded-xl border border-slate-800/60">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {/* Displays name with Star indicator badge ONLY if has_star variable evaluates true */}
                      <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                        {rev.user_name}
                        {rev.has_star && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            ⭐ Verified Reader
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        Status: {rev.status === 'completed' ? '📚 Completed Volume' : '🫥 Abandoned / Got Bored'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-400">
                      {'★'.repeat(Math.round(rev.rating)) + '☆'.repeat(5 - Math.round(rev.rating))}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed font-medium">"{rev.comment}"</p>
                  <p className="text-[10px] text-slate-600 font-mono text-right mt-2">{rev.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookDetails;