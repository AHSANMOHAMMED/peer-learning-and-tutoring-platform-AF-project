import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Video, BookOpen, Brain, Zap, Shield, 
  ArrowRight, Star, CheckCircle, MessageCircle, 
  TrendingUp, Globe, Award, ChevronRight, Play,
  Mail, MapPin, Phone, Github, Linkedin, Twitter, Facebook
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { cn } from '../utils/cn';
import AuraLogo from '../components/AuraLogo';

const slides = [
  {
    image: '/hero1.png',
    title: 'Future of Education in Sri Lanka',
    subtitle: 'Aura is the island\'s most advanced peer learning network. We connect A/L & O/L students with top-percentile university mentors for unparalleled academic success.',
    badge: '10,000+ Students Joined',
    color: '#00a8cc'
  },
  {
    image: '/hero2.png',
    title: 'Expert 1-on-1 Guidance',
    subtitle: 'Learn directly from university undergrads and expert teachers who have mastered the Sri Lankan & London syllabus. Get personalized attention that traditional classrooms can\'t provide.',
    badge: '500+ Verified Tutors',
    color: '#6366f1'
  },
  {
    image: '/hero3.png',
    title: 'AI-Powered Learning Support',
    subtitle: 'Aura\'s integrated AI Assistant provides 24/7 homework help, step-by-step problem solving, and smart revision plans tailored to your specific learning pace.',
    badge: 'State-of-the-Art Tech',
    color: '#10b981'
  }
];

const features = [
  {
    icon: Video,
    title: 'Virtual Classrooms',
    description: 'High-definition video sessions with real-time collaborative whiteboards and screen sharing.',
    color: 'bg-blue-500/10 text-blue-600'
  },
  {
    icon: Brain,
    title: 'AI Study Assistant',
    description: 'Instant answers to your toughest questions and personalized study plans driven by AI.',
    color: 'bg-emerald-500/10 text-emerald-600'
  },
  {
    icon: BookOpen,
    title: 'Resource Library',
    description: 'Access premium notes, past papers, and video lectures curated by top Sri Lankan educators.',
    color: 'bg-purple-500/10 text-purple-600'
  },
  {
    icon: Users,
    title: 'Peer Learning Groups',
    description: 'Join subject-specific study groups to solve doubts and compete in knowledge challenges.',
    color: 'bg-orange-500/10 text-orange-600'
  }
];

