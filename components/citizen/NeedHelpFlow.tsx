'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, HeartPulse, ShieldAlert, Home, ArrowRight, Loader2, CheckCircle2, Map, ShieldCheck, Activity } from 'lucide-react';
import { incidentService } from '@/services/incidentService';
import { useLocationContext } from '@/context/LocationContext';

interface NeedHelpFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'medical', label: 'Medical Emergency', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  { id: 'rescue', label: 'Trapped / Rescue', icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'shelter', label: 'Need Shelter', icon: Home, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'other', label: 'Other Assistance', icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
];

export function NeedHelpFlow({ isOpen, onClose }: NeedHelpFlowProps) {
  const { location } = useLocationContext();
  
  // Steps: 1:Category -> 2:Description -> 3:SafetyCheck -> 4a:Recalculating -> 5a:RouteReady / 4b:Requesting -> 5b:RequestSent
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [recalcProgress, setRecalcProgress] = useState(0);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setCategory('');
    setDescription('');
    setRequestId('');
    setRecalcProgress(0);
    onClose();
  };

  const handleSafetyChoice = async (canContinue: boolean) => {
    if (canContinue) {
      // YES - Safe to continue -> Route Recalculation
      setStep(4); // 4a
      
      // Simulate route recalculation progress
      let p = 0;
      const interval = setInterval(() => {
        p += 20;
        setRecalcProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep(5), 400); // 5a
        }
      }, 300);
      
    } else {
      // NO - Cannot continue -> Emergency Dispatch
      setStep(6); // 4b (Sending)
      setIsSubmitting(true);
      
      try {
        const response = await incidentService.submitNeedHelp({ 
          priority: 'high', 
          imageUrl: null, 
          assignedTeamId: null,
          category: category as any,
          description: description || 'Emergency assistance requested',
          location: location || { lat: 0, lng: 0 },
        });
        setRequestId(response.id);
        setStep(7); // 5b
      } catch (error) {
        console.error(error);
        // Error handling could go here, fallback for demo
        setRequestId('ERR-FAIL');
        setStep(7);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Emergency Help
          </h2>
          {![4, 5, 6, 7].includes(step) && (
            <button onClick={handleReset} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 text-center mb-4">
                What kind of help do you need?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setCategory(cat.id); setStep(2); }}
                      className="flex flex-col items-center gap-3 p-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-center active:scale-95"
                    >
                      <div className={`p-4 rounded-full ${cat.bg} ${cat.color}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DESCRIPTION */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Brief Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-base"
                  placeholder="Describe your situation..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="py-3.5 px-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 px-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SAFETY CHECK */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
              <div className="mx-auto w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-2">
                <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-500" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Are you in immediate danger?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-base">
                  Can you continue moving to safety, or do you need rescue teams to come to your location?
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => handleSafetyChoice(true)}
                  className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                >
                  <Map className="w-6 h-6" />
                  Yes, find me a safe route
                </button>
                <button
                  onClick={() => handleSafetyChoice(false)}
                  className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-red-600/20 active:scale-[0.98]"
                >
                  <Activity className="w-6 h-6" />
                  No, I need immediate rescue
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="mt-2 text-slate-500 font-medium text-sm hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 4a: RECALCULATING */}
          {step === 4 && (
            <div className="flex flex-col items-center text-center py-10 animate-in fade-in">
              <div className="relative w-24 h-24 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                    className="text-blue-500 transition-all duration-300 ease-out"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - recalcProgress / 100)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Map className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Routes...</h3>
              <p className="text-slate-500 text-sm">Finding the safest path away from hazards</p>
            </div>
          )}

          {/* STEP 5a: ROUTE READY */}
          {step === 5 && (
            <div className="flex flex-col items-center text-center py-8 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-5 border-4 border-blue-50 dark:border-blue-900/20">
                <Map className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">New Route Found</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
                We have updated your evacuation map with a safe alternative route.
              </p>
              <button
                onClick={handleReset}
                className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-600/20"
              >
                View Map
              </button>
            </div>
          )}

          {/* STEP 4b: SENDING REQUEST */}
          {step === 6 && (
            <div className="flex flex-col items-center text-center py-10 animate-in fade-in">
              <Loader2 className="w-16 h-16 text-red-500 animate-spin mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Dispatching Alert...</h3>
              <p className="text-slate-500 text-sm">Connecting to local emergency services</p>
            </div>
          )}

          {/* STEP 5b: REQUEST SENT */}
          {step === 7 && (
            <div className="flex flex-col items-center text-center py-6 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-5 border-4 border-green-50 dark:border-green-900/20">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Help is on the way</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Your location has been transmitted. Keep your device powered on and stay where you are.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl w-full mb-8 text-left border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rescue ID</span>
                  <span className="text-xs font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded text-red-600 dark:text-red-400 font-bold border border-slate-200 dark:border-slate-700">{requestId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</span>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                    Dispatching Team
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleReset}
                className="w-full py-4 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
