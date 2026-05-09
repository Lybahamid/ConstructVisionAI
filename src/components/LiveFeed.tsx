import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, AlertCircle, CheckCircle, Shield, Download, RefreshCw, Layers } from 'lucide-react';
import { Detection, Violation } from '../types';
import { detectSafetyViolations } from '../lib/gemini';

interface LiveFeedProps {
  onViolationDetected: (violation: Violation) => void;
}

export default function LiveFeed({ onViolationDetected }: LiveFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [sourceType, setSourceType] = useState<'camera' | 'file' | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [fps, setFps] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.src = "";
        setSourceType('camera');
        setStreamActive(true);
        setDetections([]);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      setSourceType('file');
      setStreamActive(true);
      setDetections([]);
      
      // Auto-play the uploaded video
      videoRef.current.play().catch(e => console.log("Auto-play blocked", e));
    }
  };

  const processFrame = useCallback(async () => {
    if (!videoRef.current || isProcessing || !streamActive) return;
    
    const video = videoRef.current;
    if (sourceType === 'file' && (video.paused || video.ended || video.readyState < 2)) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        // Slightly reduce resolution for faster detection
        const targetWidth = 640;
        const targetHeight = (video.videoHeight / video.videoWidth) * targetWidth;
        
        const detectCanvas = document.createElement('canvas');
        detectCanvas.width = targetWidth;
        detectCanvas.height = targetHeight;
        const dCtx = detectCanvas.getContext('2d');
        if (dCtx) {
          dCtx.drawImage(video, 0, 0, targetWidth, targetHeight);
          const imageData = detectCanvas.toDataURL('image/jpeg', 0.4); 

          const startTime = Date.now();
          const results = await detectSafetyViolations(imageData);
          const endTime = Date.now();
          
          setFps(Math.round(1000 / (endTime - startTime)));
          setDetections(results);

          // Process violations
          results.forEach(det => {
            if (det.label.toLowerCase().includes('violation')) {
              onViolationDetected({
                id: '',
                timestamp: new Date().toISOString(),
                type: det.label,
                confidence: det.confidence,
                bbox: det.bbox,
                thumbnailUrl: imageData,
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("AI Analysis Failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, sourceType, streamActive, onViolationDetected]);

  // Use a dedicated effect for the processing loop
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const loop = () => {
      if (streamActive && !isProcessing) {
        processFrame();
      }
      timeoutId = setTimeout(loop, sourceType === 'camera' ? 2000 : 1000);
    };

    if (streamActive) {
      loop();
    }

    return () => clearTimeout(timeoutId);
  }, [streamActive, sourceType, isProcessing, processFrame]);

  // Draw annotations
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (video.videoWidth > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      detections.forEach(det => {
        const { ymin, xmin, ymax, xmax } = det.bbox;
        const x = (xmin / 1000) * canvas.width;
        const y = (ymin / 1000) * canvas.height;
        const w = ((xmax - xmin) / 1000) * canvas.width;
        const h = ((ymax - ymin) / 1000) * canvas.height;

        const isViolation = det.label.toLowerCase().includes('violation');
        const color = isViolation ? '#ef4444' : '#10b981';

        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(4, canvas.width / 300);
        ctx.strokeRect(x, y, w, h);

        const fontSize = Math.max(16, Math.round(canvas.width / 50));
        ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
        const labelText = `${det.label.toUpperCase()} [${Math.round(det.confidence * 100)}%]`;
        const textWidth = ctx.measureText(labelText).width;
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y - fontSize - 10, textWidth + 12, fontSize + 10);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, x + 6, y - 10);
      });
      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [detections, streamActive]);

  return (
    <div className="relative group overflow-hidden bg-black h-full w-full flex items-center justify-center">
      {/* Central Video Container */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={sourceType === 'camera'}
          controls={sourceType === 'file'}
          className={streamActive ? "max-w-full max-h-full object-contain" : "hidden"}
          onLoadedMetadata={() => setStreamActive(true)}
        />
        
        {/* Annotation Layer - Perfectly overlaid on video using object-fit: contain matching */}
        {streamActive && (
          <canvas
            ref={canvasRef}
            className="absolute z-20 pointer-events-none"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain', // CRITICAL: This mirrors the video's "object-contain" behavior
              top: 0,
              left: 0
            }}
          />
        )}

        {/* HUD Layer - Start Screen */}
        {!streamActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-30">
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-4 text-slate-400 hover:text-white transition-all group/btn"
              >
                <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-700 group-hover/btn:border-orange-500 transition-colors shadow-2xl">
                  <Camera size={28} className="text-orange-500" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">Initialize Live Node</span>
              </button>

              <div className="h-16 w-px bg-slate-700/50 hidden sm:block"></div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-4 text-slate-400 hover:text-white transition-all group/btn text-center"
              >
                <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-700 group-hover/btn:border-orange-500 transition-colors shadow-2xl">
                  <Download size={28} className="text-orange-500 rotate-180" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">Import Site Archive</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="video/*" 
                onChange={handleFileUpload} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Persistent HUD Overlays */}
      <div className="absolute top-4 left-4 flex gap-2 z-40">
        {streamActive && (
          <>
            <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 text-[9px] text-white border border-white/20 uppercase tracking-widest font-mono flex items-center gap-2 shadow-2xl rounded-sm">
              <div className={`w-1.5 h-1.5 rounded-full ${sourceType === 'camera' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
              {sourceType === 'camera' ? 'LINK: LIVE_STREAM' : 'SOURCE: ARCHIVE_VOD'}
            </span>
            {isProcessing && (
              <span className="bg-orange-500/20 text-orange-500 px-2.5 py-1 text-[9px] border border-orange-500/30 uppercase tracking-widest font-mono animate-pulse rounded-sm">
                Analyzing...
              </span>
            )}
            {sourceType === 'file' && (
              <button 
                onClick={() => {
                  setStreamActive(false);
                  setSourceType(null);
                  if (videoRef.current) {
                    videoRef.current.src = "";
                    videoRef.current.srcObject = null;
                  }
                }}
                className="bg-orange-600/90 hover:bg-orange-500 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest shadow-2xl transition-colors rounded-sm"
              >
                Terminate Stream
              </button>
            )}
          </>
        )}
      </div>

      {streamActive && (
        <>
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {/* Technical Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500/50" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500/50" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-500/50" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500/50" />
            
            {/* Scanning Line */}
            {isProcessing && (
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.8)] z-30"
              />
            )}
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2 z-40">
             <div className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold animate-pulse rounded-sm shadow-xl font-mono">REC</div>
             <div className="px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[9px] font-mono italic rounded-sm shadow-xl">
               {new Date().toISOString().replace('T', ' ').split('.')[0]}
             </div>
          </div>

          <div className="absolute top-4 right-4 text-right z-40">
            <div className="font-mono text-[8px] text-white/50 uppercase italic tracking-[0.2em] bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/5">
              PROC: {fps} FPS | AI: GEMINI-V3-L
            </div>
          </div>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none border-[12px] border-black/10 z-30"></div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20 z-10"></div>
        </>
      )}
    </div>
  );
}
