import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  X, 
  Terminal, 
  Activity, 
  Cpu, 
  Maximize2,
  Mic,
  Video,
  Settings,
  Signal,
  Database,
  Camera,
  Brain,
  MessageSquare,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { cn } from '../utils/cn';

const VirtualClassroom = ({
  roomId = 'Session-01',
  participants = [
    { id: '1', name: 'Kasun P.', color: '#6366f1' },
    { id: '2', name: 'Tharushi S.', color: '#10b981' }
  ],
  isInstructor = false,
  onClose
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isInVR, setIsInVR] = useState(false);
  const [selectedView, setSelectedView] = useState('theater'); 
  const avatarsRef = useRef(new Map());
  const [connectionQuality, setConnectionQuality] = useState(99.98);
  const [isCapturingAI, setIsCapturingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [showAIResult, setShowAIResult] = useState(false);

  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-vr').then((supported) => {
        setIsVRSupported(supported);
      }).catch(() => setIsVRSupported(false));
    }

    initScene();
    return () => cleanup();
  }, []);

  const initScene = () => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); 
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.05);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 1.7;
    controls.minDistance = 3;
    controls.maxDistance = 40;
    controls.target.set(0, 1.5, 0);
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const blueDir = new THREE.DirectionalLight(0x6366f1, 1);
    blueDir.position.set(-10, 10, 10);
    scene.add(blueDir);

    const mainLight = new THREE.PointLight(0xffffff, 1, 50);
    mainLight.position.set(0, 10, 0);
    scene.add(mainLight);

    createHolographicEnvironment(scene, selectedView);

    const animate = () => {
      renderer.setAnimationLoop(() => {
        controls.update();
        const env = scene.getObjectByName('environment');
        if (env) env.rotation.y += 0.0005;
        renderer.render(scene, camera);
      });
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    if (isVRSupported) {
      const vrButton = VRButton.createButton(renderer);
      Object.assign(vrButton.style, {
         position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
         background: 'white', backdropFilter: 'blur(30px)', border: '1px solid rgba(79, 70, 229, 0.1)',
         color: '#4f46e5', borderRadius: '0.75rem', padding: '0.75rem 2rem', fontWeight: '900', textTransform: 'uppercase',
         letterSpacing: "0.2em", fontSize: "9px", boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)", cursor: "pointer"
      });
      containerRef.current.appendChild(vrButton);
    }
  };

  const createVirtualEnvironment = (scene, viewType) => {
    const existing = scene.getObjectByName('environment');
    if (existing) scene.remove(existing);

    const env = new THREE.Group();
    env.name = 'environment';

    const gridHelper = new THREE.GridHelper(50, 50, 0xe2e8f0, 0xf1f5f9);
    gridHelper.position.y = 0;
    env.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    env.add(floor);

    if (viewType === 'theater') {
       const screenGeo = new THREE.PlaneGeometry(20, 11.25);
       const screenMat = new THREE.MeshStandardMaterial({ 
          color: 0xffffff, emissive: 0x6366f1, emissiveIntensity: 0.2, transparent: true, opacity: 0.95
       });
       const screen = new THREE.Mesh(screenGeo, screenMat);
       screen.position.set(0, 6, -15);
       env.add(screen);

       const edgeGeo = new THREE.BoxGeometry(20.5, 11.75, 0.1);
       const edgeMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: 0x6366f1, emissiveIntensity: 1 });
       const edge = new THREE.Mesh(edgeGeo, edgeMat);
       edge.position.set(0, 6, -15.1);
       env.add(edge);

       const pCount = 150;
       const pGeo = new THREE.BufferGeometry();
       const pPos = new Float32Array(pCount * 3);
       for(let i=0; i<pCount*3; i++){ pPos[i] = (Math.random() - 0.5) * 40; }
       pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
       const pMat = new THREE.PointsMaterial({ color: 0x4f46e5, size: 0.08, transparent: true, opacity: 0.3 });
       const particles = new THREE.Points(pGeo, pMat);
       env.add(particles);

       for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 6; c++) {
             const seatGeo = new THREE.BoxGeometry(1.5, 0.2, 1.5);
             const seatMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, transparent: true, opacity: 0.1 });
             const seat = new THREE.Mesh(seatGeo, seatMat);
             seat.position.set((c - 2.5) * 4, 0.1, (r + 1) * 5);
             env.add(seat);
          }
       }
    }

    scene.add(env);
    createAvatarPositions(scene, viewType);
  };

  const createAvatarPositions = (scene, viewType) => {
    const pos = [];
    if (viewType === 'theater') {
       for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 6; c++) {
             pos.push({ x: (c - 2.5) * 4, y: 0, z: (r + 1) * 5 });
          }
       }
    }
    window.avatarPositions = pos;
    updateAvatars(scene);
  };

  const updateAvatars = (scene) => {
    const pos = window.avatarPositions || [];
    participants.forEach((p, i) => {
       if (i < pos.length) {
          const avatar = createLuminousAvatar(p);
          avatar.position.set(pos[i].x, 1, pos[i].z);
          scene.add(avatar);
       }
    });
  };

  const createStudentAvatar = (p) => {
    const group = new THREE.Group();
    const bodyGeo = new THREE.OctahedronGeometry(0.6, 0);
    const bodyMat = new THREE.MeshStandardMaterial({ color: p.color, metalness: 0.5, roughness: 0.2, emissive: p.color, emissiveIntensity: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    const headGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: p.color, emissive: p.color, emissiveIntensity: 1 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.2;
    group.add(head);

    return group;
  };

  const cleanup = () => {
    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (containerRef.current && rendererRef.current.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    }
    if (controlsRef.current) controlsRef.current.dispose();
  };

  const captureAndExplain = async () => {
    if (!rendererRef.current) return;
    
    setIsCapturingAI(true);
    try {
      // 1. Capture the canvas as data URL
      const canvas = rendererRef.current.domElement;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = dataUrl.split(',')[1];

      // 2. Start a dummy session or unique "Virtual Classroom Context" session
      const startRes = await api.post('/ai-homework/start', { 
        subject: 'general', 
        grade: 'all', 
        topic: `Classroom Snapshot: ${roomId}` 
      });

      if (startRes.data.success) {
        const sessionId = startRes.data.data.sessionId;

        // 3. Send image to AI
        const aiRes = await api.post(`/ai-homework/${sessionId}/message`, {
          message: "Analyze this classroom view and explain what is being shown or discussed. If there are slides, summarize them. Provide 100% accurate insights.",
          image: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        });

        if (aiRes.data.success) {
          setAiExplanation(aiRes.data.data.content);
          setShowAIResult(true);
          toast.success('AI Insight Generated');
        }
      }
    } catch (error) {
      console.error('AI Snapshot Error:', error);
      toast.error('AI could not analyze this view');
    } finally {
      setIsCapturingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[10002] flex flex-col font-medium overflow-hidden select-none selection:bg-indigo-500/10 text-left cursor-default">
      {/* Background Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
         <div className="absolute inset-0 bg-gradient-to-tr from-white/90 via-transparent to-white/90 pointer-events-none" />
      </div>

      {/* Header Strip */}
      <div className="relative z-20 px-6 py-4 bg-white/80 backdrop-blur-3xl border-b border-indigo-50 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-4">
            <div className="flex flex-col">
               <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">Live Virtual Classroom</h2>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-glow-[emerald]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">ID: {roomId} :: Active</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
               <div className="flex items-center gap-2">
                  <Users size={16} className="text-indigo-500" />
                  <span className="text-slate-700">{participants.length + 1} Participants</span>
               </div>
               <div className="h-4 w-px bg-slate-200" />
               <div className="flex items-center gap-2">
                  <Signal size={16} className="text-emerald-500" />
                  <span className="text-emerald-700">{syncStatus}% Bandwidth</span>
               </div>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
               <button className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors shadow-sm"><Settings size={18} /></button>
               <button onClick={onClose} className="p-2.5 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-colors shadow-sm"><X size={18} /></button>
            </div>
         </div>
      </div>

      {/* Main 3D Render Screen */}
      <div className="flex-1 relative flex bg-slate-50">
         {/* Left Side Audio/Video Controls */}
         <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 space-y-4">
            {[
               { icon: Mic, label: 'Audio', color: 'text-indigo-600' },
               { icon: Video, label: 'Video', color: 'text-emerald-600' },
               { icon: Maximize2, label: 'Expand', color: 'text-slate-700' }
            ].map((btn, i) => (
               <button 
                  key={i} 
                  className="w-14 h-14 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 hover:shadow-xl transition-all shadow-sm group"
               >
                  <btn.icon size={20} className={cn(btn.color, "group-hover:scale-110 transition-transform")} />
               </button>
            ))}
            
            {/* AI Vision Action */}
            <button 
               onClick={captureAndExplain}
               disabled={isCapturingAI}
               className={cn(
                  "w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 hover:shadow-xl transition-all shadow-lg group",
                  isCapturingAI && "opacity-50 cursor-not-allowed"
               )}
               title="Explain with AI"
            >
               {isCapturingAI ? <RefreshCw size={20} className="text-[#00a8cc] animate-spin" /> : <Brain size={20} className="text-[#00a8cc] group-hover:scale-110 transition-transform" />}
            </button>
         </div>

         {/* WebGL Container */}
         <div ref={containerRef} className="flex-1 cursor-crosshair relative z-10" />

         {/* Right Sidebar - Participants */}
         <div className="absolute right-6 top-6 bottom-6 z-20 w-72 flex flex-col gap-4">
            <div className="flex-1 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 shadow-lg flex flex-col">
               <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                  Session Roster
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               </h4>
               <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                  {/* Instructor Access */}
                  <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-xl font-bold shadow-sm">T</div>
                        <span className="text-sm font-bold text-slate-800">Instructor</span>
                     </div>
                     <Mic size={14} className="text-indigo-600" />
                  </div>
                  {/* Participant Nodes */}
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl font-bold">{p.name[0]}</div>
                          <span className="text-sm font-medium text-slate-700">{p.name}</span>
                       </div>
                       <Signal size={14} className="text-emerald-500" />
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Bottom Tool Bar */}
      <div className="relative z-20 px-8 py-4 bg-white/80 backdrop-blur-3xl border-t border-slate-200 flex items-center justify-center gap-8 shadow-sm">
         <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
            {['Theater', 'Lecture', 'Class'].map(mode => (
               <button 
                  key={mode} 
                  onClick={() => setSelectedView(mode.toLowerCase())}
                  className={cn(
                     "text-sm font-bold px-6 py-2 rounded-lg transition-all",
                     selectedView === mode.toLowerCase() ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                   )}
               >
                  {mode}
               </button>
            ))}
         </div>
      </div>
      {/* AI Explanation Modal */}
      <AnimatePresence>
        {showAIResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[10005] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden border border-indigo-100">
               <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Brain className="text-[#00a8cc]" size={24} />
                     <h3 className="text-white font-bold text-lg">AI Classroom Insight</h3>
                  </div>
                  <button onClick={() => setShowAIResult(false)} className="text-slate-400 hover:text-white transition-colors">
                     <X size={24} />
                  </button>
               </div>
               <div className="p-8 overflow-y-auto bg-slate-50 flex-1 custom-scrollbar">
                  <div className="prose prose-slate max-w-none">
                     <div className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-[15px]">
                        {aiExplanation}
                     </div>
                  </div>
               </div>
               <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => setShowAIResult(false)} 
                    className="px-6 py-2.5 bg-[#00a8cc] text-white font-bold rounded-xl hover:bg-[#008ba8] transition-colors shadow-lg shadow-[#00a8cc]/20"
                  >
                     Got it
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