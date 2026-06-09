import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:5000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) {
        localStorage.clear(); 
        throw new Error("Your secure session has expired. Please log in again.");
      }
      if (!res.ok) throw new Error("Could not pull profile parameters.");
      return res.json();
    })
    .then(data => setProfileData(data))
    .catch(err => {
      console.error("Profile Error:", err);
      setError(err.message);
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#003135] flex flex-col items-center justify-center p-6 gap-4 font-sans">
        <div className="bg-[#2e151b] text-red-400 border border-red-500/30 p-6 rounded-2xl font-bold text-center">⚠️ {error}</div>
        <button onClick={() => navigate('/login')} className="text-xs font-black bg-[#024950] text-[#AFDDE5] px-6 py-3 rounded-xl border border-[#0FA4AF]/30 uppercase tracking-wider hover:bg-[#0FA4AF] hover:text-[#003135]">
          Go to Login Screen
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#003135] text-[#0FA4AF] flex items-center justify-center font-black text-xs uppercase tracking-widest">
        Loading Profile Hub... ⚡
      </div>
    );
  }

  const isAdmin = profileData.role === 'admin';

  return (
    <div className="min-h-screen bg-[#003135] text-[#AFDDE5] p-6 sm:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Action */}
        <button 
          onClick={() => navigate('/Dashboard')} 
          className="text-xs font-black uppercase tracking-widest text-[#0FA4AF] hover:text-white transition-colors mb-8 flex items-center gap-2"
        >
          ← Back to Catalog
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Student Details Box */}
          <div className="md:col-span-1 bg-[#024950] border border-[#0FA4AF]/30 p-8 rounded-3xl shadow-2xl h-fit">
            <div className="text-6xl text-center mb-6">👤</div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight text-center mb-6 border-b border-[#0FA4AF]/20 pb-4">
              Student Details
            </h2>
            
            <div className="space-y-5 text-sm">
              <div>
                <p className="text-[#0FA4AF] font-black text-[10px] uppercase tracking-widest">Username</p>
                <p className="text-white font-black text-lg">{profileData.name}</p>
              </div>
              <div>
                <p className="text-[#0FA4AF] font-black text-[10px] uppercase tracking-widest">Email Address</p>
                <p className="text-white font-mono text-xs">{profileData.email}</p>
              </div>
              <div>
                <p className="text-[#0FA4AF] font-black text-[10px] uppercase tracking-widest">Access Level</p>
                <span className="text-yellow-400 font-bold bg-[#003135] w-fit px-3 py-1.5 rounded-md mt-1 border border-yellow-500/10 text-[10px] uppercase tracking-wider block">
                  {profileData.role || 'Member'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Library Action Menu */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6 px-2">Account Dashboard</h2>

            {/* Feature Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <button 
                onClick={() => navigate('/my-books')}
                className="bg-[#024950] border border-[#0FA4AF]/30 p-6 rounded-2xl hover:bg-[#0FA4AF]/10 transition-colors text-left flex flex-col gap-2 group"
              >
                <span className="text-2xl">📚</span>
                <span className="text-white font-black uppercase tracking-wider text-sm group-hover:text-[#0FA4AF]">My Borrowed / Returned</span>
                <span className="text-[10px] text-gray-400">View active loans and history</span>
              </button>

              <button 
                onClick={() => alert('Wishlist feature coming soon!')}
                className="bg-[#024950] border border-[#0FA4AF]/30 p-6 rounded-2xl hover:bg-[#0FA4AF]/10 transition-colors text-left flex flex-col gap-2 group"
              >
                <span className="text-2xl">⭐</span>
                <span className="text-white font-black uppercase tracking-wider text-sm group-hover:text-[#0FA4AF]">My Wishlist</span>
                <span className="text-[10px] text-gray-400">Books saved for later</span>
              </button>

              <button 
                onClick={() => alert('Purchased Books feature coming soon!')}
                className="bg-[#024950] border border-[#0FA4AF]/30 p-6 rounded-2xl hover:bg-[#0FA4AF]/10 transition-colors text-left flex flex-col gap-2 group"
              >
                <span className="text-2xl">🛍️</span>
                <span className="text-white font-black uppercase tracking-wider text-sm group-hover:text-[#0FA4AF]">Purchased Books</span>
                <span className="text-[10px] text-gray-400">Your permanent digital library</span>
              </button>

              {/* 🔥 SECURITY: Only Admins can see the Add Book option here! 🔥 */}
              {isAdmin && (
                <button 
                  onClick={() => navigate('/addbook')}
                  className="bg-[#003135] border border-yellow-500/30 p-6 rounded-2xl hover:bg-yellow-500/10 transition-colors text-left flex flex-col gap-2 group"
                >
                  <span className="text-2xl">⚡</span>
                  <span className="text-yellow-400 font-black uppercase tracking-wider text-sm group-hover:text-yellow-300">Admin: Add Book</span>
                  <span className="text-[10px] text-gray-400">Upload new inventory to DB</span>
                </button>
              )}

            </div>

            {/* Logout Action */}
            <div className="pt-8">
              <button 
                onClick={handleLogout} 
                className="w-full bg-[#2e151b] border border-red-500/30 hover:bg-red-900/50 text-red-400 font-black text-xs px-6 py-4 rounded-xl uppercase tracking-widest transition-all shadow-md"
              >
                Logout Session
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;