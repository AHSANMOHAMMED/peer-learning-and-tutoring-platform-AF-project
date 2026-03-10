import React, { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Eraser, Pencil, Square, Circle, Type, Undo, Redo, Download, Trash2 } from 'lucide-react';

const CollaborativeWhiteboard = ({ 
  roomId, 
  socket, 
  userId, 
  isInstructor = false,
  initialData = null,
  onWhiteboardUpdate,
  readOnly = false 
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawing = useRef(false);
  const [elements, setElements] = useState([]);
  const [selectedTool, setSelectedTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = color;
    context.lineWidth = strokeWidth;
    contextRef.current = context;

    // Load initial data if provided
    if (initialData) {
      loadWhiteboardData(initialData);
    }
  }, []);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Listen for whiteboard updates from other users
    socket.on('whiteboardChanged', (data) => {
      if (data.roomId === roomId && data.userId !== userId) {
        loadWhiteboardData(data.whiteboardData);
      }
    });

    return () => {
      socket.off('whiteboardChanged');
    };
  }, [socket, roomId, userId]);

  const loadWhiteboardData = (data) => {
    if (!data || !data.elements) return;
    
    setElements(data.elements);
    redrawCanvas(data.elements);
    
    // Update history
    historyRef.current = [data.elements];
    historyIndexRef.current = 0;
  };

  const redrawCanvas = (elementsToDraw) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    elementsToDraw.forEach(element => {
      drawElement(context, element);
    });
  };

  const drawElement = (context, element) => {
    context.strokeStyle = element.color || '#000000';
    context.lineWidth = element.strokeWidth || 2;

    switch (element.type) {
      case 'pencil':
        if (element.points && element.points.length > 0) {
          context.beginPath();
          context.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach((point, index) => {
            if (index > 0) {
              context.lineTo(point.x, point.y);
            }
          });
          context.stroke();
        }
        break;

      case 'rectangle':
        context.strokeRect(
          element.x,
          element.y,
          element.width,
          element.height
        );
        break;

      case 'circle':
        context.beginPath();
        context.arc(
          element.x,
          element.y,
          element.radius,
          0,
          2 * Math.PI
        );
        context.stroke();
        break;

      case 'text':
        context.font = `${element.fontSize || 16}px Arial`;
        context.fillStyle = element.color || '#000000';
        context.fillText(element.text, element.x, element.y);
        break;

      default:
        break;
    }
  };

  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e) => {
    if (readOnly) return;
    
    const { x, y } = getMousePos(e);
    isDrawing.current = true;

    const newElement = {
      id: Date.now().toString(),
      type: selectedTool,
      color,
      strokeWidth,
      x,
      y,
      points: selectedTool === 'pencil' ? [{ x, y }] : undefined
    };

    setElements(prev => [...prev, newElement]);
  }, [selectedTool, color, strokeWidth, readOnly, getMousePos]);

  const draw = useCallback((e) => {
    if (!isDrawing.current || readOnly) return;

    const { x, y } = getMousePos(e);
    
    setElements(prev => {
      const lastElement = prev[prev.length - 1];
      if (!lastElement) return prev;

      let updatedElement;

      switch (lastElement.type) {
        case 'pencil':
          updatedElement = {
            ...lastElement,
            points: [...lastElement.points, { x, y }]
          };
          break;

        case 'rectangle':
          updatedElement = {
            ...lastElement,
            width: x - lastElement.x,
            height: y - lastElement.y
          };
          break;

        case 'circle':
          const radius = Math.sqrt(
            Math.pow(x - lastElement.x, 2) + Math.pow(y - lastElement.y, 2)
          );
          updatedElement = {
            ...lastElement,
            radius
          };
          break;

        default:
          return prev;
      }

      const newElements = [...prev.slice(0, -1), updatedElement];
      
      // Redraw canvas
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        newElements.forEach(element => drawElement(context, element));
      }

      return newElements;
    });
  }, [getMousePos, readOnly]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing.current) return;
    
    isDrawing.current = false;

    // Save to history
    setElements(prev => {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(prev);
      historyIndexRef.current = historyRef.current.length - 1;

      // Broadcast update to other users
      if (socket && roomId) {
        socket.emit('whiteboardUpdate', {
          roomId,
          whiteboardData: { elements: prev },
          userId
        });
      }

      // Notify parent component
      if (onWhiteboardUpdate) {
        onWhiteboardUpdate({ elements: prev });
      }

      return prev;
    });
  }, [socket, roomId, userId, onWhiteboardUpdate]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const previousElements = historyRef.current[historyIndexRef.current];
      setElements(previousElements);
      redrawCanvas(previousElements);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const nextElements = historyRef.current[historyIndexRef.current];
      setElements(nextElements);
      redrawCanvas(nextElements);
    }
  }, []);

  const clearCanvas = useCallback(() => {
    setElements([]);
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Save empty state to history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push([]);
    historyIndexRef.current = historyRef.current.length - 1;

    // Broadcast clear to other users
    if (socket && roomId) {
      socket.emit('whiteboardUpdate', {
        roomId,
        whiteboardData: { elements: [] },
        userId
      });
    }

    toast.success('Whiteboard cleared');
  }, [socket, roomId, userId]);

  const downloadWhiteboard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast.success('Whiteboard downloaded');
  }, [roomId]);

  const tools = [
    { id: 'pencil', icon: Pencil, label: 'Draw' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' }
  ];

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {/* Tools */}
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={tool.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}

          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Colors */}
          <div className="flex items-center space-x-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  color === c ? 'border-gray-400 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Stroke Width */}
          <select
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value={1}>Thin</option>
            <option value={2}>Normal</option>
            <option value={4}>Thick</option>
            <option value={8}>Extra Thick</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            disabled={historyIndexRef.current <= 0}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
          
          <button
            onClick={redo}
            disabled={historyIndexRef.current >= historyRef.current.length - 1}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Redo"
          >
            <Redo className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-gray-300 mx-2" />

          <button
            onClick={clearCanvas}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Clear"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <button
            onClick={downloadWhiteboard}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`w-full h-full ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
          style={{ touchAction: 'none' }}
        />
        
        {readOnly && (
          <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-sm font-medium">
            View Only
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborativeWhiteboard;
