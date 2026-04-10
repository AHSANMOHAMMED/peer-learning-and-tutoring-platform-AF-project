import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  MessageSquare, 
  Award, 
  Monitor, 
  ChevronDown, 
  Star, 
  CheckCircle,
  Play
} from 'lucide-react';
import { cn } from '../utils/cn';

// --- Sub-Components ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-300 px-6 py-4",
        scrolled ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900 shadow-sm py-3" : "bg-transparent"
      )}
    >
      <div className="max-w-[1440px] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">PeerLearn</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-gray-600 dark:text-gray-400">
          <a href="#subjects" className="hover:text-primary transition-colors">Courses</a>
          <a href="#how" className="hover:text-primary transition-colors">How it works</a>
          <a href="#tutors" className="hover:text-primary transition-colors">Tutors</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQs</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary transition-all">Sign In</Link>
          <Link to="/register" className="px-8 py-3.5 bg-primary text-white text-sm font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Join PeerLearn</Link>
        </div>
      </div>
    </motion.nav>
  );
};

const TrustedTicker = () => (
  <div className="py-12 bg-gray-50/50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-900 overflow-hidden">
    <div className="max-w-[1440px] mx-auto px-6">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8">Trusted by students from the world's leading schools</p>
      <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all">
        {['Oxford', 'Stanford', 'MIT', 'Cambridge', 'Harvard'].map(name => (
          <span key={name} className="text-2xl font-black italic text-gray-500 tracking-tighter">{name} Academy</span>
        ))}
      </div>
    </div>
  </div>
);

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: "How does the AI matching algorithm work?", a: "Our proprietary AI analyzes your learning style, historical performance, and subject needs to rank hundreds of tutors in milliseconds, ensuring you find the perfect match." },
    { q: "Is the platform safe for younger students?", a: "Absolutely. We implement mandatory identity verification for all tutors and use AI-driven moderation to monitor all live sessions and shared materials." },
    { q: "Can I share my own study materials?", a: "Yes! PeerLearn is built on knowledge sharing. You can upload notes, practice exams, and summaries, and earn 'Trust Points' when others find them helpful." },
    { q: "What happens if a tutor is unavailable?", a: "Our real-time scheduling suggests alternatives instantly, and you can access recorded sessions or materials from other similar tutors in the meantime." }
  ];

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
          <button 
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full px-8 py-6 flex justify-between items-center text-left"
          >
            <span className="font-bold text-lg text-gray-950 dark:text-white">{faq.q}</span>
            <ChevronDown className={cn("transition-transform", openIndex === i && "rotate-180")} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-8 pb-8 text-gray-500 dark:text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

