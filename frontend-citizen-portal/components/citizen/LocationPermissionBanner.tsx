'use client';

import React from 'react';
import { MapPin, X } from 'lucide-react';

interface LocationPermissionBannerProps {
  onGrantPermission: () => void;
  onManualSelect: () => void;
}

export function LocationPermissionBanner({
  onGrantPermission,
  onManualSelect,
}: LocationPermissionBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-100 p-4 relative">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 max-w-7xl mx-auto pr-8">
        <div className="bg-amber-500/20 p-2 rounded-full shrink-0">
          <MapPin className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Enable Location Access</h3>
          <p className="text-sm opacity-90">
            We need your location to provide accurate evacuation routing and find the nearest safe shelters.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
          <button
            onClick={onGrantPermission}
            className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Allow Access
          </button>
          <button
            onClick={onManualSelect}
            className="flex-1 sm:flex-none bg-transparent hover:bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Select Manually
          </button>
        </div>
      </div>
    </div>
  );
}
