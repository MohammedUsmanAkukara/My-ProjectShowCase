import React, { useState } from 'react';
import portfolioData from './data/portfolioData.json';

export default function App() {
  const { profile, projects, categories } = portfolioData;
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredProjects = projects.filter(project => 
    activeFilter === 'All' ? true : project.category === activeFilter
  );

  return (
    <div className="min-h-screen bg-app-bg text-slate-300 font-sans selection:bg-brand-red selection:text-white">
      
      {/* Crisp Dark Navigation */}
      <nav className="sticky top-0 z-50 bg-app-bg/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-white">
            {profile.name.split(' ')[0]}<span className="text-brand-red">.</span>
          </div>
          <div className="hidden md:flex gap-8 font-semibold text-sm text-slate-400">
            <a href="#work" className="hover:text-brand-blue transition-colors">Work</a>
            <a href="#about" className="hover:text-brand-blue transition-colors">About</a>
            <a href="#contact" className="hover:text-brand-blue transition-colors">Contact</a>
          </div>
          <a href="#contact" className="px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-brand-red transition-all shadow-lg shadow-brand-blue/20">
            Let's Talk
          </a>
        </div>
      </nav>

      {/* Energetic Red & Blue Hero Section */}
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
            <div className="flex items-center gap-4">
              <a href="#work" className="px-8 py-4 bg-brand-red text-white font-bold rounded-xl hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-xl shadow-brand-red/20">
                View Projects
              </a>
              <a href="#contact" className="px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-brand-blue hover:bg-blue-dim transition-all">
                Contact Me
              </a>
            </div>
          </div>
          
          {/* Geometric Decor - Red and Blue Glows */}
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
              <p className="text-slate-400 font-medium">A showcase of recent functional web designs.</p>
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
                
                {/* Image Placeholder area */}
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

                  {/* Links */}
                  <div className="flex items-center gap-6 pt-6 border-t border-slate-800">
                    <a href={project.liveUrl} className="flex items-center gap-2 text-sm font-bold text-white hover:text-brand-red transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live Demo
                    </a>
                    <a href={project.githubUrl} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      Source Code
                    </a>
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