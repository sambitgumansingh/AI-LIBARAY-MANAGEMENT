import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loanCount, setLoanCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // 1. Fetch Master Profile Data
    const fetchProfile = fetch('http://localhost:5000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());

    // 2. Fetch Active Loans to derive metrics
    const fetchLoans = fetch('http://localhost:5000/api/loans', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []);

    // 3. Fetch Wishlist to derive metrics
    const fetchWishlist = fetch('http://localhost:5000/api/wishlist', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []);

    Promise.all([fetchProfile, fetchLoans, fetchWishlist])
      .then(([profile, loans, wishlist]) => {
        setProfileData(profile);
        setLoanCount(Array.isArray(loans) ? loans.length : 0);
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Profile metrics batch sync failed:", err);
        setError("Secure architecture synchronization timed out.");
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 gap-4 font-sans">
        <div className="bg-rose-950/30 text-rose-400 border border-rose-900/50 p-6 rounded-xl font-medium text-center text-sm shadow-xl max-w-md">
          ⚠️ {error}
        </div>
        <button onClick={() => navigate('/login')} className="text-xs font-bold bg-[#1E293B] text-slate-300 px-6 py-3 rounded-lg border border-slate-800 uppercase tracking-wider hover:bg-slate-700 transition-colors">
          Re-authenticate Session
        </button>
      </div>
    );
  }

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-500 flex items-center justify-center font-mono text-xs uppercase tracking-widest animate-pulse">
        Compiling Account Dashboard Matrix...
      </div>
    );
  }

  const isAdmin = profileData.role === 'admin';
  
  // 🔥 DYNAMIC AVATAR VALUE GENERATOR 🔥
  const initialLetter = profileData.name ? profileData.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 sm:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Row */}
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-800/60">
          <button 
            onClick={() => navigate('/Dashboard')} 
            className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-colors"
          >
            ← Catalog Directory
          </button>
          <span className="text-xs font-mono text-slate-500">System node verified</span>
        </div>

        {/* TOP METRICS GRID BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-xl shadow-md">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Secure Library Card ID</p>
            {/* 🔥 UPDATED: Uses the real random library ID string from the database instead of synthesizing it */}
            <p className="text-white font-mono text-base font-bold mt-1 tracking-wide">{profileData.library_id || 'BH-ASSIGNING'}</p>
          </div>
          <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-xl shadow-md">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Active Borrowed Items</p>
            <p className="text-indigo-400 font-bold text-2xl mt-1">{loanCount} <span className="text-xs font-normal text-slate-500">volumes checked out</span></p>
          </div>
          <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-xl shadow-md">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Wishlist Index Count</p>
            <p className="text-rose-400 font-bold text-2xl mt-1">{wishlistCount} <span className="text-xs font-normal text-slate-500">saved profiles</span></p>
          </div>
          <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-xl shadow-md">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Account Digital Balance</p>
            <p className="text-emerald-400 font-bold text-2xl mt-1">$25.00 <span className="text-xs font-normal text-slate-500">credits preloaded</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT PANEL: Expanded Student Parameters Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1E293B] border border-slate-800/80 p-6 rounded-2xl shadow-xl">
              {/* 🔥 UPDATED: Dynamic user-initial profile graphic badge inside a circle view */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-black text-xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-indigo-600/20 ring-4 ring-indigo-500/10">
                {initialLetter}
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-center border-b border-slate-800 pb-3 mb-5">
                Identity Profile Credentials
              </h2>
              
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">Student Holder Name</label>
                  <p className="text-slate-200 font-bold text-sm mt-0.5">{profileData.name}</p>
                </div>
                <div>
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">Registered Communication Route</label>
                  <p className="text-slate-300 font-mono mt-0.5">{profileData.email}</p>
                </div>
                <div>
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">Database Cleared Authorization Role</label>
                  <span className={`inline-block font-bold px-2.5 py-1 rounded text-[10px] uppercase tracking-wider mt-1.5 border ${
                    isAdmin 
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                      : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                  }`}>
                    {profileData.role || 'Member'}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-800">
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">System Registration Timestamp</label>
                  <p className="text-slate-400 font-medium mt-0.5">{profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'Active Track'}</p>
                </div>
              </div>
            </div>

            {/* Logout Trigger Card */}
            <button 
              onClick={handleLogout} 
              className="w-full bg-rose-950/20 border border-rose-900/40 hover:bg-rose-950/40 text-rose-400 font-bold text-xs px-5 py-3.5 rounded-xl uppercase tracking-widest transition-all shadow-md"
            >
              Terminate Session Connection
            </button>
          </div>

          {/* RIGHT PANEL: Module Control Blocks & Audit Log */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Navigational Navigation Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-1">Ecosystem Navigation Hub</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <button 
                  onClick={() => navigate('/my-books')}
                  className="bg-[#1E293B] border border-slate-800 p-5 rounded-xl hover:border-indigo-500/30 transition-all text-left flex gap-4 items-start group shadow-md"
                >
                  <span className="text-xl bg-slate-900 w-10 h-10 rounded-lg flex items-center justify-center border border-slate-800 text-indigo-400">📚</span>
                  <div>
                    <h4 className="text-white font-bold text-sm group-hover:text-indigo-400 transition-colors">Digital Ledger History</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Review active catalog leases, absolute return deadlines, and history.</p>
                  </div>
                </button>

                <button 
                  onClick={() => navigate('/wishlist')}
                  className="bg-[#1E293B] border border-slate-800 p-5 rounded-xl hover:border-rose-500/30 transition-all text-left flex gap-4 items-start group shadow-md"
                >
                  <span className="text-xl bg-slate-900 w-10 h-10 rounded-lg flex items-center justify-center border border-slate-800 text-rose-400">❤️</span>
                  <div>
                    <h4 className="text-white font-bold text-sm group-hover:text-rose-400 transition-colors">Saved Book Index</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Isolate saved book items curated using your dashboard hearts selection tracker.</p>
                  </div>
                </button>

                <button 
                  onClick={() => alert('Purchased Volumes pipeline loading in next software stack deployment.')}
                  className="bg-[#1E293B] border border-slate-800 p-5 rounded-xl hover:border-emerald-500/30 transition-all text-left flex gap-4 items-start group shadow-md"
                >
                  <span className="text-xl bg-slate-900 w-10 h-10 rounded-lg flex items-center justify-center border border-slate-800 text-emerald-400">🛍️</span>
                  <div>
                    <h4 className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">Purchased Volumes</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Access files bought outright via preloaded wallet credit assets.</p>
                  </div>
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => navigate('/admin-dashboard')}
                    className="bg-[#1E293B] border border-amber-500/20 p-5 rounded-xl hover:border-amber-500/40 transition-all text-left flex gap-4 items-start group shadow-md"
                >
                    <span className="text-xl bg-slate-900 w-10 h-10 rounded-lg flex items-center justify-center border border-slate-800 text-amber-400">🛡️</span>
                    <div>
                      <h4 className="text-amber-400 font-bold text-sm group-hover:text-amber-300 transition-colors">Admin Controller Console</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Bypass system nodes to execute global database catalog manipulations.</p>
                    </div>
                  </button>
                )}

              </div>
            </div>

            {/* 🔥 REPLACED: Security log swapped for custom structural Reading Statistics Engine 🔥 */}
            <div className="bg-[#1E293B] border border-slate-800/80 p-6 rounded-xl shadow-xl">
              <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Reading Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 mb-6 text-xs">
                <div className="bg-[#0F172A]/40 p-4 rounded-xl border border-slate-800/60">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Books Read</p>
                  <p className="text-white text-xl font-extrabold mt-0.5">24</p>
                </div>
                <div className="bg-[#0F172A]/40 p-4 rounded-xl border border-slate-800/60">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Books This Month</p>
                  <p className="text-indigo-400 text-xl font-extrabold mt-0.5">3</p>
                </div>
                <div className="bg-[#0F172A]/40 p-4 rounded-xl border border-slate-800/60">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Favorite Genre</p>
                  <p className="text-white text-sm font-extrabold mt-1 truncate">Programming</p>
                </div>
                <div className="bg-[#0F172A]/40 p-4 rounded-xl border border-slate-800/60">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Reading Streak</p>
                  <p className="text-emerald-400 text-xl font-extrabold mt-0.5">12 Days</p>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="bg-[#0F172A]/40 p-4 rounded-xl border border-slate-800/60">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-300">Yearly Goal Progress</span>
                  <span className="text-indigo-400 font-mono">68%</span>
                </div>
                <div className="w-full bg-[#0F172A] h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full shadow-inner transition-all duration-500" 
                    style={{ width: '68%' }}
                  ></div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 text-right mt-2 font-bold tracking-wide">
                  17 / 25 Books Completed
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;