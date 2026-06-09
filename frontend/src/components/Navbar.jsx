import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the navbar on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-[#024950] border-b border-[#0FA4AF]/30 shadow-xl sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <div 
          onClick={() => navigate('/Dashboard')}
          className="flex items-center gap-2 text-white font-black text-xl tracking-wider cursor-pointer hover:text-[#0FA4AF] transition-colors"
        >
          <span>🐝</span> BookHive
        </div>

        {/* Right Side: Simple Profile Icon Route */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#003135] border border-[#0FA4AF]/50 text-[#0FA4AF] hover:bg-[#0FA4AF] hover:text-[#003135] transition-all shadow-md"
            title="Go to Profile"
          >
            <span className="text-xl">👤</span>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;