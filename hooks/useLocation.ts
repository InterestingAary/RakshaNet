/**
 * useLocation.ts
 * Convenience hook that proxies LocationContext.
 * Prefer this over useLocationContext directly in components.
 */

import { useLocationContext } from '@/context/LocationContext';

export { useLocationContext as useLocation };
