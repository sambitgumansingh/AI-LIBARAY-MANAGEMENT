import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-rose-400 font-mono text-xs uppercase tracking-widest">
        🚨 Security Exception: Access Denied.
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 sm:p-12 font-sans selection:bg-amber-500/20">
      <div className="max-w-6xl mx-auto">
        
        {/* Modernist Executive Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded w-fit mb-2">
              System Console Verified
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Internal System Directory</h1>
            <p className="text-slate-400 text-xs font-medium mt-0.5">Systems operations administrator: {user.email}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-5 py-2.5 rounded-lg transition-all shadow-sm"
          >
            Log Out System Session
          </button>
        </div>

        {/* Crisp Admin Navigation Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <button 
            onClick={() => navigate('/addbook')} 
            className="bg-[#1E293B] border border-slate-800/80 p-8 rounded-xl hover:border-amber-500/30 transition-all text-left group shadow-lg flex flex-col justify-between h-48"
          >
            <div>
              <h2 className="text-white font-bold tracking-tight text-lg group-hover:text-amber-400 transition-colors">Catalog Ingestion</h2>
              <p className="text-slate-400 text-xs font-medium mt-2 leading-relaxed">Publish new book metadata parameters directly into MongoDB Atlas records.</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500/80 group-hover:text-amber-400 flex items-center gap-1">
              Add Volume →
            </span>
          </button>

          <button 
            onClick={() => navigate('/Dashboard')} 
            className="bg-[#1E293B] border border-slate-800/80 p-8 rounded-xl hover:border-indigo-500/30 transition-all text-left group shadow-lg flex flex-col justify-between h-48"
          >
            <div>
              <h2 className="text-white font-bold tracking-tight text-lg group-hover:text-indigo-400 transition-colors">Inventory Auditing</h2>
              <p className="text-slate-400 text-xs font-medium mt-2 leading-relaxed">Access the standard user library catalog index matrix to modify or delete item items.</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
              Manage Catalog →
            </span>
          </button>

          <button 
            onClick={() => alert("Enterprise Metrics coming in next module update!")} 
            className="bg-[#1E293B] border border-slate-800/80 p-8 rounded-xl hover:border-slate-700 transition-all text-left group shadow-lg flex flex-col justify-between h-48 opacity-75 cursor-not-allowed"
          >
            <div>
              <h2 className="text-slate-300 font-bold tracking-tight text-lg">Student Loan Registries</h2>
              <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">Analyze real-time student activity matrixes, due dates, and queue logs.</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Locked Module
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;