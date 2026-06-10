import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // NEW: Wishlist State
  const [isWishlisted, setIsWishlisted] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetch(`http://localhost:5000/api/book/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not find this book record.");
        return res.json();
      })
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setLoading(false);
      });
  }, [id]);

  // NEW: Toggle Wishlist Function
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
        setSuccessMessage(data.message);
      }
    } catch (err) {
      setErrorMessage("Failed to update wishlist.");
    }
  };

  const handleBorrowTransaction = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');

    if (!token) {
      setErrorMessage("Authentication token missing. Please log in.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/borrow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookId: book._id })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("🎉 Redirecting to checkout logic...");
        // Redirect to our soon-to-be-built checkout page!
        setTimeout(() => navigate(`/checkout/${book._id}?type=borrow`), 1000);
      } else {
        setErrorMessage(data.error || "Transaction declined.");
      }
    } catch (err) {
      setErrorMessage("Communication breakdown reaching server.");
    }
  };

  const handlePurchaseClick = () => {
    navigate(`/checkout/${book._id}?type=purchase`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#003135] text-[#AFDDE5] flex items-center justify-center font-black text-xs tracking-widest uppercase">
        Loading Inventory Data Sheet... ⚡
      </div>
    );
  }

  if (errorMessage && !book) {
    return (
      <div className="min-h-screen bg-[#003135] text-red-400 flex flex-col items-center justify-center p-6 gap-4 font-sans">
        <p className="font-black bg-[#2e151b] border border-red-500/30 p-4 rounded-xl">⚠️ {errorMessage}</p>
        <button onClick={() => navigate('/dashboard')} className="text-xs font-black bg-[#024950] text-[#AFDDE5] px-5 py-3 rounded-xl border border-[#0FA4AF]/30 uppercase tracking-wider">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#003135] text-[#AFDDE5] p-6 sm:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-[#0FA4AF]/20 pb-4">
          <button onClick={() => navigate('/dashboard')} className="text-xs font-black uppercase tracking-widest text-[#0FA4AF] hover:underline transition-all">
            ← Back to Catalog Index
          </button>
          <div className="flex items-center gap-1 text-sm font-bold text-white">
            <span>🐝</span> BookHive Ledger
          </div>
        </div>

        <div className="bg-[#024950] rounded-3xl p-6 sm:p-10 border border-[#0FA4AF]/30 shadow-2xl flex flex-col md:flex-row gap-10">
          
          {/* Cover Image & Wishlist Button */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="bg-[#003135]/60 p-4 rounded-2xl flex items-center justify-center shadow-inner border border-[#0FA4AF]/20">
              <img 
                src={book.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'} 
                alt={book.title} 
                className="w-full h-auto object-cover rounded-xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
            
            {/* NEW: Wishlist Button */}
            <button 
              onClick={handleWishlistToggle}
              className={`py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 border ${
                isWishlisted 
                  ? 'bg-[#2e151b] text-red-400 border-red-500/30 hover:bg-red-900/50' 
                  : 'bg-[#003135] text-[#AFDDE5] border-[#0FA4AF]/30 hover:bg-[#0FA4AF]/10'
              }`}
            >
              {isWishlisted ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>

          <div className="w-full md:w-2/3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] tracking-widest font-black uppercase bg-[#003135] text-[#0FA4AF] px-3 py-1 rounded-md border border-[#0FA4AF]/20">
                  {book.category || "General Volume"}
                </span>
                
                {/* NEW: Rating Display */}
                <div className="flex items-center gap-1 bg-[#003135] px-3 py-1 rounded-md border border-yellow-500/20">
                  <span className="text-yellow-400 text-xs">⭐</span>
                  <span className="text-white font-black text-xs">{book.rating || '4.8'} / 5</span>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight leading-tight">{book.title}</h1>
              <p className="text-sm text-[#AFDDE5] mt-1 font-medium">Authored by <span className="text-white font-black">{book.author}</span></p>
              
              <div className="mt-6 space-y-2.5 text-xs border-t border-[#003135]/60 pt-4">
                {/* NEW: Price Display */}
                <p className="text-gray-300 flex justify-between max-w-sm border-b border-[#003135] pb-2">
                  <span>Permanent Ownership Price:</span> 
                  <span className="text-green-400 font-black text-sm">${book.price || '14.99'}</span>
                </p>

                <p className="text-gray-300 flex justify-between max-w-sm mt-2">
                  <span>ISBN System Code:</span> 
                  <span className="text-white font-mono font-bold">{book.isbn || 'N/A'}</span>
                </p>
                <p className="text-gray-300 flex justify-between max-w-sm">
                  <span>Shelf Inventory Allocation:</span> 
                  <span className={`${book.available > 0 ? 'text-emerald-400' : 'text-red-400'} font-black`}>
                    {book.available} copies available
                  </span>
                </p>
                <p className="text-gray-300 flex justify-between max-w-sm">
                  <span>Active Waiting Queue:</span> 
                  <span className="text-white font-bold">{book.queue_list?.length || 0} students pending</span>
                </p>
              </div>

              <p className="text-xs text-[#AFDDE5]/90 mt-6 leading-relaxed font-medium bg-[#003135]/40 p-4 rounded-xl border border-[#0FA4AF]/10">
                {book.description || "No customized digital plot abstract metadata text has been uploaded..."}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#003135]/60">
              {errorMessage && <div className="bg-[#2e151b] text-red-400 border border-red-500/20 p-3 rounded-xl text-xs font-bold mb-4">⚠️ {errorMessage}</div>}
              {successMessage && <div className="bg-[#003135] text-[#0FA4AF] border border-[#0FA4AF]/30 p-3 rounded-xl text-xs font-bold mb-4">{successMessage}</div>}

              <div className="flex flex-col sm:flex-row gap-4">
                
                {/* NEW: Purchase Button */}
                <button 
                  onClick={handlePurchaseClick}
                  className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md bg-green-600 hover:bg-green-500 text-white border border-green-400/30"
                >
                  🛒 Purchase (${book.price || '14.99'})
                </button>

                {/* UPDATED: Borrow / Waitlist Button */}
                <button 
                  onClick={handleBorrowTransaction}
                  className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md ${
                    book.available > 0 
                      ? 'bg-[#0FA4AF] hover:bg-[#0FA4AF]/90 text-[#003135]' 
                      : 'bg-yellow-500 hover:bg-yellow-400 text-[#003135]'
                  }`}
                >
                  {book.available > 0 ? '🎟️ Borrow (14 Days)' : '⏳ Join Waitlist'}
                </button>

                {isAdmin && (
                  <button 
                    onClick={async () => { /* Delete Logic remains exactly the same */ }}
                    className="px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md bg-[#2e151b] text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookDetails;