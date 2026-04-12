import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Play, Sparkles, Users, BrainCircuit, Trophy, CheckCircle2, ChevronRight, Globe, ShieldCheck, Cpu, ArrowRight, Heart, Database, Target } from 'lucide-react';
import { cn } from '../utils/cn';
import AuraLogo from '../components/AuraLogo';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4 md:px-10",
      scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
    )}>
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <AuraLogo size={32} className="text-[#00a8cc]" />
          <span className="text-2xl font-black tracking-tight text-slate-800">Aura</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
          <a href="#subjects" className="hover:text-[#00a8cc] transition-colors">Subjects</a>
          <a href="#how" className="hover:text-[#00a8cc] transition-colors">How it works</a>
          <a href="#tutors" className="hover:text-[#00a8cc] transition-colors">Mentors</a>
          <a href="#faq" className="hover:text-[#00a8cc] transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-[#00a8cc] transition-colors hidden md:block">Log In</Link>
          <Link to="/register" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-[#00a8cc] transition-colors shadow-soft">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

const TrustedTicker = () => {
  return (
    <div className="py-10 bg-slate-50 border-y border-slate-100 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                     <img src={`/images/srilankan_tutor_${i % 2 === 0 ? 'female' : 'male'}_17758327${i % 2 === 0 ? '44468' : '26155'}.png`} alt="" className="w-full h-full object-cover" />
                  </div>
               ))}
            </div>
            <div>
               <p className="text-lg font-bold text-slate-800">12,400+ Students</p>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Actively Learning</p>
            </div>
         </div>
         <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-40 grayscale">
            {['Royal College', 'Visakha Vidyalaya', 'Musaeus College', 'Ananda College', 'UOM', 'UOC'].map((name) =>
               <span key={name} className="font-bold text-slate-800 uppercase tracking-widest text-sm">{name}</span>
            )}
         </div>
      </div>
    </div>
  );
};

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    { q: "How are tutors verified?", a: "Every mentor undergoes a rigorous identity and achievement verification process, including background checks and academic transcript reviews, to ensure educational excellence." },
    { q: "Is the platform available in Sinhala or Tamil?", a: "Yes, Aura provides full support for English, Sinhala, and Tamil mediums. You can learn in the language you are most comfortable with." },
    { q: "How does AI matching work?", a: "Our algorithm analyzes your learning profile, past performance, and specific syllabus needs to pair you with the most suitable mentor." },
    { q: "Can I record my sessions?", a: "All live interactive sessions are automatically recorded and saved in your personal dashboard for later review." }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {faqs.map((faq, i) => (
        <div key={i} className={cn("bg-white border rounded-2xl cursor-pointer transition-all", openIndex === i ? "border-[#00a8cc] shadow-soft" : "border-slate-100")} onClick={() => setOpenIndex(openIndex === i ? null : i)}>
            <div className="px-6 py-6 flex justify-between items-start gap-4">
              <div>
                 <span className={cn("font-bold text-lg", openIndex === i ? "text-[#00a8cc]" : "text-slate-800")}>{faq.q}</span>
                 {openIndex === i && <p className="text-slate-500 mt-3 font-medium text-sm">{faq.a}</p>}
              </div>
              <ChevronDown size={20} className={cn("transition-transform shrink-0 mt-1", openIndex === i ? "rotate-180 text-[#00a8cc]" : "text-slate-400")} />
            </div>
        </div>
      ))}
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00a8cc]/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-10 overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e8f6fa] rounded-full blur-3xl -z-10" />
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-100">
               <Sparkles size={14} /> The Future of Learning
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Master your <span className="text-[#00a8cc]">A/Levels</span><br />with top mentors.
            </h1>
            <p className="text-lg text-slate-500 max-w-lg mb-10 font-medium leading-relaxed">
               Sri Lanka's premier destination for academic excellence. Connect with verified university students and ace your exams together.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-[#00a8cc] transition-colors flex items-center gap-2 shadow-soft">
                Get Started <ArrowRight size={18} />
              </Link>
              <button className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2">
                 <Play size={18} /> Watch Demo
              </button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <img src="/images/aura_luminous_hero.png" alt="Students learning" className="w-full h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>

      <TrustedTicker />

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">How Aura Works</h2>
          <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">A simple, transparent process designed to get you the academic support you need quickly and effectively.</p>
        </div>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { step: '01', title: 'Create Profile', desc: 'Sign up and tell us about your syllabus, subjects, and study goals.', icon: Users },
            { step: '02', title: 'Find a Mentor', desc: 'Browse verified profiles and book sessions with experts that fit your style.', icon: Target },
            { step: '03', title: 'Start Learning', desc: 'Join interactive virtual classrooms with shared whiteboards and tools.', icon: BrainCircuit }
          ].map((item, i) => (
            <div key={i} className="text-center group p-6 rounded-3xl hover:bg-slate-50 transition-colors">
              <div className="w-20 h-20 mx-auto bg-[#e8f6fa] rounded-2xl flex items-center justify-center text-[#00a8cc] mb-6 group-hover:scale-110 transition-transform">
                <item.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-500 font-medium text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="py-24 px-6 bg-[#f8f9fc]">
        <div className="max-w-[1400px] mx-auto">
           <div className="flex justify-between items-end mb-16">
              <div>
                 <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Popular Subjects</h2>
                 <p className="text-slate-500 font-medium mt-4">Comprehensive coverage for core national syllabuses.</p>
              </div>
              <button className="hidden md:flex items-center gap-2 font-bold text-[#00a8cc] hover:text-[#008ba8] transition-colors">
                 View all subjects <ArrowRight size={16} />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                  { name: 'Combined Mathematics', desc: 'Pure & Applied Units', icon: Trophy, bg: 'bg-blue-50 text-blue-600' },
                  { name: 'Biological Sciences', desc: 'Medical Trajectory Hub', icon: Heart, bg: 'bg-rose-50 text-rose-600' },
                  { name: 'Physical Sciences', desc: 'Physics & Chemistry Mastery', icon: Database, bg: 'bg-purple-50 text-purple-600' },
                  { name: 'Commercial Stream', desc: 'Accounting & Business', icon: Cpu, bg: 'bg-emerald-50 text-emerald-600' }
               ].map((sub, i) => (
                 <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-[#00a8cc] hover:shadow-soft transition-all cursor-pointer group">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", sub.bg)}>
                       <sub.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{sub.name}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6">{sub.desc}</p>
                    <div className="text-[#00a8cc] font-bold text-sm flex items-center gap-2">
                       Explore <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* Tutors */}
      <section id="tutors" className="py-24 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Meet Our Top Mentors</h2>
            <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">Learn from the best. Our mentors are verified top-performers from premier universities in Sri Lanka.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { n: 'Kasun Perera', s: 'Combined Mathematics Specialist', u: 'UOM / Royal', r: '4.9', img: '/images/tutor-male.png' },
              { n: 'Tharushi Silva', s: 'Biological Sciences Mentor', u: 'UOC / Visakha', r: '5.0', img: '/images/tutor-female.png' },
              { n: 'Dulani Peiris', s: 'Physical Sciences Expert', u: 'UOP / Musaeus', r: '4.8', img: '/images/srilankan_tutor_female_1775832744468.png' }
            ].map((tutor, i) => (
              <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-soft transition-shadow flex items-start gap-6 cursor-pointer group">
                <img src={tutor.img} className="w-20 h-20 rounded-2xl object-cover bg-slate-50" alt={tutor.n} />
                <div>
                   <h4 className="text-lg font-bold text-slate-800 group-hover:text-[#00a8cc] transition-colors">{tutor.n}</h4>
                   <p className="text-slate-500 text-sm font-medium mb-2">{tutor.s}</p>
                   <div className="flex gap-2 text-xs font-bold">
                      <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-md">★ {tutor.r}</span>
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-[#f8f9fc]">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-16">Frequently Asked Questions</h2>
          <FAQAccordion />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
               <AuraLogo size={32} className="text-[#00a8cc]" />
               <span className="text-2xl font-black tracking-tight text-slate-800">Aura</span>
            </Link>
            <p className="text-slate-500 font-medium max-w-sm">Empowering students through peer-learning. Reach your full academic potential with Aura.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Platform</h4>
            <ul className="space-y-3 text-slate-500 font-medium">
              <li><Link to="/login" className="hover:text-[#00a8cc]">Login</Link></li>
              <li><Link to="/register" className="hover:text-[#00a8cc]">Sign Up</Link></li>
              <li><a href="#tutors" className="hover:text-[#00a8cc]">Find Mentors</a></li>
            </ul>
          </div>
          <div>
             <h4 className="font-bold text-slate-800 mb-4">Legal</h4>
             <ul className="space-y-3 text-slate-500 font-medium">
               <li><a href="#" className="hover:text-[#00a8cc]">Privacy Policy</a></li>
               <li><a href="#" className="hover:text-[#00a8cc]">Terms of Service</a></li>
               <li><a href="#" className="hover:text-[#00a8cc]">Code of Conduct</a></li>
             </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 font-medium text-sm">
          <span>© 2026 Aura Academic Platform. All rights reserved.</span>
          <div className="flex items-center gap-2 text-[#00a8cc] font-bold bg-[#e8f6fa] px-3 py-1.5 rounded-lg">
             <ShieldCheck size={16} /> Verified Safe Platform
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;