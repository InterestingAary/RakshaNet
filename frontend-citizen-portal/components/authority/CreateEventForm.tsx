'use client';

import React, { useState } from 'react';
import { DisasterEvent } from '@/types/disaster';
import { X, AlertTriangle, Map, Calendar, Info } from 'lucide-react';

interface CreateEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Partial<DisasterEvent>) => void;
}

export default function CreateEventForm({ isOpen, onClose, onSubmit }: CreateEventFormProps) {
  const [formData, setFormData] = useState<Partial<DisasterEvent>>({
    name: '',
    type: 'flood',
    severity: 'high',
    status: 'monitoring',
    description: '',
    instructions: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Declare Emergency Event
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Event Name</label>
              <input
                required
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Cyclone Amphan"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Disaster Type</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="flood">Flood</option>
                <option value="cyclone">Cyclone</option>
                <option value="earthquake">Earthquake</option>
                <option value="fire">Fire</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Severity Level</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Initial Status</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="active">Active (Immediate Response)</option>
                <option value="monitoring">Monitoring (Warning)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              required
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Detailed description of the emergency..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Public Instructions (broadcast to citizens)</label>
            <textarea
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="e.g. Evacuate immediately to higher ground..."
              value={formData.instructions}
              onChange={e => setFormData({ ...formData, instructions: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            >
              Declare Emergency
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
