import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Contact', path: '/contact' }
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
          <nav className="hidden md:flex space-x-10">
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
              onClick={() => setIsOpen(false)} // Link click hone par menu band ho jayega
              className={`text-lg font-bold tracking-wide transition-all p-3 rounded-xl ${
                location.pathname === link.path 
                  ? 'text-blue-600 bg-blue-50/80' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;