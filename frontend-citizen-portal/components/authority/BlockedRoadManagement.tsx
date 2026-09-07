'use client';

import React, { useState } from 'react';
import { BlockedRoad, BlockedRoadAuditLog } from '@/types/blockedRoad';
import { AlertTriangle, MapPin, CheckCircle2, XCircle, Clock, FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { blockedRoadService } from '@/services/blockedRoadService';

interface BlockedRoadManagementProps {
  blockedRoads: BlockedRoad[];
  onVerify: (id: string, notes?: string) => Promise<void>;
  onClear: (id: string, notes?: string) => Promise<void>;
}

export default function BlockedRoadManagement({ blockedRoads, onVerify, onClear }: BlockedRoadManagementProps) {
  const [filter, setFilter] = useState<'all' | 'reported' | 'verified' | 'cleared'>('all');
  const [expandedLogsRoadId, setExpandedLogsRoadId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<Record<string, BlockedRoadAuditLog[]>>({});
  const [loadingLogs, setLoadingLogs] = useState<Record<string, boolean>>({});

  const toggleAuditLogs = async (roadId: string) => {
    if (expandedLogsRoadId === roadId) {
      setExpandedLogsRoadId(null);
      return;
    }
    setExpandedLogsRoadId(roadId);
    if (!auditLogs[roadId]) {
      setLoadingLogs(prev => ({ ...prev, [roadId]: true }));
      try {
        const logs = await blockedRoadService.getAuditLogs(roadId);
        setAuditLogs(prev => ({ ...prev, [roadId]: logs }));
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoadingLogs(prev => ({ ...prev, [roadId]: false }));
      }
    }
  };

  const filteredRoads = blockedRoads.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'reported') return r.status === 'REPORTED';
    if (filter === 'verified') return r.status === 'VERIFIED';
    if (filter === 'cleared') return r.status === 'CLEARED' || r.status === 'REJECTED';
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'IMPASSABLE': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'FULL_CLOSURE': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'PARTIAL': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'text-indigo-400 bg-indigo-400/10';
      case 'CLEARED': return 'text-emerald-400 bg-emerald-400/10';
      case 'REJECTED': return 'text-slate-400 bg-slate-400/10';
      case 'REPORTED': default: return 'text-amber-400 bg-amber-400/10';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filter === 'all' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('reported')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filter === 'reported' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
        >
          Reported
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filter === 'verified' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
        >
          Verified
        </button>
        <button
          onClick={() => setFilter('cleared')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filter === 'cleared' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
        >
          Cleared
        </button>
      </div>

      <div className="grid gap-3">
        {filteredRoads.length === 0 ? (
          <div className="text-center p-8 text-slate-500 bg-slate-900 rounded-lg border border-slate-800">
            No blocked roads match the current filter.
          </div>
        ) : (
          filteredRoads.map(road => (
            <div key={road.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-3 hover:border-slate-700 transition-colors">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-lg ${getSeverityColor(road.severity)}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white truncate max-w-[200px] md:max-w-[300px]">{road.road_name}</span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${getSeverityColor(road.severity)}`}>
                        {road.severity.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700`}>
                        {road.blockage_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-1">{road.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {format(new Date(road.created_at), 'HH:mm')}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {road.latitude.toFixed(4)}, {road.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 flex-wrap">
                  <div className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider whitespace-nowrap ${getStatusColor(road.status)}`}>
                    {road.status}
                  </div>
                  
                  {road.status === 'REPORTED' && (
                    <button
                      onClick={() => onVerify(road.id, 'Verified via Authority Dashboard')}
                      className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded border border-indigo-500/30 transition-colors flex gap-1 items-center text-xs font-medium"
                      title="Verify"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Verify
                    </button>
                  )}

                  {road.status === 'VERIFIED' && (
                    <button
                      onClick={() => onClear(road.id, 'Cleared via Authority Dashboard')}
                      className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded border border-emerald-500/30 transition-colors flex gap-1 items-center text-xs font-medium"
                      title="Clear"
                    >
                      <XCircle className="w-4 h-4" /> Clear
                    </button>
                  )}

                  <button
                    onClick={() => toggleAuditLogs(road.id)}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded border border-slate-700 transition-colors flex gap-1 items-center text-xs font-medium"
                    title="Audit Trail"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Logs</span>
                    {expandedLogsRoadId === road.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Expandable Audit Log Panel */}
              {expandedLogsRoadId === road.id && (
                <div className="mt-2 pt-3 border-t border-slate-800 bg-slate-950/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      Lifecycle Audit Trail
                    </span>
                    {loadingLogs[road.id] && (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Fetching logs...</span>
                      </div>
                    )}
                  </div>

                  {auditLogs[road.id] && auditLogs[road.id].length > 0 ? (
                    <div className="space-y-2">
                      {auditLogs[road.id].map(log => (
                        <div key={log.id} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900 border border-slate-800 p-2.5 rounded">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.action === 'REPORTED' ? 'bg-amber-900/60 text-amber-300 border border-amber-700' :
                            log.action === 'VERIFIED' ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700' :
                            log.action === 'CLEARED' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {log.action}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-white">
                                {log.previous_status ? `${log.previous_status} → ` : ''}{log.new_status}
                              </span>
                              <span className="text-slate-500 text-[10px]">
                                {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-slate-400 mt-1 text-[11px]">{log.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !loadingLogs[road.id] && (
                    <p className="text-xs text-slate-500 italic">No audit records logged yet.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
