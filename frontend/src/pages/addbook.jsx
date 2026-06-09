import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Fantasy',
    isbn: '',
    available: 1,
    description: '',
    image_url: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Syncing with MongoDB Atlas...' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message });
        setFormData({ title: '', author: '', category: 'Fantasy', isbn: '', available: 1, description: '', image_url: '' }); // Clear form
      } else {
        setStatus({ type: 'error', message: data.error });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Connection to server failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#003135] text-[#AFDDE5] p-6 sm:p-12 font-sans">
      <div className="max-w-2xl mx-auto bg-[#024950] p-8 sm:p-10 rounded-3xl shadow-2xl border border-[#0FA4AF]/30">
        
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Add New Volume</h1>
        <p className="text-xs text-[#AFDDE5]/80 mb-8">Inject new inventory directly into the cloud database.</p>

        {status.message && (
          <div className={`p-4 rounded-xl text-xs font-bold mb-6 border ${
            status.type === 'success' ? 'bg-[#003135] text-[#0FA4AF] border-[#0FA4AF]/30' : 
            status.type === 'error' ? 'bg-[#2e151b] text-red-400 border-red-500/30' : 
            'bg-[#003135] text-yellow-400 border-yellow-500/30'
          }`}>
            {status.type === 'success' ? '🎉' : status.type === 'error' ? '⚠️' : '⚡'} {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#0FA4AF] mb-1">Book Title</label>
              <input type="text" required name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0FA4AF]" placeholder="e.g. Dune" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#0FA4AF] mb-1">Author Name</label>
              <input type="text" required name="author" value={formData.author} onChange={handleInputChange} className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0FA4AF]" placeholder="e.g. Frank Herbert" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#0FA4AF] mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                <option>Fantasy</option>
                <option>Sci-Fi</option>
                <option>Horror</option>
                <option>Non-Fiction</option>
                <option>Mystery</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#0FA4AF] mb-1">ISBN Code</label>
              <input type="text" name="isbn" value={formData.isbn} onChange={handleInputChange} className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0FA4AF]" placeholder="123-456..." />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#0FA4AF] mb-1">Total Copies</label>
              <input type="number" min="1" required name="available" value={formData.available} onChange={handleInputChange} className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0FA4AF]" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#0FA4AF] mb-1">Cover Image URL</label>
            <input type="url" name="image_url" value={formData.image_url} onChange={handleInputChange} className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0FA4AF]" placeholder="https://example.com/cover.jpg" />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#0FA4AF] mb-1">Plot Summary</label>
            <textarea rows="4" name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0FA4AF]" placeholder="Enter a brief description..."></textarea>
          </div>

          <button type="submit" className="w-full bg-[#964734] hover:bg-[#964734]/90 text-white font-black text-xs py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest mt-4">
            Upload to Database
          </button>
        </form>

      </div>
    </div>
  );
};

export default AddBook;