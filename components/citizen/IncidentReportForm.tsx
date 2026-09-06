'use client';

import React, { useState, useRef } from 'react';
import { X, Camera, MapPin, AlertTriangle, Loader2, CheckCircle2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { incidentService } from '@/services/incidentService';
import { blockedRoadService } from '@/services/blockedRoadService';
import { useLocationContext } from '@/context/LocationContext';
import { LatLng } from '@/types';

interface IncidentReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: LatLng | null;
}

const INCIDENT_TYPES = [
  'Flood',
  'Fire',
  'Road Blockage',
  'Building Damage',
  'Medical Emergency',
  'Other'
];

export function IncidentReportForm({ isOpen, onClose, defaultLocation }: IncidentReportFormProps) {
  const { location } = useLocationContext();
  const actualLocation = defaultLocation || location;
  
  const [step, setStep] = useState(1);
  const [type, setType] = useState(INCIDENT_TYPES[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setType(INCIDENT_TYPES[0]);
    setDescription('');
    setPhotoPreview(null);
    setReportId('');
    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !description) return;
    
    setIsSubmitting(true);
    try {
      const response = await incidentService.submitIncident({
        severity: 'medium', 
        address: 'Current Location', 
        imageUrl: photoPreview, 
        videoUrl: null, 
        reportedBy: 'citizen', 
        reporterName: 'Citizen', 
        assignedTeamId: null, 
        affectsRouteId: null,
        type: type as any,
        description,
        location: actualLocation || { lat: 0, lng: 0 },
      });

      if (type === 'Road Blockage' && actualLocation && actualLocation.lat !== 0 && actualLocation.lng !== 0) {
        try {
          await blockedRoadService.reportBlockedRoad({
            road_name: 'Reported Road Obstruction',
            description,
            latitude: actualLocation.lat,
            longitude: actualLocation.lng,
            blockage_type: 'OTHER',
            severity: 'FULL_CLOSURE',
            disaster_id: 'evt-001',
          });
        } catch (e) {
          console.warn('[IncidentReportForm] blocked road submission notice:', e);
        }
      }

      setReportId(response.id);
      setStep(2);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Report Incident
          </h2>
          {step !== 2 && (
            <button onClick={handleReset} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What is the incident?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INCIDENT_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`p-2 text-sm rounded-lg border text-center transition-colors ${
                        type === t 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300 font-medium' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Confirmation */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Incident Location
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Verified Coordinates</div>
                    <div className="text-xs opacity-70">
                      {actualLocation ? `${actualLocation.lat.toFixed(5)}, ${actualLocation.lng.toFixed(5)}` : 'Location unavailable'}
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm text-slate-900 dark:text-slate-100"
                  placeholder="Provide any helpful details..."
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Photo Evidence (Optional)
                </label>
                
                {!photoPreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center gap-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-slate-400" />
                    <span className="text-sm font-medium">Take Photo or Upload</span>
                    <span className="text-xs text-slate-400">Supports JPG, PNG</span>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={photoPreview} alt="Incident preview" className="w-full h-48 object-cover" />
                    <button 
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 p-2 bg-slate-900/70 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 to-transparent p-3">
                      <span className="text-xs text-white font-medium flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Image attached
                      </span>
                    </div>
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  capture="environment" 
                  className="hidden" 
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !description || !type || !actualLocation}
                  className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-600/20"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Incident Report'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-5 border-4 border-green-50 dark:border-green-900/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Report Submitted</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-[280px]">
                Authorities have been notified about the {type.toLowerCase()} incident.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl w-full mb-8 text-left border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Report ID</span>
                  <span className="text-xs font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{reportId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Location</span>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                    {actualLocation ? `${actualLocation.lat.toFixed(4)}, ${actualLocation.lng.toFixed(4)}` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleReset}
                className="w-full py-3.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Return to Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
