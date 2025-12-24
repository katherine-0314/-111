import React from 'react';
import { AppMode, HandData } from '../types';

interface UIOverlayProps {
  mode: AppMode;
  currentGesture: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  photosCount: number;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ mode, currentGesture, onUpload, photosCount }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
           <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F1D78A] drop-shadow-lg tracking-wider lowercase">
             merry-ecard.online
           </h1>
           <p className="text-white/60 text-sm font-light tracking-widest mt-1">LUMINA NOËL • GESTURE MAGIC</p>
        </div>
        
        <div className="pointer-events-auto">
          <label className="cursor-pointer bg-[#2F5233]/80 hover:bg-[#2F5233] border border-[#D4AF37] text-[#D4AF37] px-4 py-2 rounded-full text-sm font-medium transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-2">
            <span>Add Memories ({photosCount})</span>
            <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" />
          </label>
        </div>
      </header>

      {/* Mode Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className={`transition-all duration-700 ${mode === AppMode.SCATTER ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <p className="text-6xl text-white/10 font-serif tracking-[0.5em] blur-[2px]">SCATTER</p>
        </div>
      </div>

      {/* Footer / Instructions */}
      <div className="flex justify-between items-end">
        <div className="bg-black/30 backdrop-blur-md border-l-2 border-[#D4AF37] p-4 rounded-r-lg max-w-sm">
          <h3 className="text-[#D4AF37] font-semibold mb-2 text-sm uppercase tracking-widest">Controls</h3>
          <ul className="text-white/80 text-xs space-y-2 font-light">
            <li className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentGesture === 'FIST' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-white/20'}`}></span>
              <strong className="text-white">Fist:</strong> Congregate Tree
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentGesture === 'OPEN' ? 'bg-green-500 shadow-[0_0_8px_lime]' : 'bg-white/20'}`}></span>
              <strong className="text-white">Open Hand:</strong> Scatter & Float
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === AppMode.SCATTER && currentGesture !== 'FIST' ? 'bg-blue-500 shadow-[0_0_8px_cyan]' : 'bg-white/20'}`}></span>
              <strong className="text-white">Move Hand:</strong> Rotate View (in Scatter)
            </li>
            <li className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${currentGesture === 'PINCH' ? 'bg-yellow-500 shadow-[0_0_8px_gold]' : 'bg-white/20'}`}></span>
               <strong className="text-white">Pinch:</strong> Zoom (Demo)
            </li>
          </ul>
        </div>

        <div className="text-right">
          <p className="text-[#D4AF37] text-xs uppercase tracking-widest">Current State</p>
          <p className="text-2xl text-white font-serif">{mode}</p>
          <div className="flex justify-end items-center gap-2 mt-2">
             <span className="text-white/50 text-xs">Gesture Detected:</span>
             <span className="bg-white/10 px-2 py-0.5 rounded text-white text-xs font-mono">{currentGesture}</span>
          </div>
        </div>
      </div>
    </div>
  );
};