import React, { useEffect, useRef, useState } from 'react';
import { HandData } from '../types';
import { analyzeHand } from '../services/gestureUtils';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

interface HandControllerProps {
  onHandUpdate: (data: HandData) => void;
}

export const HandController: React.FC<HandControllerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let camera: any;
    let hands: any;

    const init = async () => {
      if (!window.Hands) {
        console.warn("MediaPipe Hands script not loaded yet.");
        setTimeout(init, 500);
        return;
      }

      hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          const gesture = analyzeHand(landmarks);
          
          // Calculate generic palm position (average of wrist and middle finger base)
          const wrist = landmarks[0];
          const middleBase = landmarks[9];
          const palmX = 1 - (wrist.x + middleBase.x) / 2; // Flip X for mirror effect
          const palmY = (wrist.y + middleBase.y) / 2;

          onHandUpdate({
            landmarks,
            gesture,
            palmPosition: { x: palmX, y: palmY },
            isPresent: true
          });
        } else {
          onHandUpdate({
            landmarks: [],
            gesture: 'NONE',
            palmPosition: { x: 0.5, y: 0.5 },
            isPresent: false
          });
        }
      });

      if (videoRef.current) {
        // Need to use the Camera utils from MediaPipe to simplify video frame processing
        // or just standard getUserMedia + requestAnimationFrame
        try {
           const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
           videoRef.current.srcObject = stream;
           await videoRef.current.play();
           setPermissionGranted(true);
           setLoading(false);

           // Start processing loop
           const processFrame = async () => {
             if (videoRef.current && hands) {
               await hands.send({ image: videoRef.current });
             }
             requestAnimationFrame(processFrame);
           };
           processFrame();

        } catch (e) {
          console.error("Error accessing camera:", e);
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      if (camera) camera.stop();
      if (videoRef.current && videoRef.current.srcObject) {
         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
         tracks.forEach(track => track.stop());
      }
    };
  }, [onHandUpdate]);

  return (
    <div className="absolute top-4 left-4 z-50 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
       {/* Small preview of camera to verify it works */}
       <video 
         ref={videoRef} 
         className="w-32 h-24 object-cover rounded-lg border-2 border-gold-500 transform scale-x-[-1]" 
         playsInline 
         muted 
       />
       {loading && <p className="text-white text-xs mt-1">Loading AI...</p>}
    </div>
  );
};
