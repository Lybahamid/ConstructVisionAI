import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  FileText, 
  Settings, 
  Menu,
  Download,
  LayoutDashboard,
  Wifi,
  BarChart2,
  UserCheck
} from 'lucide-react';
import LiveFeed from './LiveFeed';
import ViolationLog from './ViolationLog';
import AnalysisView from './AnalysisView';
import PersonnelView from './PersonnelView';
import { Violation, SiteStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  activeSite: string;
}

type Tab = 'monitor' | 'analysis' | 'personnel' | 'log';

export default function Dashboard({ activeSite }: DashboardProps) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('monitor');

  // Load initial violations (Disabled to ensure dashboard clears on refresh)
  useEffect(() => {
    setLoading(false);
  }, [activeSite]);

  const handleViolationDetected = useCallback(async (violation: Violation) => {
    // Use functional state to avoid dependency on 'violations' array
    setViolations(prev => {
      const last = prev[prev.length - 1];
      if (last && 
          last.type === violation.type && 
          (Date.now() - new Date(last.timestamp).getTime()) < 5000) {
        return prev;
      }

      // Async fetch to log it
      fetch('/api/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(violation)
      }).catch(e => console.error("Failed to log violation", e));

      return [...prev, { ...violation, id: `NEW-${Date.now()}` }];
    });
  }, []);

  const handleExport = () => {
    window.open('/api/export', '_blank');
  };

  const stats = useMemo(() => {
    const counts = violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: violations.length,
      topViolation: Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'NONE',
      complianceScore: violations.length > 0 ? Math.max(65, 98 - violations.length * 2) : 100,
      byType: Object.entries(counts).map(([name, value]) => ({ name, value }))
    };
  }, [violations]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-700 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center shrink-0">
              <ShieldCheck className="text-white" size={18} />
            </div>
            <div className="hidden xs:block">
              <h1 className="text-lg font-bold tracking-tight uppercase leading-none truncate max-w-[120px] sm:max-w-none">
                ConstructVision
              </h1>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400 mt-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="truncate">Active</span>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center gap-4 sm:gap-6 h-full pt-1 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('monitor')}
              className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest h-full flex items-center px-1 border-b-2 transition-all shrink-0 ${activeTab === 'monitor' ? 'border-orange-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Monitor
            </button>
            <button 
              onClick={() => setActiveTab('analysis')}
              className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest h-full flex items-center px-1 border-b-2 transition-all shrink-0 ${activeTab === 'analysis' ? 'border-orange-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Analysis
            </button>
            <button 
              onClick={() => setActiveTab('personnel')}
              className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest h-full flex items-center px-1 border-b-2 transition-all shrink-0 ${activeTab === 'personnel' ? 'border-orange-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Personnel
            </button>
            <button 
              onClick={() => setActiveTab('log')}
              className={`lg:hidden text-[10px] sm:text-[11px] font-bold uppercase tracking-widest h-full flex items-center px-1 border-b-2 transition-all shrink-0 ${activeTab === 'log' ? 'border-orange-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Log
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-4 text-right border-r border-slate-700 pr-6">
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-bold">Node Identity</div>
              <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{activeSite.replace(/-/g, ' ')}</div>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        <div className="flex-[3] flex flex-col gap-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'monitor' && (
              <motion.div 
                key="monitor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col gap-4 overflow-hidden"
              >
                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
                  <StatCard 
                    label="Compliance Rate" 
                    value={`${stats.complianceScore}%`} 
                    icon={<Activity size={16} className="text-emerald-500" />} 
                    sub="Site Protocol Guard" 
                    accent="emerald"
                  />
                  <StatCard 
                    label="Personnel Count" 
                    value="12" 
                    icon={<Users size={16} className="text-slate-400" />} 
                    sub="Active Site Proxy" 
                  />
                  <StatCard 
                    label="Safety Alerts" 
                    value={stats.total.toString()} 
                    icon={<AlertTriangle size={16} className={stats.total > 0 ? "text-red-500" : "text-slate-400"} />} 
                    sub={stats.topViolation === 'NONE' ? 'No Active Issues' : stats.topViolation} 
                    accent={stats.total > 0 ? "red" : ""}
                  />
                </div>

                {/* Live Feed Container */}
                <div className="relative flex-1 bg-black rounded-lg border border-slate-300 shadow-sm overflow-hidden min-h-0">
                   <LiveFeed onViolationDetected={handleViolationDetected} />
                </div>

                {/* Trend Chart */}
                <div className="h-[250px] bg-white border border-slate-200 rounded-lg p-5 shadow-sm shrink-0">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-2">
                        <LayoutDashboard size={12} />
                        Trend Distribution Analysis
                      </h3>
                   </div>
                   <div className="w-full h-full pb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.byType}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#64748b' }} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#64748b' }} 
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ 
                              fontFamily: 'var(--font-mono)', 
                              fontSize: '9px', 
                              backgroundColor: '#0f172a', 
                              color: '#f8fafc', 
                              border: 'none',
                              borderRadius: '4px',
                              padding: '8px'
                            }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {stats.byType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name.includes('Violation') ? '#ef4444' : '#0f172a'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 overflow-hidden"
              >
                <AnalysisView violations={violations} />
              </motion.div>
            )}

            {activeTab === 'personnel' && (
              <motion.div 
                key="personnel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 overflow-hidden"
              >
                <PersonnelView />
              </motion.div>
            )}

            {activeTab === 'log' && (
              <motion.div 
                key="log"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 overflow-hidden bg-white rounded-lg border border-slate-300"
              >
                <ViolationLog violations={violations} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Violation Stream */}
        <aside className="hidden lg:flex flex-1 flex-col bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
          <ViolationLog violations={violations} />
        </aside>
      </main>

      <footer className="h-8 bg-slate-900 text-[10px] px-6 text-slate-500 flex items-center justify-between shrink-0 font-mono">
        <div className="flex gap-6 uppercase tracking-wider">
           <span>CPU: Intel i9-13900K</span>
           <span className="hidden sm:inline">OS: Ubuntu 22.04 LTS</span>
           <span className="hidden md:inline text-emerald-500/80 italic">Secure Tunnel: Active</span>
        </div>
        <div className="uppercase tracking-widest opacity-60">
           Conf: 0.65 | Model: cv_gemini_v8.pt
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon, sub, accent = "" }: any) {
  const accentColors: Record<string, string> = {
    emerald: "border-l-4 border-l-emerald-500",
    red: "border-l-4 border-l-red-500",
  };

  return (
    <div className={`bg-white border border-slate-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${accentColors[accent] || ""}`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</span>
        <div className="opacity-60">{icon}</div>
      </div>
      <div className="flex flex-col">
        <span className={`text-2xl font-mono font-bold ${accent === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{value}</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">{sub}</span>
      </div>
    </div>
  );
}
