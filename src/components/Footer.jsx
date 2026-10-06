import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-10 md:pt-16 pb-6 md:pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        
        {/* Brand & Tagline */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Mohammed Usman<span className="text-blue-600">.</span>
          </h3>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">
            Crafting digital experiences.
          </p>
        </div>

        {/* Copyright */}
        <p className="text-slate-400 text-sm font-medium text-center md:text-right">
          © {new Date().getFullYear()} All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;