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
    <div className="w-[350px] md:w-[480px] bg-white p-3 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 snap-center flex-shrink-0 group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-500 flex flex-col h-full">
      
      {/* Image Container */}
      <div className="h-64 overflow-hidden relative rounded-[1.5rem] mb-6 flex-shrink-0">
        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Top Right Floating Button */}
        <a 
          href={liveLink}
          target="_blank"
          rel="noopener noreferrer" 
          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white text-slate-900 shadow-xl"
          aria-label={`Visit ${title}`}
        >
          <ArrowUpRight size={22} strokeWidth={2.5} />
        </a>
      </div>

      {/* Content Area */}
      <div className="px-5 pb-5 flex flex-col flex-grow">
        <span className="text-xs font-bold tracking-widest text-blue-600 mb-2 block uppercase">
          {category}
        </span>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        
        {/* Short Description */}
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
          {description}
        </p>
        
        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-2 mb-8 mt-auto">
          {tech.map((item, index) => (
            <span 
              key={index} 
              className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 hover:border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-default"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
          {/* Live Link Button */}
          <a 
            href={liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3 px-4 rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            Live Preview <ExternalLink size={16} strokeWidth={2.5} />
          </a>

          {/* Conditional Admin Panel Button */}
          {adminLink && (
            <a 
              href={adminLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 px-4 rounded-xl text-sm font-bold transition-colors shadow-sm hover:shadow-md"
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