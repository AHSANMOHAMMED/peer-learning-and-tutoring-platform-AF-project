import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  Zap, 
  MapPin, 
  GraduationCap, 
  ArrowRight,
  ChevronDown,
  BookOpen,
  Calendar,
  Clock,
  ShieldCheck,
  X,
  CreditCard
} from 'lucide-react';
import Layout from '../components/Layout';
import { useTutors } from '../controllers/useTutors';
import { useBookings } from '../controllers/useBookings';
import { Tutor } from '../models/Tutor';
import { cn } from '../utils/cn';

const TutorBrowsing: React.FC = () => {
  const { tutors, loading, fetchTutors } = useTutors();
  const { createBooking, loading: bookingLoading } = useBookings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStream, setSelectedStream] = useState('All Streams');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [bookingTutor, setBookingTutor] = useState<Tutor | null>(null);

  // Booking Form State
  const [bookingData, setBookingData] = useState({
    subject: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '17:00'
  });

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const STREAMS = ['All Streams', 'Combined Maths', 'Biology', 'Commerce', 'Arts', 'Tech'];

  const filteredTutors = tutors.filter(tutor => {
    const subjects = tutor.subjects || [];
    const bio = tutor.bio || '';
    const matchesSearch = subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStream = selectedStream === 'All Streams' || tutor.alStream === selectedStream;
    return matchesSearch && matchesStream;
  });

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTutor) return;

    try {
      await createBooking({
        tutorId: bookingTutor._id,
        ...bookingData,
        price: bookingTutor.hourlyRate
      });
      setBookingTutor(null);
      alert('Booking request sent successfully!');
    } catch (err) {
      alert('Failed to create booking. Please try again.');
    }
  };

  return (
    <Layout userRole="student">
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Discovery Header */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 md:p-16 text-white shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                <Users className="text-indigo-400" size={28} />
              </div>
              <span className="text-xs font-black tracking-[0.3em] uppercase text-slate-400">Mentor Discovery Engine</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
              Find Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 underline decoration-indigo-500/30 underline-offset-8">A/L Specialist.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
              Access the most elite tutors from University of Moratuwa, Colombo, and Peradeniya. Verified results, proven mastery.
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10">
              <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Search subjects (e.g. Integration, Organic Chemistry...)"
                  className="w-full bg-transparent border-none py-5 pl-16 pr-6 outline-none text-white font-bold placeholder:text-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 p-2">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-3xl font-black text-sm transition-all flex items-center gap-3 border border-white/5"
                >
                  <Filter size={18} className="text-indigo-400" />
                  Filters
                  <ChevronDown className={cn("transition-transform duration-300", isFilterOpen && "rotate-180")} size={16} />
                </button>
                <button className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-3xl font-black text-sm transition-all shadow-xl shadow-indigo-500/30">
                  Execute Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                    <BookOpen size={14} className="text-indigo-500" />
                    Academic Stream
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {STREAMS.map(stream => (
                      <button 
                        key={stream}
                        onClick={() => setSelectedStream(stream)}
                        className={cn(
                          "px-6 py-3 rounded-2xl text-xs font-bold transition-all border",
                          selectedStream === stream 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20" 
                            : "bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:border-indigo-500"
                        )}
                      >
                        {stream}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                    <MapPin size={14} className="text-teal-500" />
                    District Focus
                  </h4>
                  <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                    <option>All Districts</option>
                    <option>Colombo</option>
                    <option>Gampaha</option>
                    <option>Kandy</option>
                  </select>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                    <Clock size={14} className="text-purple-500" />
                    Hourly Rate (LKR)
                  </h4>
                  <div className="flex items-center gap-4">
                    <input type="range" className="flex-1 accent-indigo-600" min="500" max="10000" step="500" />
                    <span className="font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl">Rs. 5000</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Mentors Found <span className="text-indigo-500 opacity-50 ml-2">{filteredTutors.length}</span>
            </h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sorted by: Best Match</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[450px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-[3rem]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {filteredTutors.map((tutor) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={tutor._id} 
                  className="group bg-white dark:bg-gray-900 rounded-[3rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 relative overflow-hidden"
                >
                  {/* Glassmorphism Badge */}
                  <div className="absolute top-6 right-6 px-4 py-2 bg-indigo-500/10 backdrop-blur-md rounded-full border border-indigo-500/20 text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> Verified Elite
                  </div>
                  
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-indigo-900 dark:to-indigo-800 flex items-center justify-center text-4xl font-black text-indigo-400 group-hover:rotate-6 transition-transform duration-500">
                        {(tutor.userId as any)?.username?.[0]?.toUpperCase() || 'T'}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                        <Zap size={20} className="text-yellow-400" fill="currentColor" />
                      </div>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{(tutor.userId as any)?.username || 'Mentor'}</h4>
                    <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest">
                       {tutor.alStream}
                    </span>
                  </div>

                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-4 text-gray-500">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-indigo-400">
                        <GraduationCap size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Institution</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{(tutor.education?.[0] as any)?.university || tutor.education?.[0]?.institution || 'University Graduate'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-teal-400">
                        <Star size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Excellence Rating</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{tutor.rating}/5 from {tutor.reviewCount} Sessions</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 group/rate">
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 group-hover/rate:text-indigo-400 transition-colors">Hourly Rate</p>
                       <p className="text-xl font-black text-gray-900 dark:text-white">Rs. {tutor.hourlyRate}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setBookingTutor(tutor);
                        setBookingData(prev => ({ ...prev, subject: tutor.subjects[0] || '' }));
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-xs transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3"
                    >
                       Book <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {!loading && filteredTutors.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
              <Search className="mx-auto text-gray-300 mb-6" size={64} />
              <h4 className="text-2xl font-black text-gray-400 mb-4">No Mentors Found</h4>
              <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your filters or searching for more generic subjects like "Mathematics".</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingTutor && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingTutor(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="p-8 bg-indigo-600 text-white relative">
                <button 
                  onClick={() => setBookingTutor(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">
                    {(bookingTutor.userId as any)?.username?.[0]?.toUpperCase() || 'T'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Book Mentorship</h3>
                    <p className="text-indigo-100 opacity-80 text-sm font-medium">Session with {(bookingTutor.userId as any)?.username || 'Mentor'}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBook} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Target Subject</label>
                    <select 
                      required
                      className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                      value={bookingData.subject}
                      onChange={(e) => setBookingData({...bookingData, subject: e.target.value})}
                    >
                      {bookingTutor.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Date Node</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                        <input 
                          type="date"
                          required
                          className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 pl-12 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Start Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                        <input 
                          type="time" 
                          required
                          className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 pl-12 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          value={bookingData.startTime}
                          onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 rounded-xl text-white">
                        <CreditCard size={18} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">Session Value</span>
                    </div>
                    <span className="text-xl font-black text-indigo-600">Rs. {bookingTutor.hourlyRate}</span>
                  </div>
                  <p className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest leading-relaxed">
                    Final price based on 1-hour mentoring node. Secure payment handled via localized Sri Lankan gateways.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setBookingTutor(null)}
                    className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Cancel Node
                  </button>
                  <button 
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {bookingLoading ? 'Synchronizing...' : 'Finalize Booking'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default TutorBrowsing;
