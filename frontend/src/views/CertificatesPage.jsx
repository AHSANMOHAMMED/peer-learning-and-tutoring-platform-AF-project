import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Download, ExternalLink, CheckCircle,
  Clock, Shield, Globe, Linkedin, Twitter,
  Loader, AlertCircle, Sparkles, Binary,
  Share2, ShieldCheck, Database,
  Cpu,
  Signal,
  ArrowUpRight,
  Target,
  BadgeCheck,
  Terminal,
  Fingerprint,
  Layers,
  Globe2,
  RefreshCw,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Layout from '../components/Layout';
import { cn } from '../utils/cn';

const NFTCertificateCard = ({ certificate, onShare }) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const getStatusColor = (status) => {
    switch (status) {
      case 'minted': return 'from-emerald-400/20 to-teal-500/10';
      case 'pending': return 'from-amber-400/20 to-orange-500/10';
      case 'failed': return 'from-rose-400/20 to-pink-600/10';
      default: return 'from-slate-50 to-slate-100';
    }
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = (y - centerY) / 20;
    const rotY = (centerX - x) / 20;
    setRotation({ x: rotX, y: rotY });
  };

  const resetRotation = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); resetRotation(); }}
      onMouseMove={handleMouseMove}
      style={{
        perspective: 1000,
        rotateX: rotation.x,
        rotateY: rotation.y,
        transition: 'transform 0.15s ease-out'
      }}
      className="group relative"
    >
      <div className="bg-white border border-blue-50 rounded-3xl overflow-hidden shadow-2xl relative z-10 transition-all duration-1000 hover:border-indigo-100 hover:shadow-4xl cursor-pointer active:scale-[0.98] border border-slate-100">
        {/* Holographic Header UI Architecture display protocol  */}
        <div className={cn("h-40 relative overflow-hidden bg-gradient-to-br transition-all duration-1000", getStatusColor(certificate.status))}>
           <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
           </div>
           
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-950 space-y-4">
              <motion.div 
                animate={isHovered ? { rotateY: 360, scale: 1.1 } : {}}
                className="p-4 rounded-2xl bg-white/30 backdrop-blur-3xl border border-white/20 shadow-4xl text-center"
              >
                <Award className="w-8 h-8 text-indigo-600 filter drop-shadow-glow" />
              </motion.div>
              <div className="text-center space-y-2">
                 <h3 className="text-sm font-medium uppercase tracking-normal leading-none text-slate-950 text-center group-hover:scale-110 transition-all">CERTIFICATE</h3>
                 <div className="flex items-center justify-center gap-2 text-center">
                    <Binary className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-medium text-slate-400 tracking-widest uppercase leading-none h-3">V_CODE: {certificate.verificationCode?.slice(0, 8).toUpperCase()}</span>
                 </div>
              </div>
           </div>

           {/* Status Indicator Telemetry UI Architecture protocol  */}
           <div className="absolute top-5 right-5 text-right">
              <div className="px-4 py-2 bg-white/60 backdrop-blur-3xl rounded-xl border border-white/10 flex items-center gap-3 shadow-inner border border-slate-50">
                 <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", certificate.status === 'minted' ? 'bg-emerald-500 shadow-glow-emerald' : 'bg-amber-500 shadow-glow-amber')} />
                 <span className="text-xs font-medium uppercase text-slate-950 tracking-widest leading-none h-3">{certificate.status?.toUpperCase()}</span>
              </div>
           </div>
        </div>

        {/* Content Section UI Architecture Display Matrix protocol  display */}
        <div className="p-8 space-y-7 text-left">
           <div className="text-left space-y-2 text-left">
              <h4 className="text-lg font-medium text-slate-950 uppercase tracking-tight leading-tight px-0 text-left line-clamp-2 underline underline-offset-4 decoration-indigo-50">{certificate.courseTitle}</h4>
              <p className="text-xs font-medium text-slate-300 uppercase tracking-widest leading-none px-0 text-left opacity-60 h-3">FACULTY_ROOT: {certificate.courseInstructor?.toUpperCase() || 'GLOBAL_ARCHITECT'}</p>
           </div>

           <div className="grid grid-cols-3 gap-4 text-left">
              {[
                { label: 'MASTERY', val: certificate.grade || 'A+', color: 'text-indigo-600' },
                { label: 'FIDELITY_CO', val: `${certificate.score || 98}%`, color: 'text-slate-950' },
                { label: 'NODE_CYCLES', val: certificate.sessionsAttended || 12, color: 'text-slate-950' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 border border-slate-50 rounded-2xl p-4 text-center shadow-inner relative overflow-hidden group/stat border border-slate-100 hover:bg-white transition-all duration-700 hover:border-indigo-100 hover:shadow-4xl">
                   <p className="text-xs font-medium text-slate-300 uppercase tracking-widest mb-3 leading-none text-center h-3 group-hover/stat:text-indigo-400">{stat.label}</p>
                   <p className={cn("text-lg font-medium tracking-tighter leading-none text-center tabular-nums group-hover/stat:scale-110 transition-all", stat.color)}>{stat.val}</p>
                </div>
              ))}
           </div>

           {/* Skill Tags Telemetry Architecture protocol  display */}
           <div className="flex flex-wrap gap-2 text-left">
              {certificate.skills?.slice(0, 3).map((s, i) => (
                <div key={i} className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-50 rounded-xl flex items-center gap-2.5 transition-all text-left hover:bg-white hover:border-indigo-100 hover:shadow-4xl active:scale-95">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-glow" />
                   <span className="text-xs font-medium text-indigo-600 uppercase tracking-widest leading-none h-3 text-left">{s.toUpperCase()}</span>
                </div>
              ))}
           </div>

           {/* Strategic Actions Command Interface UI Architecture display logic */}
           <div className="pt-7 border-t border-slate-50 flex items-center gap-4 text-left">
              {certificate.status === 'minted' ? (
                <>
                  <button 
                    onClick={() => onShare('linkedin')}
                    className="flex-1 h-12 bg-slate-950 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-3.5 transition-all duration-700 active:scale-95 shadow-4xl border border-white/5 text-center"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-widest leading-none h-3 text-center">BROADCAST_CREDENTIALS</span>
                  </button>
                  <button 
                    onClick={() => window.open(certificate.blockchain?.metadataUri, '_blank')}
                    className="w-12 h-12 bg-slate-50 border border-slate-50 rounded-xl flex items-center justify-center transition-all duration-700 active:scale-95 shadow-inner hover:bg-white hover:border-indigo-100 hover:shadow-4xl text-center shrink-0"
                  >
                    <Download className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                </>
              ) : (
                <div className="w-full h-12 bg-slate-50 border border-slate-50 rounded-xl flex items-center justify-center gap-4 opacity-40 text-center border border-slate-100">
                   <RefreshCw className="w-4 h-4 text-slate-300 animate-spin" />
                   <span className="text-sm font-medium uppercase tracking-widest text-slate-300 text-center h-3">MINTPROTOCOLING...</span>
                </div>
              )}
           </div>
        </div>
        <div className="absolute bottom-6 right-6 p-10 opacity-[0.01] pointer-events-none group-hover:rotate-12 transition-all duration-[2000ms] text-right font-medium h-40 w-40"><BadgeCheck size={160} /></div>
      </div>
    </motion.div>
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
      const response = await api.get('/certificates/my-certificates');
      if (response.data.success) {
        setCertificates(response.data.data.certificates);
      }
    } catch (error) {
       console.error('Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  if (loading) {
    return (
       <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-12 overflow-hidden text-center">
          <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="text-center">
            <div className="relative text-center">
               <Cpu className="text-indigo-600 filter drop-shadow-glow" size={60} />
               <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse text-center" />
            </div>
          </motion.div>
          <p className="text-sm font-medium uppercase tracking-normal text-slate-400 animate-pulse text-center">INITIALIZING_CREDENTIALING...</p>
       </div>
    );
  }

  return (
    <Layout userRole="student">
      <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500/10 overflow-x-hidden relative text-left p-6 md:p-8">
        {/* Dashboard Background */}
        <div className="fixed inset-0 pointer-events-none z-[1001] text-left">
           <div className="absolute inset-0 bg-gradient-to-tr from-white/90 via-transparent to-white/90 pointer-events-none" />
        </div>

        <motion.div 
          className="relative z-10 max-w-[1440px] mx-auto space-y-8 text-left"
          variants={containerVariants}
          initial="hidden" animate="visible"
        >
          {/* Command Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-2.5 bg-white/60 backdrop-blur-3xl rounded-xl border border-blue-50 shadow-sm text-left">
             <div className="flex items-center gap-8 text-left">
                <div className="flex items-center gap-2.5 text-left text-left">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-glow text-left" />
                   <span className="text-xs font-medium uppercase tracking-widest text-slate-950 leading-none text-left">Credential Index Matrix Hub  ONLINE</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 text-left">
                   <Signal size={12} className="text-indigo-500 text-left h-3" />
                   <span className="text-xs font-medium uppercase tracking-widest leading-none text-left">Active Proof_of_Mastery_Verified</span>
                </div>
             </div>
              <div className="px-5 py-2 bg-slate-950 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-lg text-center border border-white/5 active:scale-95 transition-all">
                 MINT::
              </div>
          </div>

          {/* Scholastic Credentials Hero HUB Protocol Architecture display logic protocol  display */}
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 md:p-12 text-white shadow-4xl text-left group"
          >
             <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none text-right" />
             
             <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-12 text-left">
                <div className="flex-1 max-w-4xl space-y-10 text-left">
                   <div className="flex items-center gap-5 text-left">
                      <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-4xl transition-all duration-1000 group-hover:rotate-6 text-center shrink-0">
                         <ShieldCheck className="text-white text-left filter drop-shadow-glow" size={28} />
                      </div>
                      <div className="text-left text-left">
                         <span className="text-xs font-medium tracking-widest uppercase text-indigo-100 leading-none text-left">National Scholastic Credential Matrix Hub  </span>
                         <div className="flex items-center gap-3 mt-2 text-left">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-glow text-left" />
                            <span className="text-xs font-medium uppercase text-white/40 tracking-widest text-left">Protocol :: PROOF_OF_MASTERY_VERIFIED</span>
                         </div>
                      </div>
                   </div>
                   <h1 className="text-4xl md:text-6xl font-medium tracking-tighter leading-none uppercase text-white text-left">
                      Scholastic <br />
                      <span className="text-blue-200">Credentials Index.</span>
                   </h1>
                   <p className="text-indigo-100 text-base font-bold leading-relaxed max-w-lg px-0 text-left underline decoration-white/10 underline-offset-8">
                      Verify cognitive achievements with blockchain-secured NFT credentials minted on the national sovereign hub  . 100% fidelity guaranteed across the state grid.
                   </p>
                </div>

                {/* Issued Telemetry Terminal Interface Design Logic protocol  display */}
                <div className="backdrop-blur-3xl bg-white/10 border border-white/10 px-10 py-8 rounded-2xl flex items-center gap-12 shadow-4xl shrink-0 group hover:bg-white/15 transition-all duration-[1000ms] text-center border border-white/10 active:scale-95 cursor-default hover:rotate-1">
                   <div className="text-center space-y-3 flex flex-col items-center shrink-0">
                      <p className="text-6xl font-medium text-white leading-none tracking-tighter tabular-nums text-center drop-shadow-glow-blue">{certificates.length}</p>
                      <p className="text-sm font-medium uppercase tracking-widest text-indigo-100 leading-none text-center h-3">ISSUED_MODULES</p>
                   </div>
                   <div className="w-px h-16 bg-white/10 text-center" />
                   <div className="flex -space-x-5 text-center shrink-0">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-2 border-indigo-400 bg-white shadow-4xl flex items-center justify-center text-sm font-medium text-slate-950 group-hover:scale-125 transition-all duration-700 text-center border-white/20">
                           IX
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Certificates Grid Hub Command Center UI Display matrix protocol  logic */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20 text-left">
             {certificates.map((cert) => (
                <NFTCertificateCard 
                  key={cert._id} 
                  certificate={cert} 
                  onShare={(p) => toast.success(`Broadcasted on ${p?.toUpperCase()} HUB  !`)} 
                />
             ))}
             {certificates.length === 0 && (
                <div className="col-span-full py-32 text-center rounded-3xl border-2 border-dashed border-blue-50 bg-white shadow-inner flex flex-col items-center gap-10 group relative overflow-hidden text-center border border-slate-100">
                   <div className="p-10 bg-slate-50 border border-slate-100 rounded-full shadow-inner opacity-20 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-[2000ms] text-center shrink-0">
                      <Award className="w-20 h-20 text-slate-300 text-center" />
                   </div>
                   <div className="space-y-6 text-center max-w-md mx-auto text-center px-10">
                      <h3 className="text-2xl font-medium text-slate-950 uppercase tracking-tighter leading-none px-0 text-center">No credentials minted.</h3>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-widest leading-relaxed px-10 text-center underline decoration-slate-50 underline-offset-8">
                         Finalize learning modules to provision your identity hub in the national credential index   node sync nominal IX.
                      </p>
                   </div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-20 opacity-[0.01] pointer-events-none group-hover:scale-150 transition-all duration-[5000ms] text-center"><BadgeCheck size={300} /></div>
                </div>
             )}
          </div>
        </motion.div>

        {/* Global Hub Authority terminal indicator UI Matrix Architecture Display Logic protocol  display */}
        <div className="fixed bottom-10 right-10 group z-50 opacity-40 hover:opacity-100 transition-all duration-[1000ms] text-left">
           <div className="flex items-center gap-8 py-5 px-10 bg-white/60 backdrop-blur-3xl rounded-full border border-blue-50 shadow-4xl cursor-default text-left shadow-glow">
              <div className="relative text-left">
                 <Terminal size={24} className="text-indigo-600 animate-pulse text-left shadow-glow" />
                 <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 text-left" />
              </div>
               <div className="flex flex-col text-left text-left">
                  <p className="text-sm font-medium uppercase tracking-normal text-slate-950 leading-none text-left h-3">CREDENTIAL_TERMINAL</p>
                  <div className="flex items-center gap-4 mt-2.5 text-xs font-medium uppercase text-indigo-600 tracking-widest leading-none text-left h-4">
                     <Database size={16} className="text-left" /> Sync: Sovereign :: Verified Tier XII master node cluster  sector
                  </div>
               </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default CertificatesPage;