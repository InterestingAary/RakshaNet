'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DisasterProvider } from '@/context/DisasterContext';
import { LocationProvider } from '@/context/LocationContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { useDisaster } from '@/hooks/useDisaster';
import { useLocation } from '@/hooks/useLocation';
import { useRoute } from '@/hooks/useRoute';

import { LocationPermissionBanner } from '@/components/citizen/LocationPermissionBanner';
import { AlertsPanel } from '@/components/citizen/AlertsPanel';
import { ShelterCard } from '@/components/citizen/ShelterCard';
import { ShelterDetailPanel } from '@/components/citizen/ShelterDetailPanel';
import { EvacuationPanel } from '@/components/citizen/EvacuationPanel';
import { NeedHelpFlow } from '@/components/citizen/NeedHelpFlow';
import { IncidentReportForm } from '@/components/citizen/IncidentReportForm';
import { ExposureBanner } from '@/components/citizen/ExposureBanner';
import CitizenHeader from '@/components/citizen/CitizenHeader';
import { AlertCircle, AlertTriangle, Eye, EyeOff, FileWarning, Loader2, RefreshCw } from 'lucide-react';
import { Shelter, LatLng } from '@/types';
import { useHazards } from '@/hooks/useHazards';
import { useCitizenExposure } from '@/hooks/useCitizenExposure';

const EmergencyMap = dynamic(() => import('@/components/map/EmergencyMap'), { ssr: false });

