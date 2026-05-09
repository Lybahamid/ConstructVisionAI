import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Clock, MapPin, ChevronRight, HardHat, ShieldAlert } from 'lucide-react';
import { Violation } from '../types';

interface ViolationLogProps {
  violations: Violation[];
}

export default function ViolationLog({ violations }: ViolationLogProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-tight text-slate-700 flex items-center gap-2">
          <ShieldAlert size={14} className="text-orange-500" />
          Violation Log
        </h2>
        <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {violations.length} Active Alerts
        </span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence initial={false}>
          {violations.length === 0 ? (
            <div key="empty" className="h-full flex items-center justify-center p-12 text-center">
              <div className="flex flex-col items-center gap-3 opacity-30">
                <ShieldAlert size={32} className="text-slate-400" />
                <p className="font-mono text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">
                  Scanning Perimeter... <br />Monitoring Pipeline Clear
                </p>
              </div>
            </div>
          ) : (
            [...violations].reverse().map((v, i) => {
              const isRecent = i === 0;
              return (
                <motion.div
                  key={v.id || `v-${violations.length - 1 - i}`}
                  initial={isRecent ? { opacity: 0, x: -20 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group ${v.id.startsWith('NEW') ? 'bg-red-50/40 border-l-2 border-l-red-500' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 group-hover:border-slate-300 transition-colors">
                      {v.thumbnailUrl ? (
                        <img src={v.thumbnailUrl} alt="Violation" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-mono">
                          THUMB
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                          {new Date(v.timestamp).toLocaleTimeString([], { hour12: false })} | {v.id.slice(-4)}
                        </span>
                        {isRecent && <span className="bg-red-500 w-1.5 h-1.5 rounded-full animate-pulse"></span>}
                      </div>
                      
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-1">
                        {v.type.replace('Violation: ', '')}
                      </span>
                      
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 font-semibold group-hover:text-red-500 transition-colors">
                          <HardHat size={11} />
                          {Math.round(v.confidence * 100)}%
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 font-semibold">
                          <MapPin size={11} />
                          Zone 01
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-300">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
         <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Storage Status</span>
            <span className="text-[10px] font-mono text-slate-600 font-bold">14.2 GB / 500 GB</span>
         </div>
         <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full w-[3%] rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
         </div>
      </div>
    </div>
  );
}
