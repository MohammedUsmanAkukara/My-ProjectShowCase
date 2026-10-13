import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Users, FileText } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if admin is logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_jwt_token');
    setIsAdmin(!!token);
  }, [location]); // Re-check on route change (e.g. after login)

  const navLinks = [
    { name: 'Home',     path: '/' },
    { name: 'About',    path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Contact',  path: '/contact' }
  ];

  const adminLinks = [
    { name: 'Clients',  path: '/clients',  icon: Users },
    { name: 'Invoices', path: '/invoices', icon: FileText }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)} 
            className="text-2xl font-black text-slate-900 tracking-tighter"
          >
            Mohammed Usman<span className="text-blue-600">.</span>
          </Link>
          
          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition-all hover:text-blue-600 ${
                  location.pathname === link.path ? 'text-blue-600' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Admin-only links */}
            {isAdmin && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                {adminLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      location.pathname === link.path
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <link.icon size={13} />
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* MOBILE HAMBURGER BUTTON */}
          <button 
            className="md:hidden p-2 -mr-2 text-slate-600 hover:text-blue-600 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          
        </div>
      </div>

      {/* MOBILE NAV DROPDOWN MENU */}
      <div 
        className={`md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-xl transition-all duration-300 ease-in-out origin-top ${
          isOpen ? 'scale-y-100 opacity-100 visible' : 'scale-y-0 opacity-0 invisible'
        }`}
      >
        <nav className="flex flex-col px-6 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`text-lg font-bold tracking-wide transition-all p-3 rounded-xl ${
                location.pathname === link.path 
                  ? 'text-blue-600 bg-blue-50/80' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {/* Mobile Admin Links */}
          {isAdmin && (
            <>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Admin</p>
                {adminLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 text-base font-bold tracking-wide transition-all p-3 rounded-xl ${
                      location.pathname === link.path
                        ? 'text-blue-600 bg-blue-50/80'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    <link.icon size={16} />
                    {link.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;