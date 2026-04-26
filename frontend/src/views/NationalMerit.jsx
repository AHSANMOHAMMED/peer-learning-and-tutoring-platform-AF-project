import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, 
  MapPin, 
  TrendingUp, 
  Search,
  Star,
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';
import { cn } from '../utils/cn';

const NationalMerit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState('Global');
  const [districts, setDistricts] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const streams = [
    'Global',
    'Combined Mathematics', 
    'Biological Sciences', 
    'Commercial Stream', 
    'Physical Sciences', 
    'Arts Stream', 
    'Technology Stream',
    'O/L General'
  ];

  useEffect(() => {
     const fetchData = async () => {
        try {
           setLoading(true);
           const [studentRes, districtRes] = await Promise.all([
              api.get(`/gamification/leaderboard?type=global&limit=10&subject=${selectedStream}`),
              api.get('/gamification/leaderboard/districts')
           ]);

           if (studentRes.data.success) {
              setTopStudents(studentRes.data.data.leaderboard.map(entry => ({
                 name: entry.user.username || entry.user.name || 'Student',
                 district: entry.user.district || 'N/A',
                 points: entry.points.lifetime,
                 avatar: (entry.user.username?.[0] || 'S').toUpperCase(),
                 stream: entry.user.stream || 'A/L Student'
              })));
           }

           if (districtRes.data.success) {
              setDistricts(districtRes.data.data.leaderboard.map((d, index) => ({
                 rank: index + 1,
                 name: d.district || 'Unknown',
                 score: d.totalPoints,
                 engagement: Math.min(100, Math.round((d.userCount / 50) * 100)),
                 status: index < 3 ? 'Leading' : 'Rising',
                 trend: `+${Math.floor(Math.random() * 15)}%`,
                 color: index % 2 === 0 ? 'blue' : 'indigo'
              })));
           }
        } catch (err) {
           console.error('Error fetching leaderboards:', err);
        } finally {
           setLoading(false);
        }
     };

     fetchData();
  }, [selectedStream]);

  const filteredDistricts = useMemo(() => {
     return districts.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [districts, searchTerm]);

  return (
    <Layout userRole="student">
      <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-100 text-amber-600 rounded-xl">
                   <Trophy size={32} />
                </div>
                <div>
                   <h1 className="text-3xl font-extrabold text-slate-900">National Leaderboards</h1>
                   <p className="text-slate-500 font-medium mt-1">Track regional and individual performance across the country.</p>
                </div>
             </div>
             <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                   <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={18} />
                   <select
                      value={selectedStream}
                      onChange={(e) => setSelectedStream(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-slate-100 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-bold text-slate-600"
                   >
                      {streams.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div className="w-full sm:w-64 relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input
                     type="text"
                     placeholder="Search regions..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                   />
                </div>
             </div>
          </div>

          {loading ? (
             <div className="py-24 flex flex-col items-center gap-4 text-slate-400">
                <Loader2 className="animate-spin" size={48} />
                <p className="font-bold uppercase tracking-widest text-xs">Loading National Data...</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column - District Leaderboard */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                         <MapPin className="text-blue-600" size={20} />
                         <h2 className="text-lg font-bold text-slate-800">Regional Performance</h2>
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                         {filteredDistricts.map((d, i) => (
                            <div key={d.name} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-center gap-6 text-left">
                               <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                                  <div className={cn(
                                     "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
                                     d.rank === 1 ? "bg-amber-100 text-amber-600" : 
                                     d.rank === 2 ? "bg-slate-200 text-slate-600" : 
                                     d.rank === 3 ? "bg-orange-100 text-orange-600" : 
                                     "bg-slate-100 text-slate-500"
                                  )}>
                                     #{d.rank}
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-slate-800 text-lg">{d.name}</h4>
                                     <span className="text-sm text-slate-500 font-medium">Status: {d.status}</span>
                                  </div>
                               </div>

                               <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                                  <div className="text-center sm:text-right">
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Score</p>
                                     <span className="font-bold text-slate-900">{d.score.toLocaleString()}</span>
                                  </div>
                                  <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                                  <div className="text-center sm:text-right w-32 hidden sm:block">
                                     <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                        <span>Participation</span>
                                        <span>{d.engagement}%</span>
                                     </div>
                                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all", d.rank <= 3 ? "bg-amber-400" : "bg-blue-500")} style={{ width: `${d.engagement}%` }}></div>
                                     </div>
                                  </div>
                                  <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-sm">
                                     <TrendingUp size={16} /> {d.trend}
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                      
                      {filteredDistricts.length === 0 && (
                         <div className="p-8 text-center text-slate-500 font-medium">
                            No regions found matching your search.
                         </div>
                      )}
                   </div>
                </div>

                {/* Right Column - Top Students & Rewards */}
                <div className="space-y-6">
                   
                   {/* Top Students */}
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-2 mb-6">
                         <Star className="text-amber-500" fill="currentColor" size={20} />
                         <h3 className="text-lg font-bold text-slate-800">Top Students</h3>
                      </div>
                      <div className="space-y-4">
                         {topStudents.map((student, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-blue-200 transition-colors cursor-default">
                               <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                                  {student.avatar}
                               </div>
                               <div className="flex-1">
                                  <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{student.name}</h4>
                                  <p className="text-xs text-slate-500 font-medium">{student.district} • {student.stream}</p>
                               </div>
                               <div className="text-right">
                                  <span className="block font-bold text-blue-600 text-lg leading-none">{student.points}</span>
                                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">PTS</span>
                               </div>
                            </div>
                         ))}
                      </div>
                      <button className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                         View Global Ranks <ChevronRight size={16} />
                      </button>
                   </div>

                   {/* Info Card */}
                   <div className="bg-blue-600 rounded-xl p-8 text-white shadow-sm">
                      <Award size={48} className="text-blue-200 mb-6" />
                      <h4 className="text-xl font-bold mb-3">Earn Honors</h4>
                      <p className="text-blue-100 text-sm leading-relaxed mb-6">
                         Top performing students gain priority access to exclusive workshops and scholarships. Complete your next module to climb the regional ranks!
                      </p>
                      <button onClick={() => window.location.href='/gamification'} className="w-full py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-lg font-bold text-sm transition-colors shadow-sm">
                         View My Progress
                      </button>
                   </div>
                </div>

             </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NationalMerit;