const stats = [
  { val: '95%', label: 'Pass Rate' },
  { val: '24/7', label: 'AI Support' },
  { val: '150+', label: 'Schools' },
  { val: 'LKR 0', label: 'Initial Cost' }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <PublicLayout>
      <div className="w-full font-sans overflow-x-hidden">
        
        {/* Hero Slider Section */}
        <section className="relative h-[90vh] overflow-hidden rounded-[3.5rem] mx-4 my-4 shadow-2xl border border-slate-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              {/* Overlay Gradient for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-10" />
              <motion.img 
                key={`${currentSlide}-img`}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 8, ease: "linear" }}
                src={slides[currentSlide].image} 
                className="w-full h-full object-cover" 
                alt={slides[currentSlide].title} 
              />
            </motion.div>
          </AnimatePresence>
 
          <div className="relative z-20 h-full flex flex-col justify-center px-10 md:px-24 max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentSlide}-content`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white"
                >
                  <span className="w-2 h-2 bg-[#00a8cc] rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{slides[currentSlide].badge}</span>
                </motion.div>
 
                <div className="space-y-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter"
                  >
                    {slides[currentSlide].title.split(' ').map((word, i) => (
                      <span key={i} className={cn(i === 2 ? "text-[#00a8cc]" : "")}>
                        {word}{' '}
                      </span>
                    ))}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                </div>
 
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-5 pt-4"
                >
                  <button onClick={() => navigate('/register')} className="bg-[#00a8cc] hover:bg-[#008ba8] text-white px-12 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#00a8cc]/40 transition-all flex items-center gap-3 group">
                    Join Now Free <ArrowRight className="group-hover:translate-x-2 transition-transform" size={18} />
                  </button>
                  <button onClick={() => navigate('/tutors')} className="bg-white/5 hover:bg-white/15 backdrop-blur-3xl border border-white/10 text-white px-12 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all">
                    Explore Mentors
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
 
          {/* Slider Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 z-30 flex">
             {slides.map((_, i) => (
                <div key={i} className="flex-1 h-full bg-white/10 overflow-hidden">
                   {i === currentSlide && (
                      <motion.div 
                         initial={{ x: '-100%' }}
                         animate={{ x: '0%' }}
                         transition={{ duration: 6, ease: "linear" }}
                         className="h-full bg-[#00a8cc]"
                      />
                   )}
                   {i < currentSlide && <div className="h-full bg-[#00a8cc]/40" />}
                </div>
             ))}
          </div>
 
          {/* Navigation Dots */}
          <div className="absolute bottom-12 right-12 z-30 flex flex-col gap-4">
             {slides.map((_, i) => (
               <button 
                 key={i} 
                 onClick={() => setCurrentSlide(i)}
                 className={cn(
                   "group relative flex items-center justify-end gap-4 transition-all duration-300",
                   i === currentSlide ? "opacity-100" : "opacity-30 hover:opacity-60"
                 )}
               >
                 <span className={cn(
                   "text-[10px] font-black text-white uppercase tracking-widest transition-all duration-300",
                   i === currentSlide ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                 )}>Slide {i + 1}</span>
                 <div className={cn(
                   "h-2 rounded-full transition-all duration-500", 
                   i === currentSlide ? "w-12 bg-[#00a8cc]" : "w-3 bg-white"
                 )} />
               </button>
             ))}
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-20 px-8">
           <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <div key={i} className="text-center group cursor-default">
                   <h3 className="text-2xl md:text-4xl font-black text-slate-900 mb-1 group-hover:text-[#00a8cc] transition-colors">{s.val}</h3>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-8 bg-slate-50 rounded-[5rem]">
           <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
                 <div className="max-w-2xl">
                    <span className="text-[9px] font-black text-[#00a8cc] uppercase tracking-[0.2em] mb-3 block">Platform Excellence</span>
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">Everything you need to ace your exams.</h2>
                 </div>
                 <button onClick={() => navigate('/register')} className="text-slate-900 font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                    See All Features <ChevronRight size={20} />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {features.map((f, i) => (
                   <div key={i} className="premium-card group cursor-pointer hover:-translate-y-2">
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", f.color)}>
                         <f.icon size={32} />
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mb-3">{f.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{f.description}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* AI Showcase Section */}
        <section className="py-32 px-8 relative overflow-hidden">
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
              <div className="flex-1 relative">
                 <div className="absolute inset-0 bg-[#00a8cc]/20 blur-[120px] rounded-full" />
                 <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} className="relative bg-white p-4 rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <img src={slides[2].image} className="rounded-[2.5rem] w-full" alt="AI Feature" />
                    <div className="absolute bottom-12 left-12 right-12 glass-overlay p-8 rounded-3xl">
                       <div className="flex items-center gap-4 mb-2">
                          <Brain className="text-[#00a8cc]" size={24} />
                          <span className="text-white font-bold">AI Assistant Active</span>
                       </div>
                       <p className="text-white/80 text-sm">Scanning handwritten notes... Analysis complete.</p>
                    </div>
                 </motion.div>
              </div>
              <div className="flex-1">
                 <span className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 block">Next-Gen Technology</span>
                 <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">Artificial Intelligence that understands your syllabus.</h2>
                 <p className="text-base text-slate-500 font-medium leading-relaxed mb-12">Our AI homework assistant doesn't just give answers; it provides step-by-step explanations tailored to the Sri Lankan local and London curriculum.</p>
                 <div className="space-y-6">
                    {[
                      'Instant Doubt Resolution',
                      'Handwritten Text OCR',
                      'Personalized Revision Quizzes',
                      'Multilingual Support (Sinhala/Tamil/English)'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-slate-800 font-bold">
                         <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                            <CheckCircle size={14} />
                         </div>
                         {item}
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Community Testimonials */}
        <section className="py-24 px-8 bg-slate-900 text-white rounded-[4rem] mx-4">
           <div className="max-w-7xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">Loved by thousands across the island.</h2>
              <p className="text-slate-400 font-medium">Hear from students who changed their grades with Aura.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Ravindu P.', role: 'A/L Bio Student', quote: 'The AI assistant saved me hours of frustration. Best platform for local students.' },
                { name: 'Sithmi K.', role: 'O/L Student', quote: 'Finding a tutor who actually understands how to teach complex math was so easy here.' },
                { name: 'Dilshan M.', role: 'A/L Maths Student', quote: 'Interactive whiteboards make online learning feel even better than physical classes.' }
              ].map((t, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-md">
                   <div className="flex gap-1 mb-6">
                      {[1,2,3,4,5].map(star => <Star key={star} size={16} fill="#00a8cc" className="text-[#00a8cc]" />)}
                   </div>
                   <p className="text-xl font-medium mb-8 leading-relaxed italic">"{t.quote}"</p>
                   <div>
                      <h4 className="font-black text-white">{t.name}</h4>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.role}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-8 text-center">
           <div className="max-w-4xl mx-auto bg-slate-50 p-12 md:p-24 rounded-[4rem] border border-slate-100 shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a8cc]/10 blur-[100px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
              
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">Ready to start your journey?</h2>
              <p className="text-base text-slate-500 font-medium mb-12">Create your free account today and join the most advanced peer learning community in Sri Lanka.</p>
              
              <div className="flex flex-col md:flex-row justify-center gap-4">
                 <button onClick={() => navigate('/register')} className="bg-[#00a8cc] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-[#00a8cc]/20 transition-all">Start Free Trial</button>
                 <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all">Login to Portal</button>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="pt-32 pb-12 px-8 bg-slate-950 text-white">
           <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 pb-20 border-b border-white/5">
              <div>
                 <div className="flex items-center gap-3 mb-8">
                    <AuraLogo size={40} />
                    <h3 className="text-3xl font-black tracking-tighter">Aura</h3>
                 </div>
                 <p className="text-slate-400 font-medium leading-relaxed mb-8">Revolutionizing peer learning and tutoring for every Sri Lankan student.</p>
                 <div className="flex gap-4">
                    {[Twitter, Github, Linkedin, Facebook].map((Icon, i) => (
                      <button key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-[#00a8cc] hover:text-white transition-all"><Icon size={18} /></button>
                    ))}
                 </div>
              </div>
              <div>
                 <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-8">Platform</h4>
                 <ul className="space-y-4 text-slate-400 font-bold">
                    <li><button className="hover:text-white transition-colors">Find a Mentor</button></li>
                    <li><button className="hover:text-white transition-colors">Live Classrooms</button></li>
                    <li><button className="hover:text-white transition-colors">Study Resources</button></li>
                    <li><button className="hover:text-white transition-colors">AI Assistant</button></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-8">Support</h4>
                 <ul className="space-y-4 text-slate-400 font-bold">
                    <li><button className="hover:text-white transition-colors">Help Center</button></li>
                    <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                    <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
                    <li><button className="hover:text-white transition-colors">Contact Us</button></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-8">Contact</h4>
                 <ul className="space-y-4 text-slate-400 font-bold">
                    <li className="flex items-center gap-3"><Mail size={16} /> hello@aura.lk</li>
                    <li className="flex items-center gap-3"><Phone size={16} /> +94 11 234 5678</li>
                    <li className="flex items-center gap-3"><MapPin size={16} /> Colombo, Sri Lanka</li>
                 </ul>
              </div>
           </div>
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-slate-500 text-sm font-medium">&copy; 2026 Aura Learning Platform. All rights reserved.</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Network Status: Optimal</span>
              </div>
           </div>
        </footer>

      </div>
    </PublicLayout>
  );
};

export default LandingPage;