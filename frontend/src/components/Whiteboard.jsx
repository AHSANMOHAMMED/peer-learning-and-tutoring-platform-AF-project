import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Square, 
  Circle, 
  Minus, 
  Trash2, 
  Download, 
  Undo, 
  Eraser, 
  Type, 
  MousePointer2,
  Zap,
  Cpu,
  Binary,
  Layers,
  Sparkles,
  Signal,
  Maximize2
} from 'lucide-react';
import { cn } from '../utils/cn';

const Whiteboard = ({ sessionId, socket }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState('pencil');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const updateSize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      
      // Set default context styles
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Draw tactical grid
      drawGrid(ctx);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Socket listeners for real-time collaboration
    if (socket) {
      socket.emit('join_session', sessionId);
      
      socket.on('draw_receive', (data) => {
        const { x, y, lastX, lastY, color: remoteColor, width: remoteWidth, tool: remoteTool } = data;
        const remoteCtx = canvasRef.current.getContext('2d');
        
        remoteCtx.beginPath();
        remoteCtx.strokeStyle = remoteTool === 'eraser' ? '#020617' : remoteColor;
        remoteCtx.lineWidth = remoteWidth;
        remoteCtx.moveTo(lastX, lastY);
        remoteCtx.lineTo(x, y);
        remoteCtx.stroke();
      });
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      if (socket) socket.off('draw_receive');
    };
  }, [sessionId, socket]);

  const drawGrid = (ctx) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  };

  const lastPos = useRef({ x: 0, y: 0 });

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    lastPos.current = { x: offsetX, y: offsetY };
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    
    // Board stroke glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.strokeStyle = tool === 'eraser' ? '#020617' : color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    // Emit to socket
    if (socket) {
      socket.emit('draw', {
        sessionId,
        x: offsetX,
        y: offsetY,
        lastX: lastPos.current.x,
        lastY: lastPos.current.y,
        color,
        width: lineWidth,
        tool
      });
    }
    
    lastPos.current = { x: offsetX, y: offsetY };
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    setHistory([...history, canvas.toDataURL()]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
    setHistory([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'whiteboard-export.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const tools = [
    { id: 'pencil', icon: MousePointer2, label: 'Pen Tool' },
    { id: 'eraser', icon: Eraser, label: 'Clear Ink' },
    { id: 'text', icon: Type, label: 'Text Input' },
  ];

  const controlColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ffffff'];

  return (
    <div className="w-full h-full min-h-[700px] bg-[#020617] rounded-[4.5rem] border-2 border-white/5 shadow-5xl relative overflow-hidden flex flex-col group">
      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="cinematic-scanlines opacity-10" />
      </div>

      {/* Tactical Header */}
      <div className="px-12 py-8 bg-white/5 backdrop-blur-[120px] border-b-2 border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-20">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-600/10 border-2 border-indigo-500/20 rounded-[1.8rem] shadow-5xl group-hover:rotate-6 transition-transform">
               <Zap className="text-indigo-400 shadow-glow" size={32} />
            </div>
            <div className="text-left">
               <h3 className="text-3xl font-medium uppercase tracking-tighter text-white leading-none">Interactive Board</h3>
               <div className="flex items-center gap-4 mt-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow shadow-emerald-500/50" />
                  <span className="text-sm font-medium uppercase text-gray-800 tracking-normal">Active Manifest Synchronization</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-8 py-4 bg-black/60 rounded-full border-2 border-white/5 shadow-inner">
               <Signal size={16} className="text-indigo-500" />
               <span className="text-sm font-medium text-gray-800 uppercase tracking-normal">Latency: 12ms</span>
            </div>
            <button
               onClick={clearCanvas}
               className="p-4 bg-red-600/10 border-2 border-red-500/20 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-5xl active:scale-95"
            >
               <Trash2 size={24} />
            </button>
            <button
               onClick={downloadCanvas}
               className="p-4 bg-white/5 border-2 border-white/10 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-5xl active:scale-95"
            >
               <Download size={24} />
            </button>
         </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative cursor-crosshair group/canvas">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          className="absolute inset-0 z-10"
        />
        
        {/* Floating Tool Terminal */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 p-4 bg-slate-950/80 backdrop-blur-[120px] rounded-[3rem] border-2 border-white/10 shadow-5xl shadow-black/50">
           <div className="flex items-center gap-3 pr-6 border-r-2 border-white/5">
              {tools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  className={cn(
                    "p-5 rounded-[1.5rem] transition-all duration-500 relative group/tool",
                    tool === t.id ? "bg-indigo-600 text-white shadow-glow" : "text-gray-900 hover:text-white hover:bg-white/5"
                  )}
                  title={t.label}
                >
                  <t.icon size={24} />
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-black rounded-lg text-xs font-medium uppercase tracking-widest opacity-0 group-hover/tool:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                     {t.label}
                  </div>
                </button>
              ))}
           </div>

           <div className="flex items-center gap-3 px-6 border-r-2 border-white/5">
              {controlColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-all duration-500 border-2",
                    color === c ? "scale-125 border-white shadow-glow" : "border-transparent opacity-40 hover:opacity-100"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
           </div>

           <div className="flex items-center gap-6 pl-2">
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={lineWidth}
                onChange={(e) => setLineWidth(e.target.value)}
                className="w-32 h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-white transition-all"
              />
              <span className="text-sm font-medium text-gray-800 uppercase tracking-widest tabular-nums w-8">{lineWidth}PX</span>
           </div>
        </div>

        {/* Tactical HUD Markers */}
        <div className="absolute top-12 left-12 flex flex-col gap-6 z-20 pointer-events-none">
           <div className="flex items-center gap-4 text-xs font-medium text-gray-950 uppercase tracking-normal">
              <Cpu size={14} className="text-indigo-500" /> Neural State: Ready
           </div>
           <div className="flex items-center gap-4 text-xs font-medium text-gray-950 uppercase tracking-normal">
              <Binary size={14} className="text-indigo-500" /> Stream Node: Active
           </div>
        </div>

        {/* Global Hub Indicator */}
        <div className="absolute bottom-12 right-12 group z-20 hidden md:block">
           <div className="flex items-center gap-8 py-4 px-10 bg-slate-950/60 backdrop-blur-3xl rounded-full border-2 border-white/5 shadow-inner cursor-default opacity-40 hover:opacity-100 transition-all duration-1000">
              <div className="relative">
                 <Binary size={32} className="text-indigo-500 animate-[spin_30s_linear_infinite]" />
                 <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-40" />
              </div>
              <div className="text-left">
                 <p className="text-sm font-medium uppercase tracking-normal text-gray-800">Whiteboard Performance</p>
                 <div className="flex items-center gap-4 mt-2 text-xs font-medium uppercase text-indigo-500 tracking-widest">
                    <Maximize2 size={12} /> Resolution Optimized :: Tier XII Sync
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;