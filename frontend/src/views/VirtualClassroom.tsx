import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { toast } from 'react-hot-toast';
import { Glasses, Monitor, Users, X } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  color?: string;
}

interface VirtualClassroomProps {
  roomId: string;
  participants?: Participant[];
  isInstructor?: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    avatarPositions: { x: number; y: number; z: number }[];
  }
}

const VirtualClassroom: React.FC<VirtualClassroomProps> = ({ 
  roomId, 
  participants = [], 
  isInstructor = false,
  onClose 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isInVR, setIsInVR] = useState(false);
  const [selectedView, setSelectedView] = useState('theater'); // theater, classroom, auditorium
  const avatarsRef = useRef<Map<string, THREE.Group>>(new Map());
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    // Check WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-vr').then((supported: boolean) => {
        setIsVRSupported(supported);
      }).catch(() => {
        setIsVRSupported(false);
      });
    }

    initScene();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    updateAvatars();
  }, [participants]);

  const initScene = () => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

    // Lighting
    setupLighting(scene);

    // Environment
    createClassroomEnvironment(scene, selectedView);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = 
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener('resize', handleResize);

    // Add VR button if supported
    if (isVRSupported) {
      const vrButton = VRButton.createButton(renderer);
      vrButton.style.position = 'absolute';
      vrButton.style.bottom = '20px';
      vrButton.style.left = '50%';
      vrButton.style.transform = 'translateX(-50%)';
      vrButton.style.zIndex = '10';
      containerRef.current.appendChild(vrButton);

      // Listen for VR session changes
      renderer.xr.addEventListener('sessionstart', () => {
        setIsInVR(true);
        toast.success('Entered VR mode');
      });

      renderer.xr.addEventListener('sessionend', () => {
        setIsInVR(false);
        toast('Exited VR mode', { icon: 'ℹ️' });
      });
    }
  };

  const setupLighting = (scene: THREE.Scene) => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x3b82f6, 0.5, 10);
    pointLight1.position.set(-3, 3, -3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf59e0b, 0.3, 10);
    pointLight2.position.set(3, 3, 3);
    scene.add(pointLight2);
  };

  const createClassroomEnvironment = (scene: THREE.Scene, viewType: string) => {
    // Clear existing environment
    const existingEnv = scene.getObjectByName('environment');
    if (existingEnv) {
      scene.remove(existingEnv);
    }

    const environment = new THREE.Group();
    environment.name = 'environment';

    switch (viewType) {
      case 'theater':
        createTheaterEnvironment(environment);
        break;
      case 'classroom':
        createTraditionalClassroom(environment);
        break;
      case 'auditorium':
        createAuditoriumEnvironment(environment);
        break;
      default:
        createTheaterEnvironment(environment);
    }

    scene.add(environment);

    // Create instructor podium
    createInstructorArea(scene);

    // Create avatar positions
    createAvatarPositions(scene, viewType);
  };

  const createTheaterEnvironment = (group: THREE.Group) => {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c3e50,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Stage
    const stageGeometry = new THREE.BoxGeometry(8, 0.5, 4);
    const stageMaterial = new THREE.MeshStandardMaterial({ color: 0x34495e });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, 0.25, -6);
    stage.receiveShadow = true;
    stage.castShadow = true;
    group.add(stage);

    // Back wall with screen area
    const wallGeometry = new THREE.PlaneGeometry(20, 10);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xecf0f1 });
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 5, -8);
    backWall.receiveShadow = true;
    group.add(backWall);

    // Screen frame
    const screenFrameGeometry = new THREE.BoxGeometry(6, 3.5, 0.1);
    const screenFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    const screenFrame = new THREE.Mesh(screenFrameGeometry, screenFrameMaterial);
    screenFrame.position.set(0, 3, -7.9);
    group.add(screenFrame);

    // Screen
    const screenGeometry = new THREE.PlaneGeometry(5.8, 3.3);
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 3, -7.85);
    group.add(screen);

    // Seating area markers (invisible positions)
    const seatGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
    const seatMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x95a5a6,
      transparent: true,
      opacity: 0.5
    });

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 8; col++) {
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(
          (col - 3.5) * 1.2,
          0.05,
          (row + 1) * 1.5
        );
        group.add(seat);
      }
    }

    // Side walls
    const sideWallGeometry = new THREE.PlaneGeometry(20, 10);
    const sideWallMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    
    const leftWall = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
    leftWall.position.set(-10, 5, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
    rightWall.position.set(10, 5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    group.add(rightWall);
  };

  const createTraditionalClassroom = (group: THREE.Group) => {
    // Floor with grid pattern
    const floorGeometry = new THREE.PlaneGeometry(15, 15);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd4a574,
      roughness: 0.9
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Whiteboard
    const boardGeometry = new THREE.PlaneGeometry(8, 4);
    const boardMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.4
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.set(0, 3, -7);
    board.receiveShadow = true;
    group.add(board);

    // Board frame
    const frameGeometry = new THREE.BoxGeometry(8.2, 4.2, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 3, -7.05);
    group.add(frame);

    // Teacher desk
    const deskGeometry = new THREE.BoxGeometry(2, 1, 1);
    const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(0, 0.5, -5);
    desk.castShadow = true;
    desk.receiveShadow = true;
    group.add(desk);

    // Student desks
    const studentDeskGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.6);
    const studentDeskMaterial = new THREE.MeshStandardMaterial({ color: 0xdeb887 });

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const studentDesk = new THREE.Mesh(studentDeskGeometry, studentDeskMaterial);
        studentDesk.position.set(
          (col - 1.5) * 2,
          0.4,
          (row + 1) * 1.5
        );
        studentDesk.castShadow = true;
        studentDesk.receiveShadow = true;
        group.add(studentDesk);
      }
    }

    // Windows
    const windowGeometry = new THREE.PlaneGeometry(2, 3);
    const windowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6
    });

    for (let i = 0; i < 3; i++) {
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(-7, 3, -2 + i * 3);
      window.rotation.y = Math.PI / 2;
      group.add(window);
    }
  };

  const createAuditoriumEnvironment = (group: THREE.Group) => {
    // Large curved floor
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c3e50,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Large stage
    const stageGeometry = new THREE.CylinderGeometry(6, 6, 0.5, 32);
    const stageMaterial = new THREE.MeshStandardMaterial({ color: 0x34495e });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, 0.25, -10);
    stage.receiveShadow = true;
    group.add(stage);

    // Large screen
    const screenGeometry = new THREE.PlaneGeometry(12, 7);
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 4, -13.9);
    group.add(screen);

    // Curved seating rows
    for (let row = 0; row < 8; row++) {
      const radius = 6 + row * 1.5;
      const seatsInRow = 8 + row * 2;
      
      for (let i = 0; i < seatsInRow; i++) {
        const angle = (i / (seatsInRow - 1)) * Math.PI - Math.PI / 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius + 2;
        
        const seatGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32);
        const seatMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(x, 0.05, z);
        seat.rotation.y = angle;
        group.add(seat);
      }
    }
  };

  const createInstructorArea = (scene: THREE.Scene) => {
    // Instructor podium
    const podiumGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.2, 32);
    const podiumMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
    podium.position.set(0, 0.6, -6);
    podium.castShadow = true;
    scene.add(podium);

    // Instructor position indicator (when no instructor present)
    const instructorLight = new THREE.PointLight(0x00ff00, 1, 5);
    instructorLight.position.set(0, 2, -6);
    instructorLight.name = 'instructorLight';
    scene.add(instructorLight);
  };

  const createAvatarPositions = (scene: THREE.Scene, viewType: string) => {
    const positions = [];
    
    if (viewType === 'theater') {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
          positions.push({
            x: (col - 3.5) * 1.2,
            y: 0,
            z: (row + 1) * 1.5
          });
        }
      }
    } else if (viewType === 'classroom') {
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          positions.push({
            x: (col - 1.5) * 2,
            y: 0,
            z: (row + 1) * 1.5
          });
        }
      }
    }

    // Store positions for avatar placement
    window.avatarPositions = positions;
  };

  const createAvatar = (participant: Participant, position: { x: number; y: number; z: number }) => {
    const group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: participant.color || 0x3b82f6 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffdbac 
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.4;
    head.castShadow = true;
    group.add(head);

    // Name label (as a simple plane with text texture)
    const labelGeometry = new THREE.PlaneGeometry(1, 0.3);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.y = 1.8;
    label.lookAt(cameraRef.current.position);
    group.add(label);

    group.position.set(position.x, 0, position.z);
    
    // Add user data for identification
    group.userData = { participantId: participant.id, name: participant.name };

    return group;
  };

  const updateAvatars = () => {
    if (!sceneRef.current) return;

    const positions = window.avatarPositions || [];
    
    // Remove avatars that are no longer present
    avatarsRef.current.forEach((avatar, id) => {
      if (!participants.find(p => p.id === id)) {
        sceneRef.current.remove(avatar);
        avatarsRef.current.delete(id);
      }
    });

    // Add or update avatars
    participants.forEach((participant, index) => {
      if (avatarsRef.current.has(participant.id)) {
        // Update existing avatar
        const avatar = avatarsRef.current.get(participant.id);
        // Could update position, color, etc.
      } else if (index < positions.length) {
        // Create new avatar
        const avatar = createAvatar(participant, positions[index]);
        sceneRef.current.add(avatar);
        avatarsRef.current.set(participant.id, avatar);
      }
    });
  };

  const cleanup = () => {
    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (containerRef.current && rendererRef.current.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    }
    
    if (controlsRef.current) {
      controlsRef.current.dispose();
    }
  };

  const handleViewChange = (view: string) => {
    setSelectedView(view);
    if (sceneRef.current) {
      createClassroomEnvironment(sceneRef.current, view);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Glasses className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Virtual Classroom</h2>
          <span className="text-sm text-gray-400">
            {participants.length} participants
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* View selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {['theater', 'classroom', 'auditorium'].map((view) => (
              <button
                key={view}
                onClick={() => handleViewChange(view)}
                className={`px-3 py-1 rounded-md text-sm capitalize transition-colors ${
                  selectedView === view
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          {/* VR Button indicator */}
          {isVRSupported && (
            <span className="text-sm text-green-400 flex items-center">
              <Monitor className="w-4 h-4 mr-1" />
              VR Ready
            </span>
          )}

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative"
        style={{ minHeight: '500px' }}
      />

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4 pointer-events-none">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 pointer-events-auto">
          <div className="flex items-center space-x-4 text-white text-sm">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {participants.length} online
            </span>
            {isInVR && (
              <span className="text-green-400">VR Mode Active</span>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!isInVR && (
        <div className="absolute top-20 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 text-white text-sm max-w-xs">
          <h4 className="font-semibold mb-2">Controls:</h4>
          <ul className="space-y-1 text-gray-300">
            <li>• Mouse: Look around</li>
            <li>• Click & Drag: Rotate view</li>
            <li>• Scroll: Zoom in/out</li>
            <li>• WASD: Move (if enabled)</li>
          </ul>
          {isVRSupported && (
            <p className="mt-3 text-blue-400">
              Click "Enter VR" button below to use VR headset
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VirtualClassroom;
