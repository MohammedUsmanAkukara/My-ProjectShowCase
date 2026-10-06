import React from 'react';
import { ArrowUpRight, ExternalLink, LayoutDashboard } from 'lucide-react';

const ProjectCard = ({ 
  title, 
  category, 
  description, 
  image, 
  tech, 
  liveLink = "#", 
  adminLink 
}) => {
  return (
    <div className="w-[85vw] sm:w-[350px] md:w-[420px] lg:w-[450px] bg-white p-3 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 snap-center flex-shrink-0 group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-500 flex flex-col h-full">
      
      {/* Image Container - Height reduced slightly for mobile */}
      <div className="h-56 md:h-64 overflow-hidden relative rounded-[1.5rem] mb-5 md:mb-6 flex-shrink-0">
        <div className="absolute inset-0 bg-slate-900/10 md:group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Top Right Floating Button - ALWAYS visible on mobile, hover-only on desktop */}
        <a 
          href={liveLink}
          target="_blank"
          rel="noopener noreferrer" 
          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-2.5 md:p-3 rounded-full opacity-100 md:opacity-0 translate-y-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white text-slate-900 shadow-xl"
          aria-label={`Visit ${title}`}
        >
          <ArrowUpRight size={20} className="md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
        </a>
      </div>

      {/* Content Area - Adjusted padding & text sizes for mobile */}
      <div className="px-4 md:px-5 pb-4 md:pb-5 flex flex-col flex-grow">
        <span className="text-[10px] md:text-xs font-bold tracking-widest text-blue-600 mb-2 block uppercase">
          {category}
        </span>
        
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        
        {/* Short Description */}
        <p className="text-slate-500 text-xs md:text-sm mb-5 md:mb-6 line-clamp-2 font-medium leading-relaxed">
          {description}
        </p>
        
        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-8 mt-auto">
          {tech.map((item, index) => (
            <span 
              key={index} 
              className="text-[10px] md:text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 hover:border-slate-200 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg transition-colors cursor-default"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Action Buttons - Stack vertically on tiny screens (<400px), side-by-side otherwise */}
        <div className="flex flex-col min-[400px]:flex-row items-center gap-2 md:gap-3 mt-auto pt-4 border-t border-slate-100">
          {/* Live Link Button */}
          <a 
            href={liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-[400px]:flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-2.5 md:py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-colors shadow-sm"
          >
            Live Preview <ExternalLink size={16} strokeWidth={2.5} />
          </a>

          {/* Conditional Admin Panel Button */}
          {adminLink && (
            <a 
              href={adminLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-[400px]:flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 md:py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-colors shadow-sm hover:shadow-md"
            >
              Admin Panel <LayoutDashboard size={16} strokeWidth={2.5} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;