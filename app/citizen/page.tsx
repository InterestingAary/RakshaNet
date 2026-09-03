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
import CitizenHeader from '@/components/citizen/CitizenHeader';
import { AlertCircle, FileWarning } from 'lucide-react';
import { Shelter, LatLng } from '@/types';

const EmergencyMap = dynamic(() => import('@/components/map/EmergencyMap'), { ssr: false });

function CitizenPortalInner() {
  const { hazardZones, shelters, incidents, activeDisaster } = useDisaster();
  const { route, isLoadingRoute, requestRoute, refreshRoute, clearRoute } = useRoute();
  const { location, setManualLocation } = useLocation();

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
    if (!location) {
      setManualLocation(latlng as any);
    }
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

            <AlertsPanel />
            
            <EvacuationPanel 
              route={route}
              isLoading={isLoadingRoute}
              onRecalculate={() => route && location ? refreshRoute(location, route.toShelterId, activeDisaster?.id) : null}
              onClearRoute={clearRoute}
            />

            <div className="space-y-3">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white sticky top-0 bg-slate-50 dark:bg-slate-900 py-2 z-10">
                Safe Shelters
              </h2>
              {shelters.map(shelter => (
                <ShelterCard 
                  key={shelter.id}
                  shelter={shelter}
                  onSelect={handleShelterSelect}
                  isSelected={selectedShelter?.id === shelter.id}
                  distanceKm={distanceTo(shelter.location)}
                />
              ))}
              {shelters.length === 0 && (
                <div className="text-center p-6 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No active shelters found nearby.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative z-0">
          <EmergencyMap 
            hazardZones={hazardZones}
            shelters={shelters}
            incidents={incidents}
            routes={route ? [route] : []}
            userLocation={location as any}
            onShelterClick={handleShelterSelect}
            onMapClick={handleMapClick}
            height="100%"
          />

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
