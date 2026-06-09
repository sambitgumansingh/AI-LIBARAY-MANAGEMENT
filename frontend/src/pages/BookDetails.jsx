import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🔥 SECURITY: Check if the logged-in user is an admin
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Fetch the single book data packet from Flask
    fetch(`http://localhost:5000/api/book/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not find this book record in the library collection.");
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

  const handleBorrowTransaction = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');

    if (!token) {
      setErrorMessage("Authentication token missing. Please log in to borrow books.");
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
        setSuccessMessage(data.message || "🎉 Book borrowed successfully! Check your ledger.");
        // Instantly decrease copies on the UI stock counter
        setBook(prev => ({ ...prev, available: prev.available - 1 }));
      } else {
        setErrorMessage(data.error || "Transaction declined by library rules.");
      }
    } catch (err) {
      setErrorMessage("Communication breakdown reaching transaction server.");
    }
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
        <button 
          onClick={() => navigate('/dashboard')} 
          className="text-xs font-black bg-[#024950] text-[#AFDDE5] px-5 py-3 rounded-xl border border-[#0FA4AF]/30 uppercase tracking-wider"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#003135] text-[#AFDDE5] p-6 sm:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header Navigation Row */}
        <div className="flex justify-between items-center mb-8 border-b border-[#0FA4AF]/20 pb-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-xs font-black uppercase tracking-widest text-[#0FA4AF] hover:underline transition-all"
          >
            ← Back to Catalog Index
          </button>
          <div className="flex items-center gap-1 text-sm font-bold text-white">
            <span>🐝</span> BookHive Ledger
          </div>
        </div>

        {/* Master Details Panel Card Container */}
        <div className="bg-[#024950] rounded-3xl p-6 sm:p-10 border border-[#0FA4AF]/30 shadow-2xl flex flex-col md:flex-row gap-10 items-center md:items-stretch">
          
          {/* Cover Media Frame Column */}
          <div className="w-full max-w-[280px] bg-[#003135]/60 p-4 rounded-2xl flex items-center justify-center shadow-inner border border-[#0FA4AF]/20">
            <img 
              src={book.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'} 
              alt={book.title} 
              className="w-full h-auto max-h-[380px] object-cover rounded-xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>

          {/* Book Information Sheet Details Column */}
          <div className="flex-1 flex flex-col justify-between w-full">
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase bg-[#003135] text-[#0FA4AF] px-3 py-1 rounded-md border border-[#0FA4AF]/20">
                {book.category || "General Volume"}
              </span>
              
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight leading-tight">{book.title}</h1>
              <p className="text-sm text-[#AFDDE5] mt-1 font-medium">Authored by <span className="text-white font-black">{book.author}</span></p>
              
              {/* Data Properties Meta Sheet */}
              <div className="mt-6 space-y-2.5 text-xs border-t border-[#003135]/60 pt-4">
                <p className="text-gray-300 flex justify-between max-w-xs">
                  <span>ISBN System Code:</span> 
                  <span className="text-white font-mono font-bold">{book.isbn || 'N/A'}</span>
                </p>
                <p className="text-gray-300 flex justify-between max-w-xs">
                  <span>Shelf Inventory Allocation:</span> 
                  <span className={`${book.available > 0 ? 'text-emerald-400' : 'text-red-400'} font-black`}>
                    {book.available} copies available
                  </span>
                </p>
                <p className="text-gray-300 flex justify-between max-w-xs">
                  <span>Active Waiting Queue:</span> 
                  <span className="text-white font-bold">0 students pending</span>
                </p>
              </div>

              {/* Volume Abstract Description Text Area */}
              <p className="text-xs text-[#AFDDE5]/90 mt-6 leading-relaxed font-medium bg-[#003135]/40 p-4 rounded-xl border border-[#0FA4AF]/10">
                {book.description || "No customized digital plot abstract metadata text has been uploaded for this copy volume item file record yet. You can ask your floating BookHive AI Assistant overlay panel on the main catalog screen dashboard to scrape real-time summaries or review metrics."}
              </p>
            </div>

            {/* Form Response Transaction Trigger Section Footer */}
            <div className="mt-8 pt-6 border-t border-[#003135]/60">
              {errorMessage && (
                <div className="bg-[#2e151b] text-red-400 border border-red-500/20 p-3 rounded-xl text-xs font-bold mb-4">
                  ⚠️ {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="bg-[#003135] text-[#0FA4AF] border border-[#0FA4AF]/30 p-3 rounded-xl text-xs font-bold mb-4">
                  {successMessage}
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={handleBorrowTransaction}
                  disabled={book.available <= 0}
                  className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md ${
                    book.available > 0 
                      ? 'bg-[#0FA4AF] hover:bg-[#0FA4AF]/90 text-[#003135] active:scale-[0.99]' 
                      : 'bg-[#003135] text-gray-500 border border-gray-600/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  {book.available > 0 ? '🎟️ Confirm Borrow Order' : '❌ Out of Stock'}
                </button>

                {/* 🔥 SECURITY: ONLY SHOW DELETE TO ADMINS 🔥 */}
                {isAdmin && (
                  <button 
                    onClick={async () => {
                      if(window.confirm("Are you sure you want to permanently delete this book from the database?")) {
                        const token = localStorage.getItem('token');
                        try {
                          const res = await fetch(`http://localhost:5000/api/book/${book._id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (res.ok) {
                            alert("Book deleted.");
                            navigate('/Dashboard');
                          }
                        } catch (err) {
                          alert("Failed to delete book.");
                        }
                      }
                    }}
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