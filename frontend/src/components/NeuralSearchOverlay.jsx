import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  X, 
  Zap, 
  Trophy, 
  Users, 
  Sparkles, 
  BookOpen, 
  Calendar,
  User,
  Cpu,
  Binary,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  BadgeCheck,
  Signal,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const NeuralSearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const searchResults = [
    { id: 'tutors', title: 'Find Mentors', icon: Users, path: '/tutors', description: 'Access top-tier university nodes across Sri Lanka.' },
    { id: 'forum', title: 'Knowledge Hub', icon: MessageSquare, path: '/qa', description: 'Synchronize resolutions with the peer collective.' },
    { id: 'ai', title: 'Aura AI Solver', icon: Sparkles, path: '/ai-homework', description: 'Real-time scholastic problem resolution engine.' },
    { id: 'merit', title: 'Achievement Vault', icon: Trophy, path: '/merit', description: 'Review your merit badges and scholastic credentials.' },
    { id: 'planner', title: 'Sync Planner', icon: Calendar, path: '/bookings', description: 'Manage your adaptive scholastic roadmap.' }
  ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || 
                   item.description.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] px-4 md:px-0">
          {/* Luminous Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white/40 backdrop-blur-[60px]"
          />

          {/* Search Hub */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-4xl bg-white/70 backdrop-blur-[120px] rounded-[4rem] border border-blue-100 shadow-3xl overflow-hidden text-left"
          >
             {/* Header */}
             <div className="px-12 py-6 border-b border-blue-50 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="p-3 bg-blue-500/10 rounded-xl"><Activity size={18} className="text-blue-600" /></div>
                   <span className="text-sm font-medium uppercase text-slate-400 tracking-normal">Aura_Hub_Navigator :: ACTIVE</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-normal bg-slate-50 px-6 py-2 rounded-full border border-slate-100 shadow-inner">
                   ESC to Terminate
                </div>
             </div>

             <div className="p-12 space-y-12">
                {/* Search Input */}
                <div className="relative group">
                   <div className="absolute left-10 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:scale-110 transition-transform duration-500">
                      <Search size={40} className="filter drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
                   </div>
                   <input
                     ref={inputRef}
                     type="text"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     placeholder="Enter Neural Query..."
                     className="w-full bg-white border-2 border-blue-50 rounded-[3rem] pl-28 pr-12 py-9 text-4xl font-medium text-slate-900 placeholder:text-slate-200 outline-none focus:border-blue-500 focus:shadow-xl transition-all duration-700 shadow-inner"
                   />
                   <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4 py-3 px-6 bg-slate-100 rounded-2xl border border-slate-200 text-slate-400 font-medium text-[12px] uppercase tracking-widest">
                      <Command size={16} /> K
                   </div>
                </div>

                {/* Results Matrix */}
                <div className="space-y-6">
                   <h3 className="text-sm font-medium text-slate-400 uppercase tracking-normal ml-10">Target Hub Jumps</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {searchResults.map((item, i) => (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => handleSelect(item.path)}
                          className="group p-8 bg-white/50 border border-slate-100 rounded-[3rem] hover:bg-white hover:border-blue-500/50 hover:shadow-2xl transition-all duration-500 flex items-center gap-8 text-left relative overflow-hidden"
                        >
                           <div className="p-6 bg-blue-50 rounded-[1.8rem] text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl shrink-0">
                              <item.icon size={24} />
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <h4 className="text-xl font-medium text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight mb-1 leading-none">{item.title}</h4>
                              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{item.description}</p>
                           </div>
                           <ArrowUpRight size={20} className="text-slate-200 group-hover:text-blue-600 transition-all" />
                        </motion.button>
                      ))}
                      {searchResults.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-6 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-100">
                           <Binary size={60} className="mx-auto text-slate-200" />
                           <p className="text-base font-medium text-slate-400 uppercase tracking-normal">No sync nodes found for this query.</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Footer Status */}
                <div className="flex items-center justify-between px-10 pt-8 border-t border-slate-100">
                   <div className="flex items-center gap-8">
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-normal">
                         <BadgeCheck size={14} className="text-emerald-500" /> SL-Registry Verified
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-normal">
                         <Signal size={14} className="text-blue-500" /> Latency: 12ms
                      </div>
                   </div>
                   <div className="text-xs font-medium text-blue-500 uppercase tracking-normal">
                      Aura Hub Navigator  :: Matrix Prime
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NeuralSearchOverlay;
