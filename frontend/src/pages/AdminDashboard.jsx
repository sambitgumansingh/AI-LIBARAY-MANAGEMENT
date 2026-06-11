import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('leases'); // Tabs: 'leases' | 'waitlists' | 'users'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:5000/api/admin/dashboard-matrix', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 403) throw new Error("Clearance level validation failed.");
        return res.json();
      })
      .then(matrixData => {
        setData(matrixData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to interface with central admin data servers.");
        setLoading(false);
      });
  }, [navigate]);

  // Dedicated Admin Logout Handler
  const handleAdminLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-500 flex items-center justify-center font-mono text-xs uppercase tracking-widest animate-pulse">
        Establishing Command Handshake Clearance...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 gap-4 font-sans">
        <div className="bg-rose-950/30 text-rose-400 border border-rose-900/50 p-6 rounded-xl font-medium text-center text-sm shadow-xl max-w-md">
          ⚠️ {error}
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-xs font-bold bg-[#1E293B] text-slate-300 px-6 py-3 rounded-lg border border-slate-800 uppercase tracking-wider hover:bg-slate-700 transition-colors">
          Return to Login Gate
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 sm:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* LOCKDOWN HEADER: No return routes to civilian dashboard allowed */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800/60">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-black bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded">
            🛡️ Ultimate Master Authorization Level
          </span>
          <button 
            onClick={handleAdminLogout}
            className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-rose-400 font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider transition-all shadow-md"
          >
            Terminate Admin Session ✕
          </button>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Central Operations Station</h1>
          <p className="text-sm text-slate-400 mt-1">Global oversight matrix for tracking library data, user compliance records, and stock backorders.</p>
        </div>

        {/* METRICS BANNER ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-[#1E293B] border border-slate-800/80 p-5 rounded-xl shadow-md">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Indexed Catalog Volumes</p>
            <p className="text-white font-extrabold text-3xl mt-1">{data?.summary.totalBooks}</p>
          </div>
          <div className="bg-[#1E293B] border border-slate-800/80 p-5 rounded-xl shadow-md">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Active Standard Leases</p>
            <p className="text-indigo-400 font-extrabold text-3xl mt-1">{data?.summary.activeLoans}</p>
          </div>
          <div className="bg-[#1E293B] border border-slate-800/80 p-5 rounded-xl shadow-md">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Registered Core Users</p>
            <p className="text-rose-400 font-extrabold text-3xl mt-1">{data?.summary.totalUsers}</p>
          </div>
          <div className="bg-[#1E293B] border border-slate-800/80 p-5 rounded-xl shadow-md">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Collective Preloaded Assets</p>
            <p className="text-emerald-400 font-extrabold text-3xl mt-1">${data?.summary.vaultCredits}</p>
          </div>
        </div>

        {/* COMMAND MODULE INTERACTIVE TAB TOGGLES */}
        <div className="flex border-b border-slate-800 mb-6 gap-2">
          <button 
            onClick={() => setActiveTab('leases')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'leases' ? 'border-indigo-500 text-white bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🎟️ Real-Time Leases ({data?.leases.length})
          </button>
          <button 
            onClick={() => setActiveTab('waitlists')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'waitlists' ? 'border-amber-500 text-white bg-amber-500/5' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            ⏳ Demand Waitlists ({data?.waitlists.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'users' ? 'border-emerald-500 text-white bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            👤 User Registry Cluster ({data?.users.length})
          </button>
        </div>

        {/* TAB WORKSPACE ROUTER MODULES */}
        <div className="bg-[#1E293B] border border-slate-800/80 rounded-2xl p-6 shadow-xl overflow-hidden">
          
          {/* TAB 1: REAL-TIME LEASES */}
          {activeTab === 'leases' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Book Title</th>
                    <th className="pb-3">Borrower Account</th>
                    <th className="pb-3">Contact Phone</th>
                    <th className="pb-3">Timeline Bounds</th>
                    <th className="pb-3 max-w-xs">User Schedule Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-medium">
                  {data?.leases.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center italic text-slate-500">No active book loans are currently tracked out on circulation networks.</td>
                    </tr>
                  ) : (
                    data?.leases.map((loan) => (
                      <tr key={loan._id} className="hover:bg-[#131C2E]/20 transition-colors">
                        <td className="py-3.5 pl-2 text-white font-bold">{loan.book_title}</td>
                        <td className="py-3.5 font-mono text-slate-300">{loan.user_email}</td>
                        <td className="py-3.5 text-indigo-400 font-bold font-mono">{loan.admin_meta?.phone || 'Not Provided'}</td>
                        <td className="py-3.5 text-slate-400 font-mono">
                          <span className="text-slate-500">{loan.borrowed_at}</span> → <span className="text-amber-400 font-bold">{loan.due_date}</span>
                        </td>
                        <td className="py-3.5 text-slate-400 truncate max-w-xs italic">
                          {loan.admin_meta?.additional_notes ? `"${loan.admin_meta.additional_notes}"` : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: DEMAND WAITLISTS */}
          {activeTab === 'waitlists' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.waitlists.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center col-span-2">No out-of-stock item waitlists are currently logged by users.</p>
              ) : (
                data?.waitlists.map((book) => (
                  <div key={book._id} className="bg-[#0F172A]/40 border border-slate-800/60 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-white">{book.title}</h4>
                      <p className="text-xs text-slate-400">by {book.author}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-2">Inventory Available: {book.available} copies</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-center">
                      <span className="block font-mono text-amber-400 font-black text-lg leading-none">{book.queue_list.length}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mt-1">Pending Users</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: USER REGISTRY CLUSTER */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">System Holder Name</th>
                    <th className="pb-3">Communication Account</th>
                    <th className="pb-3">Library Card ID</th>
                    <th className="pb-3">System Authorization Role</th>
                    <th className="pb-3 pr-2 text-right">Available Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-medium">
                  {data?.users.map((member) => (
                    <tr key={member._id} className="hover:bg-[#131C2E]/20 transition-colors">
                      <td className="py-3.5 pl-2 text-white font-bold">{member.name}</td>
                      <td className="py-3.5 text-slate-300 font-mono">{member.email}</td>
                      <td className="py-3.5 text-indigo-400 font-mono font-bold tracking-wider">{member.library_id || 'BH-PENDING'}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          member.role === 'admin' 
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                            : 'text-slate-400 bg-slate-500/5 border-slate-800'
                        }`}>
                          {member.role || 'member'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right text-emerald-400 font-mono font-bold">
                        ${member.balance !== undefined ? parseFloat(member.balance).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;