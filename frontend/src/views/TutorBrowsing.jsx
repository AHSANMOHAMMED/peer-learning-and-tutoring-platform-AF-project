import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, Star, MapPin, GraduationCap, ArrowRight, ChevronDown, BookOpen, CreditCard, Sparkles, Award, BadgeCheck, X, RefreshCw, ShieldCheck } from 'lucide-react';
import Layout from '../components/Layout';
import { useTutors } from '../controllers/useTutors';
import { useBookings } from '../controllers/useBookings';
import { useAuth } from '../controllers/useAuth';
import { cn } from '../utils/cn';

const TutorBrowsing = () => {
  const { user } = useAuth();
  const { tutors, loading, fetchTutors } = useTutors();
  const { createBooking } = useBookings();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Default stream to user's stream if available
  const [selectedStream, setSelectedStream] = useState(user?.stream || 'All Streams');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [bookingTutor, setBookingTutor] = useState(null);

  const [bookingData, setBookingData] = useState({
    subject: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '17:00'
  });

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const STREAMS = [
    'All Streams', 
    'Combined Mathematics', 
    'Biological Sciences', 
    'Commercial Stream', 
    'Physical Sciences', 
    'Arts Stream', 
    'Technology Stream', 
    'O/L General',
    'London A/L', 
    'Other'
  ];

  const filteredTutors = tutors.filter((tutor) => {
    const subjects = tutor.subjects || [];
    const bio = tutor.bio || '';
    
    // Search match
    const matchesSearch = subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Stream match (only if student is A/L age or if they specifically picked a stream)
    const matchesStream = selectedStream === 'All Streams' || tutor.alStream === selectedStream;
    
    // Grade match (Tutors should ideally have a grade range, but we filter by stream as a proxy for now)
    // If student is Grade 10 or 11, focus on O/L. If Grade 12+, focus on Stream.
    let matchesGradeFocus = true;
    if (user?.grade) {
       const userGradeInt = parseInt(user.grade);
       if (userGradeInt >= 12 && tutor.alStream === 'O/L') matchesGradeFocus = false;
       if (userGradeInt <= 11 && (tutor.alStream !== 'O/L' && tutor.alStream !== 'Other')) matchesGradeFocus = false;
    }

    return matchesSearch && matchesStream && matchesGradeFocus;
  });

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingTutor) return;
    try {
      await createBooking({
        tutorId: bookingTutor._id,
        ...bookingData,
        price: bookingTutor.hourlyRate
      });
      setBookingTutor(null);
    } catch (err) {
      console.error('Booking failed');
    }
  };

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto w-full font-sans">
        
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Find a Mentor</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Connect with verified subject experts for 1-on-1 sessions.</p>
           </div>
           <button onClick={fetchTutors} className="bg-white border border-slate-200 text-slate-600 hover:text-[#00a8cc] px-4 py-2.5 rounded-xl font-bold text-sm shadow-soft transition-colors flex items-center gap-2">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
           </button>
        </div>

        {/* Discovery Hero Section */}
        <div className="bg-[#00a8cc] rounded-3xl p-8 md:p-12 text-white shadow-soft relative overflow-hidden mb-8">
           <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
           
           <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-4 border border-white/10">
                 <ShieldCheck size={14} /> Verified Mentors
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Master your subjects<br/>with top percentile tutors.</h2>
              
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-4 mt-8 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20">
                 <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                    <input 
                       type="text" placeholder="Search for subjects or syllabus terms..." 
                       value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-white placeholder:text-white/50 focus:outline-none font-medium"
                    />
                 </div>
                 <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                    <Filter size={18} /> Filters
                 </button>
              </div>
           </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
           {isFilterOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8">
                 <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-soft">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Academic Stream</label>
                          <div className="flex flex-wrap gap-2">
                             {STREAMS.map(stream => (
                                <button key={stream} onClick={() => setSelectedStream(stream)} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-colors border", selectedStream === stream ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200")}>
                                   {stream}
                                </button>
                             ))}
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">District / Location</label>
                          <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 font-bold focus:outline-none focus:border-[#00a8cc]">
                             <option>All Districts</option>
                             <option>Colombo</option>
                             <option>Kandy</option>
                             <option>Galle</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Hourly Rate (LKR)</label>
                          <input type="range" min="500" max="5000" step="500" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00a8cc]" />
                          <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                             <span>LKR 500</span><span>LKR 5,000+</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-bold text-slate-800">Available Tutors</h3>
           <p className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">{filteredTutors.length} Found</p>
        </div>

        {/* Tutor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
           {loading && tutors.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-medium flex flex-col items-center">
                 <RefreshCw className="animate-spin mb-4 text-[#00a8cc]" size={32} />
                 Loading mentors...
              </div>
           ) : filteredTutors.length === 0 ? (
              <div className="col-span-full py-20 bg-white border border-slate-100 rounded-3xl text-center text-slate-400 font-medium">
                 No mentors found matching your criteria.
              </div>
           ) : (
              filteredTutors.map((tutor) => (
                 <div key={tutor._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-soft hover:border-[#00a8cc] transition-all flex flex-col group">
                    <div className="flex items-start justify-between mb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-[#e8f6fa] text-[#00a8cc] flex items-center justify-center font-bold text-2xl relative">
                             {tutor.userId?.username?.[0]?.toUpperCase() || 'T'}
                             <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                <BadgeCheck size={16} className="text-emerald-500" />
                             </div>
                          </div>
                          <div>
                             <h4 className="text-lg font-bold text-slate-800 line-clamp-1">{tutor.userId?.username || 'Mentor'}</h4>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{tutor.alStream} Specialist</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-md text-xs font-bold">
                          <Star size={12} fill="currentColor" /> {tutor.rating?.toFixed(1) || '0.0'}
                       </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-1">
                       <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <GraduationCap size={16} className="text-slate-400" />
                          <span className="line-clamp-1">{tutor.subjects?.join(', ') || 'General Studies'}</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <MapPin size={16} className="text-slate-400" />
                          <span>Provides Online Sessions</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <BookOpen size={16} className="text-slate-400" />
                          <span>{tutor.reviewCount || 0} Sessions Completed</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                       <div className="font-extrabold text-slate-800 text-lg">
                          LKR {tutor.hourlyRate?.toLocaleString()}<span className="text-xs text-slate-400 font-bold ml-1">/ hr</span>
                       </div>
                       <button
                          onClick={() => {
                             setBookingTutor(tutor);
                             setBookingData(prev => ({ ...prev, subject: tutor.subjects?.[0] || '' }));
                          }}
                          className="bg-slate-900 hover:bg-[#00a8cc] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                       >
                          Book Now
                       </button>
                    </div>
                 </div>
              ))
           )}
        </div>

        {/* Booking Modal */}
        <AnimatePresence>
           {bookingTutor && (
              <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                 <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setBookingTutor(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                 <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
                    
                    <div className="bg-[#f8f9fc] p-6 border-b border-slate-100 flex items-center justify-between">
                       <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CreditCard size={20} className="text-[#00a8cc]"/> Schedule Session</h3>
                       <button onClick={() => setBookingTutor(null)} className="text-slate-400 hover:text-slate-700 bg-white p-2 rounded-full shadow-sm"><X size={16} /></button>
                    </div>

                    <form onSubmit={handleBook} className="p-8 space-y-6">
                       <div>
                          <label className="text-sm font-bold text-slate-700 block mb-2">Subject</label>
                          <select value={bookingData.subject} onChange={(e) => setBookingData({...bookingData, subject: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-[#00a8cc]">
                             {bookingTutor.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="text-sm font-bold text-slate-700 block mb-2">Date</label>
                          <input type="date" value={bookingData.date} onChange={(e) => setBookingData({...bookingData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-[#00a8cc]" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-sm font-bold text-slate-700 block mb-2">Start Time</label>
                             <input type="time" value={bookingData.startTime} onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-[#00a8cc]" />
                          </div>
                          <div>
                             <label className="text-sm font-bold text-slate-700 block mb-2">End Time</label>
                             <input type="time" value={bookingData.endTime} onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-[#00a8cc]" />
                          </div>
                       </div>
                       
                       <div className="bg-[#f8f9fc] p-4 rounded-xl border border-slate-100 flex justify-between items-center mt-2">
                          <span className="font-bold text-slate-600">Total Price</span>
                          <span className="font-extrabold text-[#00a8cc] text-xl">LKR {bookingTutor.hourlyRate?.toLocaleString()}</span>
                       </div>

                       <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-[#00a8cc] text-white font-bold rounded-xl transition-colors">
                          Confirm Booking
                       </button>
                    </form>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default TutorBrowsing;