import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box as ThreeBox } from '@react-three/drei';
import PropTypes from 'prop-types';

/**
 * WebXRVirtualClassroom - Immersive 3D classroom using WebXR
 * Supports VR headsets and 3D interaction for remote learning
 */
const WebXRVirtualClassroom = ({ sessionId, user, participants, isHost }) => {
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isInVR, setIsInVR] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef();

  useEffect(() => {
    // Check WebXR support
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        setIsVRSupported(supported);
      }).catch(() => {
        setIsVRSupported(false);
      });
    }
  }, []);

  const handleEnterVR = () => {
    setIsInVR(true);
  };

  const handleExitVR = () => {
    setIsInVR(false);
  };

  // 3D Classroom Scene
  const ClassroomScene = () => {
    return (
      <>
        {/* Ambient Light */}
        <ambientLight intensity={0.5} />
        
        {/* Directional Light (sun) */}
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        {/* Floor */}
        <ThreeBox args={[20, 0.1, 20]} position={[0, -0.05, 0]} receiveShadow>
          <meshStandardMaterial color="#f0f0f0" />
        </ThreeBox>
        
        {/* Walls */}
        <ThreeBox args={[20, 5, 0.1]} position={[0, 2.5, -10]}>
          <meshStandardMaterial color="#e0e0e0" />
        </ThreeBox>
        <ThreeBox args={[0.1, 5, 20]} position={[-10, 2.5, 0]}>
          <meshStandardMaterial color="#e0e0e0" />
        </ThreeBox>
        <ThreeBox args={[0.1, 5, 20]} position={[10, 2.5, 0]}>
          <meshStandardMaterial color="#e0e0e0" />
        </ThreeBox>
        
        {/* Whiteboard */}
        <ThreeBox args={[4, 2.5, 0.05]} position={[0, 2, -9.9]}>
          <meshStandardMaterial color="white" />
        </ThreeBox>
        
        {/* Whiteboard Frame */}
        <ThreeBox args={[4.2, 2.7, 0.03]} position={[0, 2, -9.95]}>
          <meshStandardMaterial color="#333" />
        </ThreeBox>
        
        {/* Teacher's Desk */}
        <ThreeBox args={[2, 1, 1]} position={[0, 0.5, -8]} castShadow>
          <meshStandardMaterial color="#8B4513" />
        </ThreeBox>
        
        {/* Student Desks - arranged in rows */}
        {[-6, -2, 2, 6].map((x, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {[-3, 0, 3].map((z, colIndex) => (
              <group key={`desk-${rowIndex}-${colIndex}`}>
                <ThreeBox 
                  args={[1.5, 0.8, 0.8]} 
                  position={[x, 0.4, z]} 
                  castShadow
                >
                  <meshStandardMaterial color="#DEB887" />
                </ThreeBox>
                {/* Chair */}
                <ThreeBox 
                  args={[0.6, 0.9, 0.6]} 
                  position={[x, 0.45, z + 1]} 
                  castShadow
                >
                  <meshStandardMaterial color="#8B4513" />
                </ThreeBox>
              </group>
            ))}
          </React.Fragment>
        ))}
        
        {/* Participant Avatars - positioned at desks */}
        {participants?.map((participant, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const x = [-6, -2, 2, 6][row] || 0;
          const z = [-3, 0, 3][col] || 0;
          
          return (
            <group key={participant._id}>
              {/* Avatar Body */}
              <ThreeBox 
                args={[0.5, 1.2, 0.3]} 
                position={[x, 1.4, z + 0.3]}
              >
                <meshStandardMaterial color={participant.color || '#3b82f6'} />
              </ThreeBox>
              
              {/* Avatar Head */}
              <ThreeBox 
                args={[0.4, 0.4, 0.4]} 
                position={[x, 2.2, z + 0.3]}
              >
                <meshStandardMaterial color="#ffccaa" />
              </ThreeBox>
              
              {/* Name Tag */}
              <Text
                position={[x, 2.6, z + 0.3]}
                fontSize={0.15}
                color="black"
                anchorX="center"
                anchorY="middle"
              >
                {participant.name}
              </Text>
            </group>
          );
        })}
        
        {/* Screen/Projection on wall */}
        <ThreeBox args={[3, 1.7, 0.02]} position={[0, 2.5, -9.92]}>
          <meshStandardMaterial color="#1a1a1a" />
        </ThreeBox>
        
        {/* 3D Content Display (for presentations) */}
        <Text
          position={[0, 2.5, -9.9]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Virtual Classroom
          Session: {sessionId}
        </Text>
        
        {/* VR Controllers */}
        <Controllers />
        
        {/* Hand tracking */}
        <Hands />
        
        {/* Orbit controls for non-VR mode */}
        {!isInVR && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
      </>
    );
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ width: '100%', height: '600px', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <Typography variant="h6" gutterBottom>
          Virtual Classroom
        </Typography>
        {!isVRSupported && (
          <Alert severity="info" sx={{ mb: 2 }}>
            VR not supported on this device. Using 3D view mode.
          </Alert>
        )}
        {isVRSupported && (
          <VRButton 
            onClick={isInVR ? handleExitVR : handleEnterVR}
            variant="contained"
            sx={{ mb: 2 }}
          >
            {isInVR ? 'Exit VR' : 'Enter VR'}
          </VRButton>
        )}
      </Box>

      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Typography variant="body2" color="text.secondary">
          Participants: {participants?.length || 0}
        </Typography>
        {isHost && (
          <Typography variant="body2" color="primary">
            You are the host
          </Typography>
        )}
      </Box>

      <Canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 3, 8], fov: 60 }}
        shadows
      >
        <XR>
          <ClassroomScene />
        </XR>
      </Canvas>

      {/* Interaction Instructions */}
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
          <Typography variant="body2" color="text.secondary">
            {isInVR ? (
              'Use VR controllers to interact. Point and click to participate.'
            ) : (
              'Mouse: Left click + drag to rotate | Right click + drag to pan | Scroll to zoom'
            )}
          </Typography>
        </Paper>
      </Box>
    </Paper>
  );
};

WebXRVirtualClassroom.propTypes = {
  sessionId: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  participants: PropTypes.array,
  isHost: PropTypes.bool
};

export default WebXRVirtualClassroom;
