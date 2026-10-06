import React, { useState, useEffect } from 'react';
import { ArrowRight, Code2, Layout, Database, Terminal, Edit3, X, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

const Home = () => {
    // --- DATA STATES ---
    const [latestProjects, setLatestProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- SECRET ADMIN STATES ---
    const [clickCount, setClickCount] = useState(0);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [authError, setAuthError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    // --- EDIT HOME DATA STATES ---
    const [showEditHomeModal, setShowEditHomeModal] = useState(false);
    const [editSkillsInput, setEditSkillsInput] = useState('');

    // 1. Fetch Data & Verify Token on Page Load
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Home Data (Skills)
                const homeRes = await axios.get('http://localhost:5000/api/home');
                if (homeRes.data.success) {
                    setSkills(homeRes.data.data.skills);
                }

                // Fetch Latest Projects (Limit to top 3)
                const projRes = await axios.get('http://localhost:5000/api/projects');
                if (projRes.data.success) {
                    setLatestProjects(projRes.data.data.slice(0, 3)); // Sirf shuru ke 3 projects
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        const verifyToken = async () => {
            const token = localStorage.getItem('admin_jwt_token');
            if (token) {
                try {
                    await axios.get('http://localhost:5000/api/auth/verify', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setIsEditing(true);
                } catch (error) {
                    localStorage.removeItem('admin_jwt_token');
                }
            }
        };

        fetchData();
        verifyToken();
    }, []);

    // 2. Secret Click Timer (5 clicks in 2 seconds)
    useEffect(() => {
        if (clickCount > 0) {
            const timer = setTimeout(() => setClickCount(0), 2000);
            return () => clearTimeout(timer);
        }
    }, [clickCount]);

    const handleSecretClick = () => {
        setClickCount((prev) => {
            const newCount = prev + 1;
            if (newCount === 5) {
                setShowAuthModal(true);
                return 0;
            }
            return newCount;
        });
    };

    // 3. Handle Admin Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsAuthLoading(true);
        setAuthError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { passcode });
            if (response.data.success) {
                localStorage.setItem('admin_jwt_token', response.data.token);
                setIsEditing(true);
                setShowAuthModal(false);
                setPasscode('');
            }
        } catch (error) {
            setAuthError(error.response?.data?.message || 'Access Denied.');
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_jwt_token');
        setIsEditing(false);
    };

    // 4. Handle Save Home Edits (Skills)
    const handleSaveHomeEdits = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_jwt_token');

            // String ko array me convert karna
            const techArray = editSkillsInput.split(',').map((item) => item.trim()).filter(item => item !== "");

            const response = await axios.put('http://localhost:5000/api/home', { skills: techArray }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setSkills(response.data.data.skills);
                setShowEditHomeModal(false);
                // Success alert add kar diya
                alert("Skills updated successfully! 🚀");
            }
        } catch (error) {
            console.error("Full Error:", error);
            // Asli error message alert me dikhayega
            alert(`Error: ${error.response?.data?.message || error.message || "Failed to update skills"}`);
        }
    };

    // Open Edit Modal with current data
    const openEditModal = () => {
        setEditSkillsInput(skills.join(', '));
        setShowEditHomeModal(true);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#fafcff]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
    }

    return (
        <div className="bg-[#fafcff] min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 relative">

            {/* EDIT MODE FLOATING BADGE */}
            {isEditing && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-2 font-bold">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        Edit Mode Active
                    </div>
                    <button onClick={handleLogout} className="bg-white/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                        Exit
                    </button>
                </div>
            )}

            {/* 1. HERO SECTION */}
            <section className="relative pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm text-slate-600 font-medium text-sm mb-10 transition-all hover:border-blue-200 hover:bg-blue-50/50">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Accepting new projects
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[1.1]">
                    Designing logic. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
                        Building reality
                        {/* HIDDEN SECRET TRIGGER */}
                        <span onClick={handleSecretClick} className="cursor-default text-slate-900 select-none">.</span>
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mb-12 font-medium leading-relaxed tracking-tight">
                    I'm a Full-Stack Web Developer crafting scalable applications, from robust MySQL architectures to pixel-perfect React interfaces.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto z-10">
                    <Link to="/projects" className="group bg-slate-900 hover:bg-slate-800 text-white px-9 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/15 hover:shadow-2xl hover:-translate-y-0.5">
                        Explore My Work
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/contact" className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-9 py-4 rounded-2xl font-bold transition-all flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        Let's Talk
                    </Link>
                </div>
            </section>

            {/* 2. BENTO GRID ABOUT SECTION (With Edit Option for Skills) */}
            <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto relative">
                <div className="grid md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">

                    <div className="md:col-span-2 bg-white p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between group hover:border-blue-100 transition-colors duration-500">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">The Architect Behind the Code</h2>
                            <p className="text-slate-600 leading-relaxed text-lg mb-8 font-medium">
                                I bridge the gap between complex database systems and seamless user experiences. Whether it's designing dynamic REST APIs with Express or building reactive UI layouts, I engineer solutions that are built to scale and designed to convert.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-100">
                            <div className="flex flex-col gap-2"><Code2 className="text-blue-500 mb-1" size={28} strokeWidth={1.5} /><span className="text-slate-900 font-bold">Clean Code</span></div>
                            <div className="flex flex-col gap-2"><Layout className="text-indigo-500 mb-1" size={28} strokeWidth={1.5} /><span className="text-slate-900 font-bold">Modern UI</span></div>
                            <div className="flex flex-col gap-2"><Database className="text-purple-500 mb-1" size={28} strokeWidth={1.5} /><span className="text-slate-900 font-bold">Relational DBs</span></div>
                        </div>
                    </div>

                    <div className="relative bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col justify-end">
                        {/* Admin Edit Button for Skills */}
                        {isEditing && (
                            <button onClick={openEditModal} className="absolute top-6 right-6 z-20 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-colors cursor-pointer">
                                <Edit3 size={20} />
                            </button>
                        )}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 blur-[80px] rounded-full pointer-events-none"></div>
                        <div className="absolute top-8 left-8 text-white/20"><Terminal size={48} strokeWidth={1} /></div>
                        <div className="relative z-10 mt-20">
                            <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Core Arsenal</h3>
                            <div className="flex flex-wrap gap-2.5">
                                {skills.map((skill, index) => (
                                    <span key={index} className="bg-white/10 hover:bg-white/20 text-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 transition-colors cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* 3. HORIZONTAL SCROLL PROJECTS */}
            <section className="py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 flex justify-between items-end">
                    <div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Selected Work</h2>
                        <p className="text-slate-500 font-medium text-xl">Drag or scroll to explore recent builds.</p>
                    </div>
                    <Link to="/projects" className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700">
                        View All <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="flex overflow-x-auto gap-8 px-6 lg:px-8 pb-16 snap-x snap-mandatory hide-scrollbar max-w-[100vw]">
                    <div className="w-[calc((100vw-80rem)/2)] flex-shrink-0 hidden lg:block"></div>

                    {latestProjects.length > 0 ? latestProjects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            title={project.title}
                            category={project.category}
                            description={project.description}
                            image={project.image}
                            tech={project.tech}
                            liveLink={project.liveLink}
                            adminLink={project.adminLink}
                        />
                    )) : (
                        <div className="text-slate-500 italic">No projects found. Add some from the Projects page!</div>
                    )}

                    <div className="w-[calc((100vw-80rem)/2)] flex-shrink-0 hidden lg:block"></div>
                </div>
            </section>

            {/* 4. CTA SECTION */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-[3rem] overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none"></div>
                    <div className="relative p-16 md:p-24 text-center z-10">
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-tight">
                            Let's build something <br className="hidden md:block" /> extraordinary.
                        </h2>
                        <Link to="/contact" className="group bg-white hover:bg-slate-50 text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg transition-all inline-flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 duration-300">
                            Start a Conversation <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- HIDDEN ADMIN AUTH MODAL --- */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in">
                        <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
                            <X size={20} />
                        </button>
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6"><Lock size={32} className="text-white" /></div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Restricted Access</h3>
                        <p className="text-slate-500 font-medium mb-8">Enter the master code to authenticate.</p>
                        <form onSubmit={handleLogin}>
                            <div className="mb-6">
                                <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Secret code" autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-center font-bold tracking-widest outline-none focus:ring-4 focus:border-blue-500" />
                                {authError && <p className="text-red-500 text-sm mt-3 font-bold text-center">{authError}</p>}
                            </div>
                            <button type="submit" disabled={isAuthLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl">
                                {isAuthLoading ? 'Verifying...' : 'Authenticate'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- EDIT HOME DATA (SKILLS) MODAL --- */}
            {showEditHomeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 md:p-10 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in">
                        <button onClick={() => setShowEditHomeModal(false)} className="absolute top-6 right-6 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={20} /></button>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Core Arsenal (Skills)</h2>
                        <form onSubmit={handleSaveHomeEdits}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-900 mb-2">Skills (Comma Separated)</label>
                                <textarea
                                    value={editSkillsInput}
                                    onChange={(e) => setEditSkillsInput(e.target.value)}
                                    rows="4"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:border-blue-500 resize-none"
                                    placeholder="React, Node.js, Express"
                                />
                                <p className="text-xs text-slate-500 mt-2">Example: React.js, Tailwind CSS, MySQL</p>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;