import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

const WriteReview = () => {
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source'); // 'purchase' or 'return'
  
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('completed'); // 'completed' or 'bored'
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/book/${bookId}`)
      .then(res => res.json())
      .then(data => {
        setBook(data);
        setLoading(false);
      });
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/review/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookId,
          rating,
          comment,
          status,
          source
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("🎉 Review filed to community ledger!");
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-widest">Opening Ledger Gate...</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 sm:p-12 font-sans">
      <div className="max-w-xl mx-auto">
        <div className="bg-[#1E293B] border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
          
          <h1 className="text-xl font-black text-white uppercase tracking-tight mb-2">Submit Verified Review</h1>
          <p className="text-xs text-slate-400 mb-6">Reviewing: <span className="text-indigo-400 font-bold">{book?.title}</span></p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STAR SELECTION */}
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Score Rating Evaluation</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button type="button" key={num} onClick={() => setRating(num)} className="text-2xl transition-transform active:scale-95">
                    {num <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* 🔥 RETENTION CHECK RADIO CHIPS 🔥 */}
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Reader Tracking Standings</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('completed')}
                  className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                    status === 'completed' 
                      ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/40 shadow-inner' 
                      : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  📚 Completed Reading
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('bored')}
                  className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                    status === 'bored' 
                      ? 'bg-rose-950/20 text-rose-400 border-rose-900/40 shadow-inner' 
                      : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  🫥 Got Bored / Not Good
                </button>
              </div>
              {source === 'return' && (
                <p className="text-[10px] text-slate-500 mt-2 italic font-medium">
                  *Note: Selecting "Got Bored" will file your critique, but you will not receive a Genuine Reader Star Badge after your name.
                </p>
              )}
            </div>

            {/* CRITIQUE COMMENT FIELD */}
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Written Commentary</label>
              <textarea
                required
                rows="4"
                placeholder="Share your structured insights regarding the core writing context layout parameters..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              ></textarea>
            </div>

            {message && <div className="bg-[#0F172A] text-emerald-400 border border-emerald-500/20 p-3 rounded-lg text-center text-xs font-bold">{message}</div>}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg transition-all shadow-md shadow-indigo-600/10">
              Submit Review Sheet
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default WriteReview;