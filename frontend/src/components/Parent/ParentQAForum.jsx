import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  TrendingUp,

  ChevronRight,
  ShieldCheck,
  Star } from
'lucide-react';







const ParentQAForum = ({ qaPerformance, studentGrade }) => {
  const trendingTopics = [
  { title: 'Grade 10 Maths Calculus Foundation', posts: 124, active: true },
  { title: 'Physics Projectile Motion Practice', posts: 89, active: false },
  { title: 'Chemistry Atomic Structure Help', posts: 56, active: false }];


  return (
    <div className="space-y-8">
      {/* Forum Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full" />
         <div className="relative z-10">
            <h3 className="text-3xl font-medium tracking-tight mb-2">Community QA Forum</h3>
            <p className="text-indigo-200/70 text-sm font-medium">Join 2,500+ parents and tutors in collaborative learning support.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Trending & Questions */}
         <div className="lg:col-span-8 space-y-6">
            <div className="relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
               <input
              className="w-full pl-14 pr-8 py-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              placeholder="Search forum topics..." />
            
            </div>

            <div className="space-y-4">
               {trendingTopics.map((topic, i) =>
            <motion.div
              key={i}
              whileHover={{ x: 10 }}
              className="p-6 bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-50 dark:border-gray-800 shadow-sm flex items-center justify-between group cursor-pointer">
              
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                           <MessageSquare size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-950 dark:text-white">{topic.title}</h4>
                           <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{topic.posts} Active Threads</p>
                        </div>
                     </div>
                     <ChevronRight className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                  </motion.div>
            )}
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
               <h3 className="text-xl font-medium tracking-tight mb-6 flex items-center gap-3">
                  <TrendingUp className="text-teal-500" /> Stats Profile
               </h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                     <span className="text-xs font-medium uppercase tracking-widest text-gray-400">Total Marks</span>
                     <span className="text-xl font-medium">{qaPerformance?.totalMarks || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                     <span className="text-xs font-medium uppercase tracking-widest text-gray-400">Forum Stars</span>
                     <span className="text-xl font-medium flex items-center gap-2">
                        12 <Star size={16} className="text-yellow-500 fill-current" />
                     </span>
                  </div>
               </div>
            </div>

            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20">
               <ShieldCheck className="mb-4 text-indigo-200" size={32} />
               <h3 className="text-lg font-medium tracking-tight mb-2 uppercase text-xs">Verified Experts Only</h3>
               <p className="text-xs text-indigo-100 leading-relaxed font-medium">All forum moderators are university-verified tutors to ensure high-fidelity learning support.</p>
            </div>
         </div>
      </div>
    </div>);

};

export default ParentQAForum;