import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { toast } from 'react-hot-toast';
import { 
  Users, X, Terminal, Activity, Cpu, Maximize2, Mic, Video, Settings, 
  Signal, Database, Camera, Brain, MessageSquare, AlertCircle, RefreshCw,
  Edit3, Monitor, Layout as LayoutIcon, Play, Pause, Square
} from 'lucide-react';
import { cn } from '../utils/cn';
import { aiApi } from '../services/api';
import { useAuth } from '../controllers/useAuth';
import { Excalidraw } from "@excalidraw/excalidraw";
import JitsiContainer from '../components/JitsiMeeting';

const VirtualClassroom = ({
  roomId = 'Session-01',
  participants = [
    { id: '1', name: 'Kasun P.', color: '#6366f1' },
    { id: '2', name: 'Tharushi S.', color: '#10b981' }
  ],
  isInstructor = false,
  onClose
}) => {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('video'); // 'video', 'whiteboard', '3d'
  const [isCapturingAI, setIsCapturingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [showAIResult, setShowAIResult] = useState(false);
  const jitsiRoomName = useMemo(() => {
    const normalizedRoomId = String(roomId || 'session-default')
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, '-');
    return `Aura-${normalizedRoomId}`;
  }, [roomId]);
  const displayName = user?.profile?.firstName || user?.username || 'Guest';
  
  // 3D Refs
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  // Initialize 3D Scene (Only if tab is 3D)
  useEffect(() => {
    if (activeTab === '3d') {
      initScene();
    } else {
      cleanup3D();
    }
    return () => cleanup3D();
  }, [activeTab]);

  const initScene = () => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    // Grid & Floor
    const gridHelper = new THREE.GridHelper(50, 50, 0xe2e8f0, 0xf1f5f9);
    scene.add(gridHelper);

    const animate = () => {
      renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
      });
    };
    animate();
  };

  const cleanup3D = () => {
    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (containerRef.current && rendererRef.current.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current = null;
    }
    if (controlsRef.current) controlsRef.current.dispose();
  };

  const captureAndExplain = async () => {
    setIsCapturingAI(true);
    try {
      // Mock logic for now as canvas capture from Jitsi/Excalidraw needs specialized handling
      const response = await aiApi.homeworkHelp({ 
        subject: 'General', 
        grade: '10', 
        message: "Explain what's happening in this session based on the current context." 
      });
      
      if (response.data?.success) {
        setAiExplanation(response.data.data.content);
        setShowAIResult(true);
        toast.success('AI Insight Generated');
      }
    } catch (error) {
      toast.error('AI could not analyze this view');
    } finally {
      setIsCapturingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[10002] flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <div className="relative z-20 px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-2xl">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#00a8cc]/20 rounded-xl flex items-center justify-center text-[#00a8cc]">
               <Video size={20} />
            </div>
            <div>
               <h2 className="text-lg font-bold text-white tracking-tight leading-none mb-1">Aura Virtual Classroom</h2>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Session: {roomId}</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'video', icon: Video, label: 'Live Video' },
              { id: 'whiteboard', icon: Edit3, label: 'Whiteboard' },
              { id: '3d', icon: LayoutIcon, label: '3D Space' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTab === tab.id ? "bg-[#00a8cc] text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-700"
                )}
              >
                <tab.icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
         </div>

         <div className="flex items-center gap-3">
            <button 
              onClick={captureAndExplain}
              disabled={isCapturingAI}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-[#00a8cc] rounded-xl transition-all border border-slate-700"
            >
              {isCapturingAI ? <RefreshCw className="animate-spin" size={18} /> : <Brain size={18} />}
            </button>
            <button onClick={onClose} className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20">
              <X size={18} />
            </button>
         </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 relative bg-slate-950 overflow-hidden">
        
        {/* Video View */}
        {activeTab === 'video' && (
          <div className="absolute inset-0 p-4">
            <JitsiContainer
              roomName={jitsiRoomName}
              displayName={displayName}
              className="min-h-0 rounded-2xl border border-slate-800"
            />
          </div>
        )}

        {/* Whiteboard View */}
        {activeTab === 'whiteboard' && (
          <div className="absolute inset-0 p-4">
            <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
               <Excalidraw 
                 theme="light"
                 initialData={{
                    appState: { viewBackgroundColor: "#ffffff", currentItemFontFamily: 1 }
                 }}
               />
            </div>
          </div>
        )}

        {/* 3D View */}
        {activeTab === '3d' && (
          <div className="absolute inset-0" ref={containerRef} />
        )}

      </div>

      {/* AI Results Modal */}
      <AnimatePresence>
        {showAIResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[10005] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
               <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Brain className="text-[#00a8cc]" size={24} />
                     <h3 className="text-white font-extrabold text-xl tracking-tight">AI Intelligence Insight</h3>
                  </div>
                  <button onClick={() => setShowAIResult(false)} className="text-slate-400 hover:text-white transition-colors">
                     <X size={24} />
                  </button>
               </div>
               <div className="p-8 overflow-y-auto bg-slate-50 flex-1 custom-scrollbar">
                  <div className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-base">
                    {aiExplanation}
                  </div>
               </div>
               <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                  <button onClick={() => setShowAIResult(false)} className="px-8 py-3 bg-[#00a8cc] text-white font-black rounded-2xl hover:bg-[#008ba8] transition-all shadow-xl shadow-[#00a8cc]/20">
                     UNDERSTOOD
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default VirtualClassroom;