function CitizenPortalInner() {
  const { shelters, incidents, activeDisaster } = useDisaster();
  const {
    hazards,
    isLoading: isLoadingHazards,
    error: hazardError,
    isEmpty: isHazardsEmpty,
    showHazards,
    toggleHazards,
    refresh: refreshHazards,
  } = useHazards({ disasterId: activeDisaster?.id });
  const { route, isLoadingRoute, requestRoute, refreshRoute, clearRoute } = useRoute();
  const { location, setManualLocation, permissionStatus } = useLocation();

  const {
    exposure,
    recommendedShelter,
    recommendedDistanceKm,
    isLoading: isLoadingExposure,
    error: exposureError,
    isLocationDenied,
    refresh: refreshExposure,
  } = useCitizenExposure({
    location,
    permissionStatus,
  });

  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [showLocationBanner, setShowLocationBanner] = useState(!location);


  useEffect(() => {
    if (location) setShowLocationBanner(false);
  }, [location]);

  const handleGrantPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setManualLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  const handleManualSelect = () => {
    setShowLocationBanner(false);
  };

  const handleShelterSelect = (shelter: Shelter) => {
    setSelectedShelter(shelter);
  };

  const handleRequestRoute = (shelter: Shelter) => {
    if (location) {
      requestRoute(location, shelter.id, activeDisaster?.id);
      setSelectedShelter(null);
    } else {
      alert("Please enable location to get directions.");
    }
  };

  const handleMapClick = (latlng: LatLng) => {
    setManualLocation(latlng as any);
  };

  const distanceTo = (target: LatLng) => {
    if (!location) return null;
    const R = 6371; // km
    const dLat = (target.lat - location.lat) * Math.PI / 180;
    const dLon = (target.lng - location.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(location.lat * Math.PI / 180) * Math.cos(target.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <CitizenHeader onOpenHelp={() => setIsHelpModalOpen(true)} />
      
      {showLocationBanner && (
        <LocationPermissionBanner 
          onGrantPermission={handleGrantPermission} 
          onManualSelect={handleManualSelect} 
        />
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel - Desktop */}
        <div className="w-full md:w-96 lg:w-[400px] flex-shrink-0 flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-10 overflow-y-auto hidden md:flex">
          <div className="p-4 space-y-4">
            <div className="flex gap-2 mb-2">
              <button 
                onClick={() => setIsHelpModalOpen(true)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <AlertCircle className="w-5 h-5" />
                Need Help
              </button>
              <button 
                onClick={() => setIsIncidentModalOpen(true)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <FileWarning className="w-5 h-5" />
                Report
              </button>
            </div>

            {/* Citizen Spatial Exposure & Nearest Verified Shelter Banner */}
            <ExposureBanner
              exposure={exposure}
              recommendedShelter={recommendedShelter}
              recommendedDistanceKm={recommendedDistanceKm}
              isLoading={isLoadingExposure}
              error={exposureError}
              isLocationDenied={isLocationDenied}
              hasLocation={Boolean(location)}
              onSelectShelter={handleShelterSelect}
              onRequestRoute={handleRequestRoute}
              onRefresh={refreshExposure}
              onPromptLocation={handleGrantPermission}
            />

            <AlertsPanel />
            
            <EvacuationPanel 
              route={route}
              isLoading={isLoadingRoute}
              onRecalculate={() => route && location ? refreshRoute(location, route.toShelterId, activeDisaster?.id) : null}
              onClearRoute={clearRoute}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between sticky top-0 bg-slate-50 dark:bg-slate-900 py-2 z-10">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                  Safe Shelters
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {shelters.length} verified
                </span>
              </div>
              {shelters.map(shelter => (
                <ShelterCard 
                  key={shelter.id}
                  shelter={shelter}
                  onSelect={handleShelterSelect}
                  isSelected={selectedShelter?.id === shelter.id}
                  isRecommended={recommendedShelter?.id === shelter.id}
                  distanceKm={
                    recommendedShelter?.id === shelter.id && recommendedDistanceKm !== null
                      ? recommendedDistanceKm
                      : distanceTo(shelter.location)
                  }
                />
              ))}
              {shelters.length === 0 && (
                <div className="text-center p-6 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No active verified shelters found nearby.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative z-0">
          <EmergencyMap 
            hazardZones={hazards}
            showHazards={showHazards}
            shelters={shelters}
            recommendedShelterId={recommendedShelter?.id}
            incidents={incidents}
            routes={route ? [route] : []}
            userLocation={location as any}
            onShelterClick={handleShelterSelect}
            onMapClick={handleMapClick}
            height="100%"
          />

          {/* Hazard Layer Controls & Status Overlay */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col items-end gap-2">
            <button
              onClick={toggleHazards}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold shadow-md transition-all ${
                showHazards
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={showHazards ? 'Hide Hazard Zones' : 'Show Hazard Zones'}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Hazards</span>
              {hazards.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                    showHazards
                      ? 'bg-red-800 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {hazards.length}
                </span>
              )}
              {showHazards ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            {/* Loading Indicator */}
            {isLoadingHazards && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/85 backdrop-blur text-white text-xs rounded-md shadow-md">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Loading hazard zones...</span>
              </div>
            )}

            {/* Error Indicator with Retry */}
            {hazardError && !isLoadingHazards && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/90 backdrop-blur text-white text-xs rounded-md shadow-lg">
                <span>Failed to refresh live zones</span>
                <button
                  onClick={() => refreshHazards()}
                  className="underline font-bold hover:text-amber-100 flex items-center gap-1 ml-1"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}

            {/* Empty State Indicator */}
            {showHazards && isHazardsEmpty && !isLoadingHazards && !hazardError && (
              <div className="px-3 py-1.5 bg-slate-800/85 backdrop-blur text-slate-200 text-xs rounded-md shadow">
                No active hazard zones verified in this area.
              </div>
            )}
          </div>


          {/* Mobile Overlay Actions */}
          <div className="md:hidden absolute top-4 left-4 right-4 flex gap-2 z-[400]">
            <button 
              onClick={() => setIsHelpModalOpen(true)}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <AlertCircle className="w-5 h-5" />
              Need Help
            </button>
            <button 
              onClick={() => setIsIncidentModalOpen(true)}
              className="flex-1 bg-amber-500 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <FileWarning className="w-5 h-5" />
              Report
            </button>
          </div>
        </div>
      </div>

      <ShelterDetailPanel 
        shelter={selectedShelter} 
        onClose={() => setSelectedShelter(null)} 
        onRequestRoute={handleRequestRoute} 
      />

      <NeedHelpFlow 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <IncidentReportForm 
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        defaultLocation={location || undefined}
      />
    </div>
  );
}

export default function CitizenPage() {
  return (
    <LanguageProvider>
      <LocationProvider>
        <DisasterProvider>
          <CitizenPortalInner />
        </DisasterProvider>
      </LocationProvider>
    </LanguageProvider>
  );
}
