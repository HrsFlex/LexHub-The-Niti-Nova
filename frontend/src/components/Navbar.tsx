import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Scale, LogIn, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/authContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side - Logo */}
          <Link to="/" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
            <Scale className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold text-white">LexHub</span>
          </Link>

          {/* Desktop Navigation (Hidden on Small Screens) */}
          <div className="hidden md:flex items-center gap-8">
            {[ "Case Research", "Contracts", "Doc Compare", "Form Guide",].map((item, index) => (
              <Link key={index} to={`/${item.toLowerCase().replace(" ", "-")}`} className="text-gray-300 hover:text-white transition-colors">
                {item}
              </Link>
            ))}
          </div>

          {/* Right Side - User Auth & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Desktop User Options */}
            <div className="hidden md:flex">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-white">
                    <UserCircle className="w-5 h-5" />
                    <span>{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
          <div className="flex flex-col items-center bg-slate-800 py-4 gap-4">
            {["Case Research", "Contracts", "Doc Compare", "Form Guide", ].map((item, index) => (
              <Link 
                key={index} 
                to={`/${item.toLowerCase().replace(" ", "-")}`} 
                className="text-gray-300 hover:text-white transition-colors text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}

            {/* Mobile User Options */}
            {user ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-white">
                  <UserCircle className="w-5 h-5" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  navigate('/auth');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
