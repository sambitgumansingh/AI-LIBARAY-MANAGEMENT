import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        alert("🎉 Registration successful! Please log in.");
        navigate('/login');
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      setError("Cannot reach backend server pipeline.");
    }
  };

  return (
    <div className="min-h-screen bg-[#003135] flex items-center justify-center p-6 font-sans">
      <div className="bg-[#024950] w-full max-w-md p-8 rounded-2xl border border-[#0FA4AF]/30 shadow-2xl">
        <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">Create Account</h2>
        <p className="text-xs text-[#AFDDE5] text-center mb-6">Join the BookHive management platform</p>

        {error && (
          <div className="bg-[#2e151b] text-red-400 border border-red-500/30 p-3 rounded-xl text-xs font-bold mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#0FA4AF] mb-1">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="Alex Carey"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0FA4AF] focus:ring-1 focus:ring-[#0FA4AF]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#0FA4AF] mb-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="alex@hive.com"
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
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-[#003135] border border-[#0FA4AF]/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0FA4AF] focus:ring-1 focus:ring-[#0FA4AF]"
            />
          </div>

          <button type="submit" className="w-full bg-[#964734] hover:bg-[#964734]/90 text-white font-black text-xs py-3.5 rounded-xl transition-all mt-6 shadow-md uppercase tracking-widest">
            Sign Up
          </button>
        </form>

        <p className="text-xs text-center text-[#AFDDE5] mt-6">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-[#0FA4AF] font-bold cursor-pointer hover:underline">
            Log In here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;