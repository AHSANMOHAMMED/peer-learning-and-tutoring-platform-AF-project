import React, { useEffect } from 'react';
import { 
  PenTool, 
  Clock, 
  BookOpen,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../controllers/useAuth';
import { useBookings } from '../controllers/useBookings';
import { useMaterials } from '../controllers/useMaterials';
import { cn } from '../utils/cn';

const TutorWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, fetchBookings } = useBookings();
  const { materials, fetchMaterials } = useMaterials();
  
  useEffect(() => {
    fetchBookings();
    fetchMaterials();
  }, [fetchBookings, fetchMaterials]);

  const tutorBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress');
  const tutorMaterials = materials.filter(m => typeof m.uploaderId === 'object' && (m.uploaderId as any)._id === user?._id);

  return (
    <Layout userRole="tutor">
      <div className="min-h-screen space-y-8 p-4 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="relative overflow-hidden rounded-[3.5rem] bg-indigo-600 p-8 md:p-12 text-white shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-xl">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                   <PenTool className="text-white" size={32} />
                 </div>
                 <span className="text-xs font-black tracking-[0.4em] uppercase text-indigo-100">Educator Command Hub</span>
               </div>
               <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-tight">
                 Workspace <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-white underline decoration-white/30 underline-offset-8">Intelligence.</span>
               </h1>
               <p className="text-indigo-100/80 text-lg font-medium leading-relaxed">
                 Manage your students, distribute high-impact study materials, and monitor your academic revenue growth.
               </p>
            </div>
            <div className="flex gap-4">
               <button 
                 onClick={() => navigate('/materials')} 
                 className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 font-bold transition-all flex items-center gap-2"
               >
                 <Plus size={20} />
                 Upload Note
               </button>
               <button 
                 onClick={() => navigate('/dashboard')}
                 className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95"
               >
                 View Analytics
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Active Sessions */}
           <div className="lg:col-span-12 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-3">
                   <Clock size={28} className="text-indigo-600" />
                   Active Teaching Pipeline
                 </h3>
                 <span className="px-4 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-xs font-black rounded-full">
                    {tutorBookings.length} SESSIONS
                 </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorBookings.length > 0 ? tutorBookings.map((booking, i) => (
                  <div key={i} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/50 group hover:border-indigo-500/30 transition-all">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                           {(booking.studentId as any)?.username?.[0] || 'S'}
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-900 dark:text-white">{(booking.studentId as any)?.username}</h4>
                           <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{booking.subject}</p>
                        </div>
                     </div>
                     <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-bold text-gray-500">{booking.startTime} - {booking.endTime}</span>
                        <button 
                          onClick={() => navigate(`/session/${booking._id}`)}
                          className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                        >
                          Join Live
                        </button>
                     </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center text-gray-400 font-medium">
                     No active sessions found in your current pipeline.
                  </div>
                )}
              </div>
           </div>

           {/* Material Management */}
           <div className="lg:col-span-12 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white uppercase flex items-center gap-3">
                   <BookOpen size={28} className="text-teal-500" />
                   Your Global Resources
                 </h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                          <th className="px-6 py-4">Resource Name</th>
                          <th className="px-6 py-4">Subject/Level</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                       {tutorMaterials.map((mat, i) => (
                         <tr key={i}>
                            <td className="px-6 py-6 font-bold">{mat.title}</td>
                            <td className="px-6 py-6 text-sm text-gray-500">{mat.subject} • {mat.grade}</td>
                            <td className="px-6 py-6">
                               <span className={cn(
                                 "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                 mat.moderationStatus === 'approved' ? "bg-teal-50 text-teal-600" : "bg-yellow-50 text-yellow-600"
                               )}>
                                 {mat.moderationStatus}
                               </span>
                            </td>
                            <td className="px-6 py-6 text-right">
                               <button className="text-indigo-600 font-bold text-xs hover:underline">Edit Node</button>
                            </td>
                         </tr>
                       ))}
                       {tutorMaterials.length === 0 && (
                         <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No materials published yet.</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default TutorWorkspace;
