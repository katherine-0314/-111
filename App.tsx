import React, { useState, useRef, useCallback } from 'react';
import { Experience } from './components/Experience';
import { HandController } from './components/HandController';
import { UIOverlay } from './components/UIOverlay';
import { AppMode, HandData } from './types';

// Default Christmas-themed images if user hasn't uploaded
const DEFAULT_PHOTOS = [
  'https://picsum.photos/id/102/300/300', // Raspberry
  'https://picsum.photos/id/106/300/300', // Flower
  'https://picsum.photos/id/235/300/300', // Mountain
  'https://picsum.photos/id/238/300/300', // City
];

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.TREE);
  const [photos, setPhotos] = useState<string[]>(DEFAULT_PHOTOS);
  const [currentGesture, setCurrentGesture] = useState<string>('NONE');
  
  // Use a ref for hand data to avoid re-rendering the Canvas on every frame 
  // passed down to the loop inside Experience
  const handDataRef = useRef<HandData>({
    landmarks: [],
    gesture: 'NONE',
    palmPosition: { x: 0.5, y: 0.5 },
    isPresent: false
  });

  const handleHandUpdate = useCallback((data: HandData) => {
    handDataRef.current = data;
    setCurrentGesture(data.gesture);

    // State Machine logic based on gesture
    // We use a small debounce or state check to prevent flickering, 
    // but for simplicity here we switch directly.
    if (data.gesture === 'FIST' && mode !== AppMode.TREE) {
      setMode(AppMode.TREE);
    } else if (data.gesture === 'OPEN' && mode !== AppMode.SCATTER) {
      setMode(AppMode.SCATTER);
    } else if (data.gesture === 'PINCH' && mode !== AppMode.ZOOM) {
       // Optional: pinch to zoom
       setMode(AppMode.ZOOM);
    }
  }, [mode]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Cast file to any or Blob since Array.from inference is unknown
      const newPhotos = Array.from(e.target.files).map((file: any) => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden">
      <HandController onHandUpdate={handleHandUpdate} />
      
      <div className="absolute inset-0 z-0">
        <Experience 
          mode={mode} 
          setMode={setMode} 
          handData={handDataRef} 
          photos={photos} 
        />
      </div>

      <UIOverlay 
        mode={mode} 
        currentGesture={currentGesture} 
        onUpload={handlePhotoUpload} 
        photosCount={photos.length} 
      />
    </div>
  );
}