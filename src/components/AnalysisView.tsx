import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, AlertCircle, Calendar } from 'lucide-react';

export default function AnalysisView({ violations }: { violations: any[] }) {
  const trendData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: days[d.getDay()],
        date: d.toISOString().split('T')[0],
        violations: 0,
        compliance: 90 + Math.random() * 8
      };
    });

    violations.forEach(v => {
      const vDate = v.timestamp.split('T')[0];
      const dayData = last7Days.find(d => d.date === vDate);
      if (dayData) {
        dayData.violations += 1;
        dayData.compliance = Math.max(70, dayData.compliance - 2);
      }
    });

    return last7Days;
  }, [violations]);

  const riskStats = useMemo(() => {
    const counts: Record<string, number> = {};
    violations.forEach(v => {
      counts[v.type] = (counts[v.type] || 0) + 1;
    });
    return counts;
  }, [violations]);

  return (
    <div className="flex flex-col gap-6 p-1 sm:p-4 overflow-y-auto h-full no-scrollbar">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-l-emerald-500">
          <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mb-1">Live Compliance</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900">
            {violations.length > 0 ? (Math.max(65, 98 - violations.length * 2)).toFixed(1) : '100'}%
          </div>
          <div className="text-[9px] text-emerald-500 flex items-center gap-1 mt-1 font-bold uppercase tracking-tighter">
            <TrendingUp size={10} /> Optimal State
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-l-red-500">
          <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mb-1">Logged Incidents</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900">{violations.length.toString().padStart(2, '0')}</div>
          <div className="text-[9px] text-red-500 mt-1 uppercase font-bold tracking-tighter">Active Alerts</div>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-l-slate-400">
          <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mb-1">Operational Hours</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900">164h</div>
          <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Node Uptime</div>
        </div>
        <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-l-sky-500">
          <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mb-1">Sensor Density</div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900">99.9%</div>
          <div className="text-[9px] text-sky-500 font-bold uppercase tracking-tighter mt-1">Optical Stream</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Calendar size={14} /> Safety Trend Analytics (7D)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                <Line type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <AlertCircle size={14} /> Risk Heatmap: Violation Types
          </h3>
          <div className="space-y-4">
             {Object.keys(riskStats).length > 0 ? (
               Object.entries(riskStats).map(([label, count]) => (
                 <RiskBar 
                   key={label} 
                   label={label.replace('Violation: ', '')} 
                   value={count} 
                   color={label.toLowerCase().includes('violation') ? "bg-red-500" : "bg-emerald-500"} 
                   isInverse={label.toLowerCase().includes('violation')}
                   mode="count"
                 />
               ))
             ) : (
               <div className="text-[10px] text-slate-400 italic">No violation data available for heatmap analysis.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskBar({ label, value, color, isInverse = false, mode = "percent" }: any) {
  const displayValue = mode === "percent" ? (isInverse ? 100 - value : value) : Math.min(100, value * 10);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
        <span className="text-slate-600">{label}</span>
        <span className={isInverse && value > 0 ? 'text-red-600' : 'text-slate-900'}>
          {value}{mode === "percent" ? '%' : ''} {isInverse ? (mode === "percent" ? 'Violation' : 'Alerts') : 'Compliance'}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  );
}
