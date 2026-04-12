import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, Send, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorder = useRef(null);
  const timerInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      const chunks = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      clearInterval(timerInterval.current);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    setIsUploading(true);
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', audioBlob, `voice_note_${Date.now()}.webm`);
      
      // We assume there's a file upload endpoint /api/files/upload
      // For now, I'll pass the blob back to the parent to handle the actual API call
      await onSend(audioBlob);
      resetRecorder();
    } catch (err) {
      toast.error('Failed to send voice note');
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecorder = () => {
    setAudioURL('');
    setAudioBlob(null);
    setRecordingTime(0);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
      {!audioBlob ? (
        <>
          <div className="flex-1 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-xs font-bold text-slate-600 tabular-nums">
              {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Ready to record'}
            </span>
          </div>
          
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              <Mic size={18} />
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <Square size={18} />
            </button>
          )}
          
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </>
      ) : (
        <>
          <div className="flex-1 flex items-center gap-3">
            <audio src={audioURL} controls className="h-8 max-w-[150px]" />
            <span className="text-xs font-bold text-slate-500">{formatTime(recordingTime)}</span>
          </div>
          
          <button 
            onClick={resetRecorder}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
          
          <button 
            onClick={handleSend}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-xs disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send Note
          </button>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;