// --- Main Page ---

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <Navbar />
      
      {/* 1. Immersive Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden px-6">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 -z-10 bg-white dark:bg-gray-950">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[160px] rounded-full animate-float" style={{ animationDuration: '20s' }} />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/20 blur-[140px] rounded-full animate-float" style={{ animationDuration: '15s', animationDelay: '2s' }} />
        </div>

        <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 xl:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-10 border border-primary/20 shadow-sm">
              <Zap size={16} fill="currentColor" /> Web 3.0 Peer Learning Ecosystem
            </div>
            <h1 className="text-7xl lg:text-[100px] font-black text-gray-950 dark:text-white leading-[0.95] tracking-tight mb-10">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">Future</span> <br />
              Together.
            </h1>
            <p className="text-xl lg:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed mb-12">
              Transform your grades with the world's first AI-powered peer tutoring platform. Real-time collaboration, verified materials, and world-class mentors.
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <Link to="/register" className="px-12 py-6 bg-primary text-white font-black text-lg rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-4 group">
                Start Learning Now
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center gap-4 px-8 py-6 text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-900 rounded-[2rem] transition-all group">
                <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <Play size={18} fill="currentColor" />
                </div>
                Platform Demo
              </button>
            </div>

            <div className="mt-16 flex items-center gap-12 border-t border-gray-100 dark:border-gray-900 pt-10">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/150?u=${i+10}`} className="w-14 h-14 rounded-full border-4 border-white dark:border-gray-950" alt="" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-sm font-bold text-gray-500">4.9/5 from 10k+ reviews</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative hidden xl:block"
          >
            <div className="relative z-10 animate-float" style={{ animationDuration: '8s' }}>
              <img 
                src="/images/hero-3d.png" 
                alt="3D Dashboard View" 
                className="w-full h-auto rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/20"
              />
            </div>
            
            {/* Interactive HUD Elements */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-20 -right-10 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-2xl flex items-center justify-center font-bold">98%</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Match Accuracy</p>
                  <p className="text-sm font-bold">AI Tutor Matcher</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <TrustedTicker />

      {/* 2. Step-by-Step mastery */}
      <section id="how" className="py-32 px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/10 blur-[100px] rounded-full -z-10" />
              <img 
                src="/images/tutoring-3d.png" 
                className="w-full h-[600px] object-cover rounded-[4rem] shadow-2xl border-8 border-white dark:border-gray-900" 
                alt="3D Tutoring Collaboration" 
              />
            </div>
            <div className="space-y-10">
              <div>
                <h2 className="text-5xl lg:text-6xl font-black mb-6">How PeerLearn <br /> Works for You</h2>
                <p className="text-xl text-gray-500 leading-relaxed">We've streamlined the journey from confusion to mastery in three simple steps.</p>
              </div>
              <div className="space-y-8">
                {[
                  { n: '01', t: 'Smart Profiling', d: 'Connect your subjects and learning style to our AI database.' },
                  { n: '02', t: 'Dynamic Matching', d: 'Get matched with top-rated peer tutors specialized in your grade.' },
                  { n: '03', t: 'Real-time Mastery', d: 'Use high-end whiteboards and secure video to master any topic.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-2xl font-black text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      {item.n}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold mb-2">{item.t}</h4>
                      <p className="text-gray-500 leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Subjects Grid (Large) */}
      <section id="subjects" className="py-32 px-6 bg-gray-50 dark:bg-gray-900/40">
        <div className="max-w-[1440px] mx-auto text-center mb-20">
          <h2 className="text-6xl font-black mb-6">Master Any Subject</h2>
          <p className="text-2xl text-gray-500">From calculus to coding, we've got you covered.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {[
            { t: 'Combined Maths', d: 'Pure Maths, Applied Maths, Calculus', i: '📐', c: 'border-blue-500/20 bg-blue-500/5' },
            { t: 'Sciences', d: 'AL Physics, Chemistry, Biology', i: '🧪', c: 'border-emerald-500/20 bg-emerald-500/5' },
            { t: 'Commerce Stream', d: 'Accounting, Econ, Business Studies', i: '📊', c: 'border-amber-500/20 bg-amber-500/5' },
            { t: 'A/L ICT', d: 'Python, Networking, Database Systems', i: '💻', c: 'border-indigo-500/20 bg-indigo-500/5' }
          ].map((subj, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -16 }}
              className={cn("p-12 rounded-[3.5rem] border transition-all cursor-pointer", subj.c)}
            >
              <div className="text-6xl mb-8">{subj.i}</div>
              <h3 className="text-3xl font-black mb-4">{subj.t}</h3>
              <p className="text-gray-500 leading-relaxed">{subj.d}</p>
              <div className="mt-8 flex items-center gap-2 text-primary font-bold">
                Browse Tutors <ArrowRight size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Expert Tutors Section */}
      <section id="tutors" className="py-32 px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-6xl font-black mb-6">Meet Your Mentors</h2>
              <p className="text-2xl text-gray-500 leading-relaxed text-balance">The world's most talented students are teaching on PeerLearn. Join the community of experts.</p>
            </div>
            <Link to="/register" className="px-10 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black rounded-3xl hover:scale-105 transition-all">
              Become a Tutor
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {[
              { n: 'Alex Rivera', s: 'Physics Mentor', r: '4.98', u: 'Stanford', desc: 'Specializing in Quantum Mechanics and Advanced Electromagnetism for high-school honors students.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=2574' },
              { n: 'Sofia Zhang', s: 'Math Specialist', r: '5.0', u: 'Oxford', desc: 'Expert in competitive mathematics and SAT preparation with 500+ successful students coached.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=2574' },
              { n: 'Marcus Stone', s: 'CS Architect', r: '4.95', u: 'MIT', desc: 'Full-stack developer teaching the fundamentals of software architecture and system design.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=2574' }
            ].map((tutor, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-gray-900 rounded-[4rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-none relative group"
              >
                <img src={tutor.img} className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700" alt={tutor.n} />
                <div className="absolute inset-x-4 bottom-4 bg-white/70 dark:bg-gray-950/70 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-2xl font-black text-gray-950 dark:text-white">{tutor.n}</h4>
                      <p className="text-secondary font-bold text-sm">{tutor.s} • {tutor.u}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
                      <Star size={14} fill="currentColor" /> {tutor.r}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed line-clamp-2">
                    {tutor.desc}
                  </p>
                  <button className="w-full py-4 bg-gray-950 dark:bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all">
                    View Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQs Section */}
      <section id="faq" className="py-32 px-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black mb-6">Common Questions</h2>
            <p className="text-2xl text-gray-500">Everything you need to know about the ecosystem.</p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* 6. Grand Final CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-[1440px] mx-auto bg-primary rounded-[5rem] p-16 md:p-32 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(79,70,229,0.4)]">
          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black leading-tight mb-10 tracking-tighter"
            >
              Don't Learn Alone. <br /> Master the World.
            </motion.h2>
            <p className="text-xl md:text-3xl text-blue-100 font-medium mb-16 leading-relaxed max-w-2xl mx-auto opacity-90">
              Join 12,000+ students already accelerating their potential on PeerLearn.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/register" className="px-12 py-7 bg-white text-primary font-black text-xl rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-900/20">
                Join Now — It's Free
              </Link>
              <button className="px-12 py-7 bg-white/10 backdrop-blur-xl border-2 border-white/20 font-black text-xl rounded-3xl hover:bg-white/20 transition-all">
                Contact Support
              </button>
            </div>
          </div>
          {/* Abstract Decorations */}
          <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[150%] bg-gradient-to-br from-white/10 to-transparent blur-[120px] rounded-full rotate-45" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[80%] bg-accent/20 blur-[100px] rounded-full" />
        </div>
      </section>

      {/* 7. Robust Footer */}
      <footer className="bg-white dark:bg-gray-950 py-24 px-6 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl text-white">
                <Zap size={24} fill="currentColor" />
              </div>
              <span className="text-3xl font-black tracking-tighter">PeerLearn</span>
            </div>
            <p className="text-lg text-gray-500 leading-relaxed">
              Empowering the next generation through the world's most advanced peer tutoring ecosystem.
            </p>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer">
                  <Monitor size={20} />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-black text-xl mb-8 uppercase tracking-widest text-xs opacity-50">Platform</h4>
            <ul className="space-y-4 text-lg font-bold text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">Tutor Finder</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Study Groups</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Whiteboards</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Achievements</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xl mb-8 uppercase tracking-widest text-xs opacity-50">Company</h4>
            <ul className="space-y-4 text-lg font-bold text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Safety Desk</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xl mb-8 uppercase tracking-widest text-xs opacity-50">Newsletter</h4>
            <p className="text-gray-500 mb-8 leading-relaxed">Join 50,000+ monthly readers for learning tips and platform updates.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="you@email.com" 
                className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-4 flex-1 outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="p-4 bg-primary text-white rounded-2xl hover:opacity-90 active:scale-95 transition-all">
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto mt-24 pt-12 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-400 font-bold text-sm uppercase tracking-[0.2em]">
          <span>© 2026 PeerLearn Educational Technologies.</span>
          <div className="flex gap-8">
            <span>Built for the future.</span>
            <span>Made with passion.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
