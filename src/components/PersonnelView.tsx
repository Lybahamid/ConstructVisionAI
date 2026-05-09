import React from 'react';
import { Users, Shield, Clock, Search, Filter, MoreVertical, CheckCircle, AlertCircle } from 'lucide-react';

const PERSONNEL = [
  { id: 'CX-442', name: 'James Wilson', role: 'Structural Engineer', status: 'compliant', zone: 'Sector A', lastSeen: '02m ago', ppe: ['Helmet', 'Vest', 'Gloves'] },
  { id: 'CX-881', name: 'Sarah Chen', role: 'Site Supervisor', status: 'compliant', zone: 'North Gate', lastSeen: '05m ago', ppe: ['Helmet', 'Vest', 'Glasses'] },
  { id: 'CX-102', name: 'Marcus Miller', role: 'Concrete Specialist', status: 'violation', zone: 'Sector B', lastSeen: 'Now', ppe: ['Vest'], missing: ['Helmet'] },
  { id: 'CX-339', name: 'Elena Rodriguez', role: 'Safety Inspector', status: 'compliant', zone: 'South Block', lastSeen: '12m ago', ppe: ['Helmet', 'Vest', 'Gloves', 'Boots'] },
  { id: 'CX-550', name: 'David Kim', role: 'Machine Operator', status: 'compliant', zone: 'Excavation 3', lastSeen: '18m ago', ppe: ['Helmet', 'Vest'] },
];

export default function PersonnelView() {
  return (
    <div className="flex flex-col gap-6 h-full p-2 overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search operator ID or name..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operator</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role / Designation</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Zone</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">PPE Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telemetry</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERSONNEL.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 border border-slate-200">
                        {person.id.split('-')[1]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{person.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">{person.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 font-medium">{person.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter ${person.status === 'violation' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                      {person.zone}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {person.ppe.map(item => (
                        <span key={item} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded uppercase">
                          {item}
                        </span>
                      ))}
                      {person.missing?.map(item => (
                        <span key={item} className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded uppercase animate-pulse">
                          MISSING: {item}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Clock size={12} className="text-slate-400" />
                       <span className="text-[10px] font-mono text-slate-500">{person.lastSeen}</span>
                       {person.status === 'compliant' ? (
                          <CheckCircle size={14} className="text-emerald-500" />
                       ) : (
                          <AlertCircle size={14} className="text-red-500" />
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
