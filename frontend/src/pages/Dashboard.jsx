import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 🔥 NEW: Search and Filter States 🔥
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '👋 Welcome back to BookHive! I can safely parse our inventory matrix to find custom matching reads. What genres do you feel like reading?' }
  ]);
  const navigate = useNavigate();

  // Expanded Category List
  const categories = [
    "All Categories", "Fantasy", "Sci-Fi", "Horror", 
    "Non-Fiction", "Mystery", "Romance", "Thriller", 
    "Biography", "History", "Science"
  ];

  useEffect(() => {
    fetch('http://localhost:5000/api/books')
      .then(res => {
        if (!res.ok) throw new Error("Backend server rejected the request.");
        return res.json();
      })
      .then(data => {
        setBooks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading library catalog:", err);
        setError("Cannot connect to Python Backend. Make sure 'python app.py' is running!");
        setLoading(false);
      });
  }, []);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setMessages(prev => [...prev, { sender: 'ai', text: 'Thinking... ⚡' }]);

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
      setMessages(prev => [...prev.slice(0, -1), { sender: 'ai', text: 'Network connection timeline timed out.' }]);
    }
  };

  // 🔥 NEW: The Live Filter Engine 🔥
  const filteredBooks = books.filter((book) => {
    // 1. Check if it matches the text search (Title, Author, or ISBN)
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (book.title && book.title.toLowerCase().includes(searchLower)) ||
      (book.author && book.author.toLowerCase().includes(searchLower)) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchLower));

    // 2. Check if it matches the selected dropdown category
    const matchesCategory = 
      selectedCategory === 'All Categories' || book.category === selectedCategory;

    // Only return true if BOTH conditions pass
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#003135] text-[#AFDDE5] p-6 sm:p-8 relative font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Active Search & Filter Header Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-12 bg-[#024950] p-4 rounded-2xl border border-[#0FA4AF]/30 shadow-2xl max-w-3xl mx-auto">
          <input 
            type="text" 
            placeholder="Search by title, author, or ISBN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 bg-[#003135] border border-[#0FA4AF]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0FA4AF] focus:ring-1 focus:ring-[#0FA4AF]"
          />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#003135] border border-[#0FA4AF]/30 px-4 py-2.5 rounded-xl font-bold text-[#AFDDE5] focus:outline-none w-full md:w-auto"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Dynamic State Handling for Books */}
        {loading ? (
          <div className="text-center font-black text-xs tracking-widest uppercase mt-20 text-[#0FA4AF]">
            Loading Inventory Grid... ⚡
          </div>
        ) : error ? (
          <div className="text-center bg-[#2e151b] border border-red-500/30 p-6 rounded-2xl text-red-400 font-bold max-w-lg mx-auto mt-10 shadow-lg">
            ⚠️ {error}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center bg-[#024950] border border-[#0FA4AF]/30 p-10 rounded-2xl text-[#AFDDE5] font-bold max-w-lg mx-auto mt-10">
            📭 The database is empty! Click "+ Add Book" in the navbar above to add your first volume.
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center bg-[#003135] border border-[#0FA4AF]/20 p-10 rounded-2xl text-[#AFDDE5] font-bold max-w-lg mx-auto mt-10">
            🔍 No books found matching "{searchQuery}" in {selectedCategory}. Try adjusting your filters!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Notice we map over filteredBooks now, not books! */}
            {filteredBooks.map((book) => (
              <div 
                key={book._id} 
                onClick={() => navigate(`/book/${book._id}`)}
                className="bg-[#024950] rounded-2xl overflow-hidden border border-[#0FA4AF]/20 hover:border-[#0FA4AF]/60 transition-all cursor-pointer transform hover:-translate-y-1 shadow-2xl flex flex-col justify-between group"
              >
                <div className="p-4 flex justify-center bg-[#003135]/40">
                  <img 
                    src={book.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'} 
                    alt={book.title} 
                    className="h-44 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-base text-white line-clamp-1 group-hover:text-[#0FA4AF] transition-colors">{book.title}</h3>
                    <p className="text-xs text-[#AFDDE5]/70 mt-1">by {book.author}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#003135]/60">
                    <span className="text-[9px] tracking-wider font-black uppercase bg-[#003135] text-[#0FA4AF] px-2 py-0.5 rounded-md border border-[#0FA4AF]/10">
                      {book.category}
                    </span>
                    <span className="text-xs font-black text-amber-400">
                      {book.available} copies
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating AI Corner Activation Action Button */}
        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className="fixed bottom-6 right-8 bg-[#964734] hover:bg-[#964734]/90 text-white px-5 py-3.5 rounded-full shadow-2xl font-black text-xs transition-all transform hover:scale-110 active:scale-95 z-50 flex items-center gap-2 border border-white/10 uppercase tracking-widest"
        >
          <span>✨</span> Ask AI
        </button>

        {/* Floating Assistant Conversation Overlay */}
        {isAiOpen && (
          <div className="fixed bottom-24 right-8 bg-[#024950] w-80 sm:w-96 h-[460px] rounded-2xl shadow-2xl border border-[#0FA4AF]/30 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="bg-[#003135] p-4 text-white flex justify-between items-center border-b border-[#0FA4AF]/20">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">✨</span>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider text-white">BookHive AI System</h3>
                  <p className="text-[10px] text-gray-400">Scrapes catalog metrics inside your cloud database</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-gray-400 hover:text-white font-bold text-sm p-1">✕</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-[#003135]/30 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed shadow-md ${
                    msg.sender === 'user' 
                      ? 'bg-[#964734] text-white rounded-br-none border border-[#964734]/30' 
                      : 'bg-[#024950] text-[#AFDDE5] rounded-bl-none border border-[#0FA4AF]/20'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#024950] border-t border-[#0FA4AF]/20 flex gap-2 items-center">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about these books..." 
                className="flex-1 bg-[#003135] border border-[#0FA4AF]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button onClick={handleSendMessage} className="bg-[#964734] hover:bg-[#964734]/80 text-white font-black text-xs px-3 py-2 rounded-xl transition-colors shadow-md">
                Send
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;