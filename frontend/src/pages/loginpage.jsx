import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
     if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 🔥 CRITICAL FIX: The Split Path Router 🔥
        if (data.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/Dashboard');
        }
      } else {
        setError(data.error || "Invalid email or password match.");
      }
    } catch (err) {
      setError("Cannot connect to authentication backend.");
    }
  };

  return (
    <div className="min-h-screen bg-[#003135] flex items-center justify-center p-6 font-sans">
      <div className="bg-[#024950] w-full max-w-md p-8 rounded-2xl border border-[#0FA4AF]/30 shadow-2xl">
        <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight flex items-center justify-center gap-2">
          <span>🐝</span> BookHive
        </h2>
        <p className="text-xs text-[#AFDDE5] text-center mb-6">Sign in to access your digital catalog bookshelf</p>

        {error && (
          <div className="bg-[#2e151b] text-red-400 border border-red-500/30 p-3 rounded-xl text-xs font-bold mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#0FA4AF] mb-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="student@hive.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0FA4AF] focus:ring-1 focus:ring-[#0FA4AF]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#0FA4AF] mb-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0FA4AF] focus:ring-1 focus:ring-[#0FA4AF]"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#964734] hover:bg-[#964734]/90 text-white font-black text-xs py-3.5 rounded-xl transition-all mt-6 shadow-md uppercase tracking-widest"
          >
            Enter Dashboard
          </button>
        </form>

        <p className="text-xs text-center text-[#AFDDE5] mt-6">
          New student user?{' '}
          <span onClick={() => navigate('/register')} className="text-[#0FA4AF] font-bold cursor-pointer hover:underline">
            Register Account here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;