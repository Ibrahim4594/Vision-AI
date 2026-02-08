import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { AppMode } from '../types';

interface CameraProps {
  onReady: () => void;
  onError: (error: string) => void;
  currentMode: AppMode;
}

export interface CameraHandle {
  capture: () => string | null;
  setZoom: (value: number) => void;
}

const Camera = forwardRef<CameraHandle, CameraProps>(({ onReady, onError, currentMode }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Zoom State
  const [zoom, setZoom] = useState(1);
  const [zoomCap, setZoomCap] = useState<{min: number, max: number} | null>(null);

  useImperativeHandle(ref, () => ({
    capture: () => {
      if (!videoRef.current || !canvasRef.current) return null;
      
      const video = videoRef.current;
      if (video.readyState < 2 || video.videoWidth === 0) return null;
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return null;

      const scale = 1024 / video.videoWidth;
      canvas.width = 1024;
      canvas.height = video.videoHeight * scale;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.9);
    },
    setZoom: (value: number) => handleZoom(value)
  }));

  const handleZoom = (value: number) => {
    if (!videoRef.current) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream?.getVideoTracks()[0];
    
    if (track && zoomCap) {
        // Clamp value
        const newZoom = Math.min(Math.max(value, zoomCap.min), zoomCap.max);
        setZoom(newZoom);
        
        try {
            track.applyConstraints({
                advanced: [{ zoom: newZoom }]
            } as any).catch(e => console.log("Zoom not supported directly", e));
        } catch(e) {
            console.warn("Zoom error", e);
        }
    }
  };

  useEffect(() => {
    let mounted = true;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
          },
          audio: false
        });
        
        if (mounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Check for Zoom capability
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities() as any;
          
          if (capabilities.zoom) {
              setZoomCap({
                  min: capabilities.zoom.min,
                  max: capabilities.zoom.max
              });
              setZoom(capabilities.zoom.min);
          }
        }
      } catch (err) {
        if (mounted) onError("Could not access camera.");
      }
    };
    startCamera();
    return () => {
      mounted = false;
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [onError]);

  const handleCanPlay = () => {
    videoRef.current?.play().then(onReady).catch(onReady);
  };

  // Render Overlays based on Mode
  const renderOverlay = () => {
    switch (currentMode) {
      case AppMode.SCENE:
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">
            <div className="w-[80%] h-[60%] border border-blue-400/30 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-400 rounded-full opacity-50" />
          </div>
        );
      case AppMode.READ:
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[90%] h-[20%] border-x-2 border-green-400/60 bg-green-500/5 relative">
               <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500/50" />
               <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500/50" />
            </div>
            <p className="absolute top-[35%] text-xs font-mono text-green-400 bg-black/50 px-2 rounded">Align Text Here</p>
          </div>
        );
      case AppMode.OBJECT:
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-dashed border-purple-400/50 rounded-full flex items-center justify-center bg-purple-500/5">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
        );
      case AppMode.NAV:
        return (
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-red-900/40 via-transparent to-transparent" />
             <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-red-400/50 font-mono text-xs">PATH SCAN</div>
          </div>
        );
      case AppMode.COLOR:
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 border-2 border-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-white/10" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden vignette">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onCanPlay={handleCanPlay}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {renderOverlay()}

      {/* Zoom Slider - Only if supported */}
      {zoomCap && (
         <div className="absolute right-4 top-1/2 -translate-y-1/2 h-48 w-8 flex flex-col items-center z-40 bg-slate-900/40 backdrop-blur-sm rounded-full py-4 border border-white/10">
            <span className="text-[10px] font-bold mb-2">{(zoom).toFixed(1)}x</span>
            <input 
              type="range"
              min={zoomCap.min}
              max={zoomCap.max}
              step={0.1}
              value={zoom}
              onChange={(e) => handleZoom(parseFloat(e.target.value))}
              className="w-1 h-32 appearance-none bg-white/20 rounded-full outline-none slider-vertical"
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              aria-label="Zoom Camera"
            />
            <svg className="w-4 h-4 mt-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
         </div>
      )}
    </div>
  );
});

Camera.displayName = "Camera";

export default Camera;