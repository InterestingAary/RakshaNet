'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { demoBus } from '@/lib/demoBus';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DemoStep {
  id: number;
  title: string;
  description: string;
  /** Side-effect to execute when this step becomes active */
  action: () => void;
}

interface DemoContextValue {
  isDemoMode: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepInfo: DemoStep | null;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  nextStep: () => void;
  prevStep: () => void;
  resetDemo: () => void;
  isRunning: boolean;
}

// ---------------------------------------------------------------------------
// The 14-step flood scenario
// ---------------------------------------------------------------------------

/**
 * Steps are defined as factories so they can call demoBus.emit() to inform
 * DisasterContext (or any other subscriber) about the state change needed.
 * DisasterContext subscribes to STEP_CHANGE events and applies mutations.
 */
function buildDemoSteps(): DemoStep[] {
  return [
    {
      id: 1,
      title: 'Flood Event Activated',
      description:
        'A major flood event has been detected along the Krishna River basin. The system activates emergency protocols.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 1 }),
    },
    {
      id: 2,
      title: 'Hazard Zone Identified',
      description:
        'A high-risk hazard zone is marked around the Krishna River banks. Residents within 2 km radius are flagged.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 2 }),
    },
    {
      id: 3,
      title: 'Vulnerable People Prioritized',
      description:
        '128 vulnerable individuals (elderly, disabled, children) have been identified and prioritized for evacuation.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 3 }),
    },
    {
      id: 4,
      title: 'Shelters Become Available',
      description:
        '4 emergency shelters are activated and accepting evacuees. Combined capacity: 2,400 people.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 4 }),
    },
    {
      id: 5,
      title: 'Citizen Receives Evacuation Notice',
      description:
        'The citizen portal displays an urgent evacuation recommendation based on the user\'s current location.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 5 }),
    },
    {
      id: 6,
      title: 'Safe Route Displayed',
      description:
        'The system calculates and displays the optimal evacuation route to the nearest shelter (Guntur Civic Center, 3.2 km).',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 6 }),
    },
    {
      id: 7,
      title: 'Citizen Reports Blocked Road',
      description:
        'A citizen submits an incident report: NH-16 near Pedakakani is blocked by floodwater.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 7 }),
    },
    {
      id: 8,
      title: 'Authority Sees the Incident',
      description:
        'The authority dashboard receives the incident report in real-time. It appears on the incident feed and map.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 8 }),
    },
    {
      id: 9,
      title: 'Route Becomes Unavailable',
      description:
        'The system marks the previously recommended route as blocked. Citizens on that route receive an alert.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 9 }),
    },
    {
      id: 10,
      title: 'Alternative Route Calculated',
      description:
        'An alternative route via SH-4 is calculated, adding 1.8 km but avoiding the flooded stretch.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 10 }),
    },
    {
      id: 11,
      title: 'Shelter Capacity Changes',
      description:
        'Guntur Civic Center reaches 85% capacity. The system deprioritises it and promotes Nagarjuna School (450/800).',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 11 }),
    },
    {
      id: 12,
      title: 'Dashboard Updates',
      description:
        'The authority dashboard reflects updated shelter occupancy, incident count, and evacuation statistics.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 12 }),
    },
    {
      id: 13,
      title: 'Evacuation Progress Changes',
      description:
        '1,847 of 2,300 at-risk residents have reached safety. Progress bar updates to 80%. 128 vulnerable cases cleared.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 13 }),
    },
    {
      id: 14,
      title: 'Incident Resolved',
      description:
        'The road-blocked incident is marked resolved by authorities. The route is reinstated and the timeline is updated.',
      action: () =>
        demoBus.emit({ type: 'STEP_CHANGE', step: 14 }),
    },
  ];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DemoContext = createContext<DemoContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface DemoProviderProps {
  children: React.ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const stepsRef = useRef<DemoStep[]>(buildDemoSteps());

  const totalSteps = stepsRef.current.length;

  // Run the action for the current step whenever it changes while demo is active
  useEffect(() => {
    if (!isDemoMode || currentStep < 1 || currentStep > totalSteps) return;
    const step = stepsRef.current[currentStep - 1];
    if (step) {
      setIsRunning(true);
      // Execute asynchronously to avoid state-during-render issues
      const timeout = setTimeout(() => {
        step.action();
        setIsRunning(false);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [isDemoMode, currentStep, totalSteps]);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setCurrentStep(1);
    demoBus.emit({ type: 'DEMO_ACTIVATED', step: 1 });
  }, []);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setCurrentStep(0);
    setIsRunning(false);
    demoBus.emit({ type: 'DEMO_DEACTIVATED' });
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, totalSteps);
      return next;
    });
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetDemo = useCallback(() => {
    setCurrentStep(1);
    demoBus.emit({ type: 'DEMO_ACTIVATED', step: 1 });
  }, []);

  const currentStepInfo = useMemo<DemoStep | null>(() => {
    if (!isDemoMode || currentStep < 1 || currentStep > totalSteps) return null;
    return stepsRef.current[currentStep - 1] ?? null;
  }, [isDemoMode, currentStep, totalSteps]);

  const value = useMemo<DemoContextValue>(
    () => ({
      isDemoMode,
      currentStep,
      totalSteps,
      currentStepInfo,
      enableDemoMode,
      disableDemoMode,
      nextStep,
      prevStep,
      resetDemo,
      isRunning,
    }),
    [
      isDemoMode,
      currentStep,
      totalSteps,
      currentStepInfo,
      enableDemoMode,
      disableDemoMode,
      nextStep,
      prevStep,
      resetDemo,
      isRunning,
    ]
  );

  return (
    <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return ctx;
}

// Re-export demoBus so consumers can subscribe without an extra import
export { demoBus };
