import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { 
  Square, 
  Circle, 
  Type, 
  Pencil, 
  Eraser, 
  Trash2, 
  Download, 
  Undo, 
  Redo, 
  MousePointer2 
} from 'lucide-react';
import { cn } from '../utils/cn';

interface WhiteboardProps {
  sessionId: string;
  socket: Socket | null;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ sessionId, socket }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<'pencil' | 'eraser' | 'rect' | 'circle' | 'text' | 'select'>('pencil');
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    });

    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = brushSize;

    setFabricCanvas(canvas);

    // Socket.io integration
    if (socket) {
      canvas.on('path:created', (e: any) => {
        const path = e.path;
        socket.emit('draw', { sessionId, path: path.toObject() });
      });

      socket.on('draw_receive', (data: any) => {
        if (data.sessionId === sessionId) {
          fabric.util.enlivenObjects([data.path], (objects: any) => {
            objects.forEach((obj: any) => {
              canvas.add(obj);
            });
            canvas.renderAll();
          }, 'fabric');
        }
      });
    }

    return () => {
      canvas.dispose();
      socket?.off('draw_receive');
    };
  }, [sessionId, socket]);

  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.freeDrawingBrush.color = color;
    fabricCanvas.freeDrawingBrush.width = brushSize;
  }, [color, brushSize, fabricCanvas]);

  const setTool = (tool: typeof activeTool) => {
    setActiveTool(tool);
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = tool === 'pencil' || tool === 'eraser';
    if (tool === 'pencil') {
      fabricCanvas.freeDrawingBrush.color = color;
    } else if (tool === 'eraser') {
      fabricCanvas.freeDrawingBrush.color = '#ffffff';
    }
  };

  const addRect = () => {
    if (!fabricCanvas) return;
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: color,
      strokeWidth: brushSize,
      width: 100,
      height: 100,
    });
    fabricCanvas.add(rect);
    socket?.emit('draw', { sessionId, path: rect.toObject() });
    setTool('select');
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
  };

  const downloadImage = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      multiplier: 2
    });
    const link = document.createElement('a');
    link.download = `whiteboard-session-${sessionId}.png`;
    link.href = dataURL;
    link.click();
  };

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'pencil', icon: Pencil, label: 'Pencil' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'rect', icon: Square, label: 'Rectangle', action: addRect },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
  ];

  return (
    <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => tool.action ? tool.action() : setTool(tool.id as any)}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                activeTool === tool.id 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
              title={tool.label}
            >
              <tool.icon size={20} />
            </button>
          ))}
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2" />
          <button onClick={clearCanvas} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Clear All">
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => document.getElementById('color-picker')?.click()}
            />
            <input 
              id="color-picker"
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="hidden" 
            />
          </div>
          <select 
            value={brushSize} 
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-bold rounded-lg px-2 py-1 outline-none"
          >
            {[1, 2, 3, 5, 8, 12].map(s => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>
          <button 
            onClick={downloadImage}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-bold rounded-xl hover:bg-black transition-all"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex justify-center bg-gray-200 dark:bg-gray-800 rounded-2xl p-4 overflow-hidden">
        <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="flex justify-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
        PeerLearn Collaborative Real-Time Whiteboard v2.0
      </div>
    </div>
  );
};

export default Whiteboard;
