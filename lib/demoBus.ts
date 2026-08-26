/**
 * demoBus.ts
 * A lightweight, typed singleton event bus used to decouple DemoContext
 * from DisasterContext without creating circular dependencies.
 */

export type DemoEventType = 'STEP_CHANGE' | 'DEMO_ACTIVATED' | 'DEMO_DEACTIVATED';

export interface DemoEvent {
  type: DemoEventType;
  step?: number;
}

type DemoEventListener = (event: DemoEvent) => void;

class DemoBus {
  private listeners: Map<DemoEventType, Set<DemoEventListener>> = new Map();

  on(type: DemoEventType, listener: DemoEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  emit(event: DemoEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }

  off(type: DemoEventType, listener: DemoEventListener): void {
    this.listeners.get(type)?.delete(listener);
  }

  clear(): void {
    this.listeners.clear();
  }
}

/** Singleton instance — import this directly wherever you need cross-context communication */
export const demoBus = new DemoBus();
