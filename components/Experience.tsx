import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeParticles } from './TreeParticles';
import { PhotoCloud } from './PhotoCloud';
import { AppMode, HandData } from '../types';

interface ExperienceProps {
  mode: AppMode;
  handData: React.MutableRefObject<HandData>;
  photos: string[];
  setMode: (m: AppMode) => void;
}

const CameraController: React.FC<{ mode: AppMode; handData: React.MutableRefObject<HandData> }> = ({ mode, handData }) => {
  const { camera } = useThree();
  const vec = new THREE.Vector3();

  useFrame((state, delta) => {
    // Base position depends on mode
    let targetPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3(0, 0, 0);

    if (mode === AppMode.TREE) {
      targetPos.set(0, 0, 25);
    } else if (mode === AppMode.SCATTER) {
      // Hand control for rotation
      const { palmPosition, isPresent } = handData.current;
      
      let rotX = 0;
      let rotY = 0;

      if (isPresent) {
        // Map 0-1 to -1 to 1
        rotX = (palmPosition.x - 0.5) * 20; 
        rotY = (palmPosition.y - 0.5) * 10;
      }

      targetPos.set(Math.sin(state.clock.elapsedTime * 0.1) * 10 + rotX, rotY, 20);
    } else if (mode === AppMode.ZOOM) {
      // Zoom in tight on the tree center for now, or a specific photo logic would go here
      // For this demo, ZOOM just moves camera closer to center
      targetPos.set(0, 0, 8);
    }

    // Smooth camera movement
    camera.position.lerp(targetPos, 0.05);
    camera.lookAt(targetLookAt);
  });

  return null;
};

export const Experience: React.FC<ExperienceProps> = ({ mode, handData, photos, setMode }) => {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 25], fov: 45 }}>
      <color attach="background" args={['#050505']} />
      
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={2} color="#D4AF37" castShadow />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#B01B2E" />
      <pointLight position={[0, -5, 5]} intensity={0.5} color="#2F5233" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#D4AF37" />

      <Environment preset="city" />

      {/* Main Content */}
      <group position={[0, -5, 0]}>
        <TreeParticles mode={mode} />
        <PhotoCloud 
            photos={photos} 
            mode={mode} 
            onSelectPhoto={() => {}} 
            hoveredIndex={null} 
        />
      </group>

      <CameraController mode={mode} handData={handData} />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.6} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};
