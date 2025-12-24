import { HandData } from '../types';

// Helper to calculate distance between two 3D points
const dist = (p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }) => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2)
  );
};

export const analyzeHand = (landmarks: any[]): HandData['gesture'] => {
  if (!landmarks || landmarks.length < 21) return 'NONE';

  // Landmarks mapping (MediaPipe Hands):
  // 0: Wrist
  // 4: Thumb tip
  // 8: Index tip
  // 12: Middle tip
  // 16: Ring tip
  // 20: Pinky tip
  
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const wrist = landmarks[0];

  // Check for Pinch (Thumb and Index very close)
  const pinchDist = dist(thumbTip, indexTip);
  if (pinchDist < 0.05) { // Threshold might need tuning based on coordinate system
    return 'PINCH';
  }

  // Check for Fist (Tips close to wrist or base of fingers)
  // Simplified: Check if tips are below the PIP joints (knuckles) in Y axis (assuming hand is upright)
  // Robust method: Check distance of finger tips to wrist.
  const tips = [indexTip, middleTip, ringTip, pinkyTip];
  let foldedFingers = 0;
  
  // A simple heuristic for "folded": distance from tip to wrist is short
  // Note: MediaPipe coords are normalized.
  tips.forEach(tip => {
    if (dist(tip, wrist) < 0.25) foldedFingers++; // Threshold for folded
  });

  if (foldedFingers >= 3) {
    return 'FIST';
  }

  // Check for Open Hand
  let extendedFingers = 0;
  tips.forEach(tip => {
    if (dist(tip, wrist) > 0.35) extendedFingers++;
  });

  if (extendedFingers >= 3) {
    return 'OPEN';
  }

  return 'NONE';
};
