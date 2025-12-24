import { Vector3 } from 'three';
import { ThreeElements } from '@react-three/fiber';

export enum AppMode {
  TREE = 'TREE',       // Congregated Cone
  SCATTER = 'SCATTER', // Floating randomly
  ZOOM = 'ZOOM'        // Focused on a specific photo
}

export interface HandData {
  landmarks: { x: number; y: number; z: number }[];
  gesture: 'FIST' | 'OPEN' | 'PINCH' | 'NONE';
  palmPosition: { x: number; y: number }; // Normalized 0-1
  isPresent: boolean;
}

export interface ParticleData {
  id: number;
  treePos: Vector3;
  scatterPos: Vector3;
  color: string;
  type: 'SPHERE' | 'CUBE' | 'CANDY';
}

export interface PhotoData {
  id: string;
  url: string;
  treePos: Vector3;
  scatterPos: Vector3;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}