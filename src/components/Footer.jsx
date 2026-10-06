import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Mohammed Usman.</h3>
          <p className="text-slate-500 text-sm mt-2">Crafting digital experiences.</p>
        </div>
        <p className="text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;