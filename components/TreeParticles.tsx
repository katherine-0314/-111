import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PARTICLE_COUNT, TREE_HEIGHT, TREE_RADIUS, COLORS } from '../constants';
import { AppMode } from '../types';

interface TreeParticlesProps {
  mode: AppMode;
}

export const TreeParticles: React.FC<TreeParticlesProps> = ({ mode }) => {
  // We use two instanced meshes: one for spheres (green/red), one for cubes (gold)
  const sphereMeshRef = useRef<THREE.InstancedMesh>(null);
  const cubeMeshRef = useRef<THREE.InstancedMesh>(null);

  // Generate data
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Tree Formation (Spiral Cone)
      const yNorm = i / PARTICLE_COUNT; // 0 to 1
      const y = (yNorm - 0.5) * TREE_HEIGHT;
      const radius = (1 - yNorm) * TREE_RADIUS;
      const angle = i * 0.15 + (yNorm * Math.PI * 10); // Spiral
      
      const treeX = Math.cos(angle) * radius;
      const treeZ = Math.sin(angle) * radius;

      // Scatter Formation (Random Sphere)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = Math.cbrt(Math.random()) * 12; // Radius 12 scatter
      const scatterX = r * Math.sin(phi) * Math.cos(theta);
      const scatterY = r * Math.sin(phi) * Math.sin(theta);
      const scatterZ = r * Math.cos(phi);

      const type = Math.random() > 0.7 ? 'CUBE' : 'SPHERE';
      const color = type === 'CUBE' 
        ? COLORS.GOLD_METALLIC 
        : (Math.random() > 0.6 ? COLORS.RED_CHRISTMAS : COLORS.GREEN_MATTE);

      temp.push({
        id: i,
        treePos: new THREE.Vector3(treeX, y, treeZ),
        scatterPos: new THREE.Vector3(scatterX, scatterY, scatterZ),
        type,
        color: new THREE.Color(color),
        scale: Math.random() * 0.3 + 0.1
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize colors
  useEffect(() => {
    if (!sphereMeshRef.current || !cubeMeshRef.current) return;
    
    let sphereIdx = 0;
    let cubeIdx = 0;

    particles.forEach((p) => {
      if (p.type === 'SPHERE' && sphereMeshRef.current) {
        sphereMeshRef.current.setColorAt(sphereIdx++, p.color);
      } else if (p.type === 'CUBE' && cubeMeshRef.current) {
        cubeMeshRef.current.setColorAt(cubeIdx++, p.color);
      }
    });

    sphereMeshRef.current.instanceColor!.needsUpdate = true;
    cubeMeshRef.current.instanceColor!.needsUpdate = true;
  }, [particles]);

  useFrame((state) => {
    if (!sphereMeshRef.current || !cubeMeshRef.current) return;

    const time = state.clock.getElapsedTime();
    const isScatter = mode === AppMode.SCATTER || mode === AppMode.ZOOM;
    
    // Dampening factor for smooth transition
    const lerpFactor = 0.05;

    let sphereIdx = 0;
    let cubeIdx = 0;

    particles.forEach((p, i) => {
      const target = isScatter ? p.scatterPos : p.treePos;
      
      // We calculate current position by reading matrix, but for simplicity/performance in this demo
      // we will compute the interpolated position based on a global "mix" factor isn't enough because particles move differently.
      // Instead, we maintain a "current" position in the loop? No, that's slow.
      // Better approach: Use a persistent "currentPosition" stored in a mutable array or ref for physics.
      // For this simplified logic, we will do a pseudo-lerp using sine waves for "floating" and direct calculation.
      
      // Let's implement actual lerp using a simpler method: 
      // We can't easily read back from the matrix every frame without perf hit.
      // So we will just oscillate for now or use a "transition" state variable if we had one.
      // However, to make it robust:
      
      // Hack: Store current pos in the particle object itself (mutable)
      // NOTE: Modifying the `particles` array directly in useFrame is technically side-effect heavy but performant for visualizers.
      
      const current = (p as any).currentPos || p.treePos.clone();
      
      // Add some noise/float movement
      const floatY = Math.sin(time + p.id) * 0.02;
      
      current.lerp(target, lerpFactor);
      current.y += floatY;

      (p as any).currentPos = current;

      dummy.position.copy(current);
      dummy.scale.setScalar(p.scale);
      
      // Rotation
      dummy.rotation.x = time * 0.5 + p.id;
      dummy.rotation.y = time * 0.3 + p.id;
      
      dummy.updateMatrix();

      if (p.type === 'SPHERE') {
        sphereMeshRef.current!.setMatrixAt(sphereIdx++, dummy.matrix);
      } else {
        cubeMeshRef.current!.setMatrixAt(cubeIdx++, dummy.matrix);
      }
    });

    sphereMeshRef.current.instanceMatrix.needsUpdate = true;
    cubeMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={sphereMeshRef} args={[undefined, undefined, PARTICLE_COUNT]} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial roughness={0.4} metalness={0.6} />
      </instancedMesh>
      
      <instancedMesh ref={cubeMeshRef} args={[undefined, undefined, PARTICLE_COUNT]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.2} metalness={0.9} />
      </instancedMesh>
    </>
  );
};
