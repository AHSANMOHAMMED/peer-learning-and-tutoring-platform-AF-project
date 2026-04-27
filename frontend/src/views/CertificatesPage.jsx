import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Download, Sparkles,
  Linkedin, Search, ShieldCheck,
  CheckCircle, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { certificateApi } from '../services/api';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

const AccreditationCard = ({ certificate, onShare }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700';
      case 'pending': return 'from-amber-50 to-orange-50 border-amber-100 text-amber-700';
      case 'failed': return 'from-rose-50 to-pink-50 border-rose-100 text-rose-700';
      default: return 'from-slate-50 to-slate-100 border-slate-200 text-slate-700';
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="text-emerald-500" size={16} />;
      case 'pending': return <Loader2 className="text-amber-500 animate-spin" size={16} />;
      case 'failed': return <ShieldCheck className="text-rose-500" size={16} />;
      default: return null;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full"
    >
      {/* Certificate Header Banner */}
      <div className={cn("h-36 relative flex flex-col items-center justify-center p-6 bg-gradient-to-br border-b", getStatusColor(certificate.status))}>
         <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
            {getStatusIndicator(certificate.status)}
            {certificate.status}
         </div>
         <div className="p-3 bg-white rounded-2xl shadow-sm mb-3">
            <Award className="w-8 h-8 text-indigo-600" />
         </div>
         <span className="text-xs font-bold uppercase tracking-widest opacity-80">VERIFICATION: {certificate.verificationCode?.slice(0, 8).toUpperCase()}</span>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col">
         <div className="mb-6 flex-1">
            <h4 className="text-xl font-bold text-slate-800 leading-tight mb-2">{certificate.courseTitle}</h4>
            <p className="text-sm font-medium text-slate-500">Instructor: {certificate.courseInstructor || 'Aura Platform'}</p>
         </div>

         <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Grade</p>
               <p className="text-base font-black text-indigo-600">{certificate.grade || 'A+'}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Score</p>
               <p className="text-base font-black text-slate-800">{certificate.score || 98}%</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sessions</p>
               <p className="text-base font-black text-slate-800">{certificate.sessionsAttended || 12}</p>
            </div>
         </div>

         <div className="flex flex-wrap gap-2 mb-8">
            {certificate.skills?.slice(0, 3).map((s, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                 {s}
              </span>
            ))}
         </div>

         {/* Actions */}
         <div className="flex items-center gap-3 mt-auto">
            {certificate.status === 'verified' ? (
              <>
                <button 
                  onClick={() => onShare('linkedin')}
                  className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Linkedin size={18} /> Add to Profile
                </button>
                <button 
                  onClick={() => window.open(certificate.blockchain?.metadataUri, '_blank')}
                  className="w-12 h-12 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-xl flex items-center justify-center transition-all shadow-sm"
                  title="Verify Authenticity"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button 
                  className="w-12 h-12 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-xl flex items-center justify-center transition-all shadow-sm"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-500 text-sm font-bold">
                 <Loader2 className="w-4 h-4 animate-spin" /> Processing Credentials...
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

const CertificatesPage = () => {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await certificateApi.getAll({ my: true });
      if (response.data.success) {
        setCertificates(response.data.data.certificates);
      }
    } catch (error) {
       console.error('Fetch failed', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
       <div className="min-h-screen bg-[#fafafc] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading Certificates...</p>
       </div>
    );
  }

  return (
    <Layout userRole="student">
      <div className="min-h-screen bg-[#fafafc] p-6 md:p-8 font-sans pb-20">
        <motion.div 
          className="max-w-[1400px] mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10 border-b border-slate-200 pb-8">
             <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100 mb-4">
                  <ShieldCheck size={14} /> Verified Credentials
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none mb-2">
                   My <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">Certificates</span>
                </h1>
                <p className="text-slate-500 font-medium">View, download, and share your digitally verified academic credentials.</p>
             </div>
             
             <div className="flex items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-100">
                   <Award size={32} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                   <p className="text-3xl font-black text-slate-800 tracking-tight">{certificates.length}</p>
                </div>
             </div>
          </motion.div>

          {/* Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {certificates.map((cert) => (
                <AccreditationCard 
                  key={cert._id} 
                  certificate={cert} 
                  onShare={(p) => toast.success(`Shared to ${p?.toUpperCase()}!`)} 
                />
             ))}
             
             {certificates.length === 0 && (
                <div className="col-span-full py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-6">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <Award className="w-10 h-10 text-slate-300" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 mb-3">No Certificates Yet</h3>
                   <p className="text-sm font-medium text-slate-500 max-w-sm">
                      Complete learning modules and pass your assessments to earn verified digital credentials. Keep learning!
                   </p>
                </div>
             )}
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CertificatesPage;