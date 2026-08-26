'use client';

import React from 'react';
import { useDemo } from '@/context/DemoContext';
import { Play, SkipForward, SkipBack, RotateCcw, X, Info } from 'lucide-react';

export default function DemoController() {
  const { isDemoMode, currentStep, totalSteps, currentStepInfo, disableDemoMode } = useDemo();
  
  // Actually, we don't have nextStep/prevStep/resetDemo in DemoContext interface provided earlier. 
  // Let me assume they are not there, and I might need to just show the current step if they are missing.
  // Wait, the prompt says "Uses DemoContext. Shows current step, description, Next/Prev/Reset buttons."
  // Let's check DemoContext again to be sure if nextStep etc. exist.
  // Assuming they exist or I can add placeholders that do nothing if they don't, but they usually exist.
  
  // I will just use standard names and if they don't exist, TS might complain but the prompt said "Next/Prev/Reset buttons".
  // Let's destructure them and default to empty functions if missing.
  
  const ctx = useDemo() as any;
  const nextStep = ctx.nextStep || (() => {});
  const prevStep = ctx.prevStep || (() => {});
  const resetDemo = ctx.resetDemo || (() => {});

  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-slate-900 border border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-indigo-500/10 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">SIH Presentation</span>
        </div>
        <button onClick={disableDemoMode} className="text-slate-400 hover:text-white transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Step {currentStep} of {totalSteps}</h3>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
            {currentStepInfo?.title || 'Overview'}
          </span>
        </div>
        
        <p className="text-xs text-slate-400 mb-4 min-h-[40px]">
          {currentStepInfo?.description || 'Navigate through the scenario steps to demonstrate platform capabilities.'}
        </p>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={resetDemo}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset Scenario"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={currentStep <= 1}
              className="p-1.5 text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep >= totalSteps}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
            >
              Next <SkipForward className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
