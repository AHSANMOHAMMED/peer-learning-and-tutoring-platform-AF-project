import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { motion } from 'framer-motion';







const JitsiContainer = ({ roomName, displayName, onReady }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full min-h-[600px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative">
      
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: true,
          startWithVideoMuted: true,
          enableEmailInStats: false,
          toolbarButtons: [
          'camera',
          'chat',
          'desktop',
          'feedback',
          'fullscreen',
          'hangup',
          'microphone',
          'noisesuppression',
          'raisehand',
          'recording',
          'select-background',
          'tileview',
          'videoquality',
          'whiteboard']

        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        }}
        userInfo={{
          displayName: displayName,
          email: `${displayName.toLowerCase().replace(/\s+/g, '.')}@peerlearn.com`
        }}
        onApiReady={(externalApi) => {
          onReady?.();
          // You can also add event listeners here
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }} />
      
      
      {/* Role Badge inside Jitsi overlay */}
      <div className="absolute top-4 left-4 z-50 px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl text-white text-xs font-bold uppercase tracking-widest border border-white/20">
        Aura Session
      </div>
    </motion.div>);

};

export default JitsiContainer;