import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AuraLogo from './AuraLogo';
import { cn } from '../utils/cn';

const PublicLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Tutors', path: '/tutors' },
    { name: 'Study Library', path: '/library' },
    { name: 'Knowledge Hub', path: '/qa' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-aura-100 selection:text-aura-900">
      
      {/* Premium Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 py-4 md:px-20",
        scrolled ? "bg-white/80 backdrop-blur-2xl border-b border-slate-100 py-3 shadow-sm" : "bg-transparent py-6"
      )}>
         <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
               <AuraLogo size={42} className="group-hover:rotate-12 transition-transform" />
               <span className={cn(
                 "text-2xl font-black tracking-tighter transition-colors",
                 scrolled ? "text-slate-900" : "text-slate-900" 
               )}>Aura</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
               {navLinks.map(link => (
                 <Link 
                   key={link.name} 
                   to={link.path} 
                   className="text-[11px] font-black text-slate-500 hover:text-[#00a8cc] transition-all uppercase tracking-[0.2em]"
                 >
                   {link.name}
                 </Link>
               ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
               <button 
                 onClick={() => navigate('/login')} 
                 className="px-6 py-2.5 text-xs font-black text-slate-600 hover:text-slate-900 uppercase tracking-widest transition-colors"
               >
                 Sign In
               </button>
               <button 
                 onClick={() => navigate('/register')} 
                 className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-xl hover:bg-[#00a8cc] hover:-translate-y-0.5 transition-all active:scale-95"
               >
                 Get Started
               </button>
            </div>

            {/* Mobile Toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-slate-900">
               {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
         </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
         {isMenuOpen && (
           <motion.div 
             initial={{ opacity: 0, x: '100%' }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: '100%' }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
             className="fixed inset-0 z-[110] bg-white pt-24 px-8 md:hidden"
           >
              <div className="flex flex-col gap-8">
                 <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 p-2">
                    <X size={32} />
                 </button>
                 {navLinks.map(link => (
                   <Link 
                     key={link.name} 
                     to={link.path} 
                     onClick={() => setIsMenuOpen(false)} 
                     className="text-4xl font-black text-slate-900 tracking-tighter hover:text-[#00a8cc] transition-colors"
                   >
                     {link.name}
                   </Link>
                 ))}
                 <div className="pt-12 flex flex-col gap-4">
                    <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="w-full py-5 border-2 border-slate-100 rounded-[2rem] font-black uppercase tracking-widest text-slate-600">Sign In</button>
                    <button onClick={() => { setIsMenuOpen(false); navigate('/register'); }} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl">Create Account</button>
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      <main>
         {children}
      </main>

    </div>
  );
};

export default PublicLayout;
