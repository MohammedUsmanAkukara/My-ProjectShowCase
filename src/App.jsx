import React, { useState, useEffect } from 'react';
import portfolioData from './data/portfolioData.json';

export default function App() {
  const { profile, projects, categories } = portfolioData;
  const [activeFilter, setActiveFilter] = useState('All');
  
  // 1. Loading State
  const [isLoading, setIsLoading] = useState(true);

  // 2. Preloader Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); 
    
    return () => clearTimeout(timer);
  }, []);

  // Filter Logic
  const filteredProjects = projects.filter(project => 
    activeFilter === 'All' ? true : project.category === activeFilter
  );

  // 3. The Coder Preloader UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center font-mono selection:bg-brand-red selection:text-white">
        <div className="text-center">
          <div className="text-4xl md:text-6xl font-black mb-6 flex items-center justify-center gap-4">
            <span className="text-slate-700">{"{"}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-blue animate-pulse">
              {profile.name.split(' ')[0].toUpperCase()}
            </span>
            <span className="text-slate-700">{"}"}</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-brand-blue text-sm md:text-base">
            <span className="text-brand-red">~</span>
            <span className="text-slate-400">/portfolio</span>
            <span className="text-brand-blue">❯</span>
            <span className="text-slate-300 animate-pulse">Initializing_Systems...</span>
            <span className="w-2.5 h-5 bg-brand-blue animate-ping ml-1"></span>
          </div>

          <div className="mt-8 w-64 h-1 bg-slate-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-brand-red to-brand-blue animate-[spin_2s_linear_infinite] w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Main Application
  return (
    <div className="min-h-screen bg-app-bg text-slate-300 font-sans selection:bg-brand-red selection:text-white animate-[fadeIn_0.5s_ease-in-out]">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-app-bg/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-white">
            {profile.name.split(' ')[0]}<span className="text-brand-red">.</span>
          </div>
          <div className="hidden md:flex gap-8 font-semibold text-sm text-slate-400">
            <a href="#work" className="hover:text-brand-blue transition-colors">Work</a>
            <a href="#contact" className="hover:text-brand-blue transition-colors">Contact</a>
          </div>
          <a href="#contact" className="px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-brand-red transition-all shadow-lg shadow-brand-blue/20">
            Let's Talk
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 bg-blue-dim text-brand-blue border border-brand-blue/20 font-bold text-xs tracking-widest uppercase rounded-full mb-6">
              Available for Work
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white leading-tight mb-6">
              Building <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-blue">
                Dynamic
              </span> Digital <br/> Experiences.
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-lg font-medium leading-relaxed">
              I'm {profile.name}, a {profile.title} based in {profile.location}. I engineer high-performance web applications with a focus on modern, impactful design.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#work" className="px-8 py-4 bg-brand-red text-white font-bold rounded-xl hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-xl shadow-brand-red/20">
                View Projects
              </a>
              <a href="#contact" className="px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-brand-blue hover:bg-blue-dim transition-all">
                Contact Me
              </a>
              
              {/* NAYA RESUME DOWNLOAD BUTTON */}
              <a 
                href={profile.resumeUrl}
                download
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-6 py-4 bg-app-surface text-slate-300 font-bold rounded-xl border border-slate-700 hover:text-white hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/10 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Resume
              </a>
            </div>
          </div>
          
          <div className="relative h-[500px] w-full hidden md:block">
            <div className="absolute top-10 right-10 w-72 h-72 bg-brand-blue rounded-3xl rotate-12 opacity-20 blur-xl"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-brand-red rounded-full opacity-10 mix-blend-screen blur-2xl"></div>
            <div className="absolute inset-0 border-[4px] border-slate-800/50 rounded-[3rem] transform -rotate-3 z-10 bg-app-surface/40 backdrop-blur-xl flex items-center justify-center shadow-2xl">
              <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-700 to-slate-800">{"</>"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Project Grid */}
      <section id="work" className="py-24 bg-app-surface border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-black text-white mb-4">Selected Works</h2>
              <p className="text-slate-400 font-medium">A showcase of recent functional web designs & panels.</p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                    activeFilter === cat 
                    ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20' 
                    : 'bg-transparent text-slate-500 border-slate-800 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredProjects.map((project) => (
              <div key={project.id} className="group flex flex-col bg-app-bg rounded-2xl border border-slate-800 overflow-hidden hover:border-brand-blue/50 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden border-b border-slate-800 flex items-center justify-center">
                   <div className="absolute inset-0 bg-gradient-to-br from-app-surface to-app-bg group-hover:scale-105 transition-transform duration-700"></div>
                   <h3 className="relative z-10 text-2xl font-black text-slate-700 group-hover:text-brand-blue transition-colors duration-300">
                     {project.title.split('-')[0]}
                   </h3>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs font-bold text-brand-red uppercase tracking-wider bg-red-dim px-2 py-1 rounded-md">{project.category}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-blue transition-colors">{project.title}</h3>
                  <p className="text-slate-400 leading-relaxed mb-6 flex-grow">{project.description}</p>
                  
                  <div className="flex gap-2 flex-wrap mb-8">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-xs font-semibold px-3 py-1.5 bg-app-surface text-slate-300 rounded-md border border-slate-800">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* DYNAMIC LINKS SECTION */}
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-800">
                    
                    {/* Primary Button (Visit Website OR Open Panel) */}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-white hover:text-brand-red transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {project.category === 'Panel' ? 'Open Panel' : 'Visit Website'}
                      </a>
                    )}

                    {/* Secondary Button (Admin Panel - ONLY visible if category is Website / Admin Panel) */}
                    {project.category === 'Website / Admin Panel' && project.panelUrl && (
                      <a href={project.panelUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin Panel
                      </a>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Contact Section */}
      <section id="contact" className="py-24 bg-app-bg">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black text-white mb-8">Ready to start a project?</h2>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            I am currently available for new opportunities. Reach out via email or phone to discuss your next big idea.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-16">
            <a href={`mailto:${profile.email}`} className="flex items-center gap-4 px-8 py-4 bg-app-surface border border-slate-800 rounded-2xl hover:border-brand-red transition-all w-full md:w-auto">
              <span className="text-2xl text-brand-red">✉️</span>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-500 uppercase">Email Me</div>
                <div className="font-bold text-white">{profile.email}</div>
              </div>
            </a>
            
            <a href={`tel:${profile.mobile}`} className="flex items-center gap-4 px-8 py-4 bg-app-surface border border-slate-800 rounded-2xl hover:border-brand-blue transition-all w-full md:w-auto">
              <span className="text-2xl text-brand-blue">📱</span>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-500 uppercase">Call Me</div>
                <div className="font-bold text-white">{profile.mobile}</div>
              </div>
            </a>
          </div>

          <div className="pt-12 border-t border-slate-800/50 text-slate-500 font-medium">
            <p>Based in {profile.location} • &copy; {new Date().getFullYear()} {profile.name}</p>
          </div>
        </div>
      </section>

    </div>
  );
}