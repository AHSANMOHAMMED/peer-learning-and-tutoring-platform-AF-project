import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Trash2, Send, X, Volume2, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualizerData, setVisualizerData] = useState(Array(20).fill(10));

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    return () => {
      stopTimer();
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startTimer();
      simulateVisualizer();
    } catch (err) {
      toast.error('Could not access microphone');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
      cancelAnimationFrame(animationRef.current);
    }
  };

  const simulateVisualizer = () => {
    setVisualizerData(prev => prev.map(() => Math.random() * 40 + 10));
    animationRef.current = requestAnimationFrame(simulateVisualizer);
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isRecording && (
            <motion.div 
              animate={{ opacity: [1, 0.5, 1] }} 
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-3 h-3 bg-rose-500 rounded-full"
            />
          )}
          <span className="text-sm font-bold text-slate-700 font-mono">
            {isRecording ? formatTime(recordingTime) : audioUrl ? "Recording ready" : "Ready to record"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {!isRecording && !audioUrl && (
            <button 
              onClick={startRecording}
              className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
            >
              <Mic size={20} />
            </button>
          )}

          {isRecording && (
            <button 
              onClick={stopRecording}
              className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg"
            >
              <Square size={18} />
            </button>
          )}

          {audioUrl && (
            <div className="flex items-center gap-2">
              <button 
                onClick={togglePlayback}
                className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200"
              >
                {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={20} className="translate-x-0.5" />}
              </button>
              <button 
                onClick={deleteRecording}
                className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={() => onSend(audioBlob)}
                className="px-6 py-2 bg-emerald-500 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                <Send size={14} /> Send
              </button>
            </div>
          )}
          
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {isRecording && (
        <div className="flex items-end justify-center gap-1 h-12 py-2">
          {visualizerData.map((height, i) => (
            <motion.div 
              key={i}
              animate={{ height }}
              className="w-1.5 bg-rose-400 rounded-full"
            />
          ))}
        </div>
      )}

      {audioUrl && (
        <div className="bg-slate-100 rounded-2xl p-3 flex items-center gap-3">
          <Volume2 size={18} className="text-slate-400" />
          <div className="flex-1 h-1 bg-slate-200 rounded-full relative">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full"
              animate={{ width: isPlaying ? '100%' : '0%' }}
              transition={{ duration: recordingTime, ease: 'linear' }}
            />
          </div>
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)} 
            className="hidden" 
          />
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
