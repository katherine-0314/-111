import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import { PhotoData, AppMode } from '../types';
import { TREE_HEIGHT, TREE_RADIUS } from '../constants';

interface PhotoCloudProps {
  photos: string[];
  mode: AppMode;
  onSelectPhoto: (index: number) => void;
  hoveredIndex: number | null;
}

export const PhotoCloud: React.FC<PhotoCloudProps> = ({ photos, mode, onSelectPhoto, hoveredIndex }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate positions for photos
  const photoItems = useMemo(() => {
    return photos.map((url, i) => {
      // Tree Pos (Distributed spirally but further out)
      const yNorm = (i + 1) / (photos.length + 1);
      const y = (yNorm - 0.5) * TREE_HEIGHT * 0.8;
      const radius = (1 - yNorm) * TREE_RADIUS + 1.5; // Slightly outside the ornaments
      const angle = i * (Math.PI * 2 / 1.618); // Golden ratio spiral
      
      const treePos = new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );

      // Scatter Pos
      const scatterPos = new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 + 5 // Mainly in front
      );

      return {
        id: `photo-${i}`,
        url,
        treePos,
        scatterPos,
        currentPos: treePos.clone(),
        rotation: new THREE.Euler(0, -angle, 0)
      };
    });
  }, [photos]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const isScatter = mode === AppMode.SCATTER || mode === AppMode.ZOOM;

    photoItems.forEach((item, i) => {
      const child = groupRef.current!.children[i];
      if (!child) return;

      let targetPos = isScatter ? item.scatterPos : item.treePos;
      
      // If ZOOM mode and this is the active one (logic handled mostly by camera, but we can bring it forward)
      // For simplicity, we keep items in place during zoom, camera moves to them.
      
      // Smooth movement
      item.currentPos.lerp(targetPos, 0.05);
      
      // Floating effect
      child.position.copy(item.currentPos);
      child.position.y += Math.sin(state.clock.elapsedTime + i) * 0.005;

      // Rotate to face center in tree mode, face camera in scatter
      if (isScatter) {
         child.lookAt(state.camera.position);
      } else {
         // Face outward from tree center
         child.lookAt(new THREE.Vector3(0, item.currentPos.y, 0));
         child.rotation.y += Math.PI; // Flip to face out
      }
      
      // Scale up if hovered (simulating selection possibility)
      const targetScale = (i === hoveredIndex) ? 1.5 : 1;
      child.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    });
  });

  return (
    <group ref={groupRef}>
      {photoItems.map((item, i) => (
        <group key={item.id} position={item.treePos}>
          <Image 
            url={item.url} 
            transparent 
            scale={[2, 2, 1]} // Aspect ratio handled by Image component usually, defaulting to square here
            side={THREE.DoubleSide}
          />
          {/* Border Glow */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[2.1, 2.1]} />
            <meshBasicMaterial color="#D4AF37" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
