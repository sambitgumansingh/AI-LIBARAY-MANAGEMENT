import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  // 🔥 NEW: Wishlisted IDs Tracking Array 🔥
  const [wishlistedIds, setWishlistedIds] = useState([]);
  
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Welcome to BookHive Core System. I can parse our cloud index files to isolate matching reading assets for your tracks. What query parameters can I assist with?' }
  ]);
  const navigate = useNavigate();

  const categories = [
    "All Categories", "Fantasy", "Sci-Fi", "Horror", 
    "Non-Fiction", "Mystery", "Romance", "Thriller", 
    "Biography", "History", "Science"
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // 1. Fetch all books from inventory
    const fetchBooks = fetch('http://localhost:5000/api/books').then(res => res.json());
    
    // 2. Fetch user's wishlist state to highlight existing red hearts
    const fetchWishlist = fetch('http://localhost:5000/api/wishlist', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .catch(() => []);

    Promise.all([fetchBooks, fetchWishlist])
      .then(([booksData, wishlistData]) => {
        setBooks(Array.isArray(booksData) ? booksData : []);
        setWishlistedIds(Array.isArray(wishlistData) ? wishlistData.map(b => b._id) : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Unable to interface with central database clusters.");
        setLoading(false);
      });
  }, []);

  // 🔥 NEW: Inline Heart Click Toggle Mechanism 🔥
  const handleHeartToggle = async (e, bookId) => {
    e.stopPropagation(); // 🧠 CRITICAL: Stop click from firing navigate() on the parent card
    const token = localStorage.getItem('token');
    if (!token) return alert("Session authentication missing.");

    try {
      const res = await fetch('http://localhost:5000/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookId })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.isSaved) {
          setWishlistedIds(prev => [...prev, bookId]);
        } else {
          setWishlistedIds(prev => prev.filter(id => id !== bookId));
        }
      }
    } catch (err) {
      console.error("Wishlist sync exception:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setMessages(prev => [...prev, { sender: 'ai', text: 'Processing node calculations... ⚡' }]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userText })
      });
      const data = await response.json();
      setMessages(prev => [...prev.slice(0, -1), { sender: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev.slice(0, -1), { sender: 'ai', text: 'Network connection timeline failed.' }]);
    }
  };

  const filteredBooks = books.filter((book) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (book.title && book.title.toLowerCase().includes(searchLower)) ||
      (book.author && book.author.toLowerCase().includes(searchLower)) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchLower));

    const matchesCategory = selectedCategory === 'All Categories' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 sm:p-10 relative font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Sleek, Modern Control Console Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-12 bg-[#1E293B] p-4 rounded-xl border border-slate-800 shadow-xl max-w-3xl mx-auto">
          <input 
            type="text" 
            placeholder="Search indexing matrix by title, author, or ISBN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 bg-[#0F172A] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0F172A] border border-slate-700/50 px-4 py-2.5 rounded-lg font-semibold text-sm text-slate-300 focus:outline-none w-full md:w-48 cursor-pointer hover:border-slate-600 transition-colors"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Inventory System State Triggers */}
        {loading ? (
          <div className="text-center font-mono text-xs tracking-widest uppercase mt-32 text-slate-500 animate-pulse">
            Querying active book arrays...
          </div>
        ) : error ? (
          <div className="text-center bg-rose-950/20 border border-rose-950 p-6 rounded-xl text-rose-400 font-medium max-w-lg mx-auto mt-12 text-sm shadow-lg">
            ⚠️ {error}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center bg-[#1E293B] border border-slate-800 p-12 rounded-xl text-slate-400 font-medium max-w-lg mx-auto mt-12 shadow-xl">
            Directory index empty. Use Admin tools to populate records.
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center border border-slate-800/80 p-12 rounded-xl text-slate-500 font-medium max-w-lg mx-auto mt-12 text-sm">
            Zero parameters match your criteria. Try widening structural metrics.
          </div>
        ) : (
          /* Premium Product Grid Deck */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const isSaved = wishlistedIds.includes(book._id);
              return (
                <div 
                  key={book._id} 
                  onClick={() => navigate(`/book/${book._id}`)}
                  className="bg-[#1E293B] rounded-xl overflow-hidden border border-slate-800/60 hover:border-indigo-500/40 transition-all cursor-pointer shadow-lg hover:shadow-2xl flex flex-col justify-between group relative"
                >
                  {/* Image Canvas Panel with Floating Heart Overlay */}
                  <div className="p-4 flex justify-center bg-[#131C2E]/40 relative overflow-hidden border-b border-slate-800/40">
                    <img 
                      src={book.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'} 
                      alt={book.title} 
                      className="h-44 w-32 object-cover rounded-md shadow-md group-hover:scale-[1.03] transition-transform duration-300 border border-slate-800/20"
                    />
                    
                    {/* 🔥 THE ACTIVE FLOATING HEART BUTTON 🔥 */}
                    <button
                      onClick={(e) => handleHeartToggle(e, book._id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700/30 backdrop-blur-sm shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    >
                      <span className={`text-sm transition-colors duration-200 ${isSaved ? 'text-rose-500' : 'text-slate-400 group-hover/btn:text-white'}`}>
                        {isSaved ? '❤️' : '🤍'}
                      </span>
                    </button>
                  </div>

                  {/* Text Properties Core Content Area */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">{book.title}</h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">by {book.author}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/60">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">
                        {book.category}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">
                        ${book.price || '14.99'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Minimalist AI Floating Action Trigger */}
        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white w-12 h-12 rounded-full shadow-xl shadow-indigo-600/20 transition-all transform hover:scale-105 active:scale-95 z-50 flex items-center justify-center border border-indigo-400/20"
          title="System AI"
        >
          <span className="text-base">✨</span>
        </button>

        {/* High-Tech Terminal AI Chat Overlay */}
        {isAiOpen && (
          <div className="fixed bottom-20 right-6 bg-[#1E293B] w-80 sm:w-96 h-[440px] rounded-xl shadow-2xl border border-slate-800 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="bg-[#0F172A] p-4 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 text-sm">✨</span>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">BookHive AI Agent</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Status: Connected</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-slate-400 hover:text-white text-xs font-bold p-1">✕</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-[#0F172A]/20 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl max-w-[85%] text-xs font-medium leading-relaxed shadow-sm border ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white border-indigo-500/30 rounded-br-none' 
                      : 'bg-[#1E293B] text-slate-300 border-slate-800/80 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#1E293B] border-t border-slate-800/80 flex gap-2 items-center">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Submit semantic natural language string..." 
                className="flex-1 bg-[#0F172A] border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-2 rounded-lg transition-colors shadow-sm">
                Execute
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;