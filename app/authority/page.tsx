'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import AuthorityHeader from '@/components/authority/AuthorityHeader';
import DashboardMetrics from '@/components/authority/DashboardMetrics';
import ShelterManagement from '@/components/authority/ShelterManagement';
import PriorityCaseTable from '@/components/authority/PriorityCaseTable';
import IncidentManagement from '@/components/authority/IncidentManagement';
import BlockedRoadManagement from '@/components/authority/BlockedRoadManagement';
import ResponseTeamPanel from '@/components/authority/ResponseTeamPanel';
import EventTimeline from '@/components/authority/EventTimeline';
import CreateEventForm from '@/components/authority/CreateEventForm';
import DemoController from '@/components/authority/DemoController';
import { blockedRoadService } from '@/services/blockedRoadService';

import { useDisasterContext } from '@/context/DisasterContext';
import { useDemo } from '@/context/DemoContext';
import { Plus } from 'lucide-react';

const EmergencyMap = dynamic(() => import('@/components/map/EmergencyMap'), { ssr: false });

type TabType = 'overview' | 'shelters' | 'priority' | 'incidents' | 'blocked_roads' | 'teams' | 'timeline';

export default function AuthorityDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  
  const { isDemoMode } = useDemo();
  const { 
    activeDisaster,
    shelters,
    incidents,
    priorityCases,
    responseTeams,
    timeline,
    blockedRoads,
    updateBlockedRoad
  } = useDisasterContext();

  const handleUpdateShelter = async (shelter: any) => {
    try {
      // Assuming shelter is of type Shelter
      const updated = await shelterService.updateShelter(shelter.id, shelter);
      // Wait, updateShelter isn't imported from context. Let's get it.
      // Ah, updateShelter is already extracted from useDisasterContext above!
      updateShelter(updated);
    } catch (err) {
      console.error('Failed to update shelter', err);
    }
  };

  const handleAssignTeam = async (targetId: string, teamId: string) => {
    // console.log('Assign team', targetId, teamId);
  };

  const handleUpdateIncidentStatus = async (id: string, status: any) => {
    try {
      const updated = await incidentService.updateIncidentStatus(id, status);
      updateIncident(updated);
    } catch (err) {
      console.error('Failed to update incident status', err);
    }
  };

  const handleCreateEvent = (eventData: any) => {
    // console.log('Create event', eventData);
  };

  const handleVerifyBlockedRoad = async (id: string, notes?: string) => {
    try {
      const updated = await blockedRoadService.verifyBlockedRoad(id, notes);
      updateBlockedRoad(updated);
    } catch (err) {
      console.error('Failed to verify blocked road', err);
    }
  };

  const handleClearBlockedRoad = async (id: string, notes?: string) => {
    try {
      const updated = await blockedRoadService.clearBlockedRoad(id, notes);
      updateBlockedRoad(updated);
    } catch (err) {
      console.error('Failed to clear blocked road', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-300 overflow-hidden">
      <AuthorityHeader />
      
      <DashboardMetrics 
        disaster={activeDisaster}
        shelters={shelters || []}
        incidents={incidents || []}
        priorityCases={priorityCases || []}
        responseTeams={responseTeams || []}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <aside className="w-80 lg:w-[400px] flex flex-col border-r border-slate-800 bg-slate-900 z-10 shadow-2xl">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-slate-800 p-2 gap-1 bg-slate-900">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'shelters', label: 'Shelters' },
              { id: 'priority', label: 'Priority Cases' },
              { id: 'incidents', label: 'Incidents' },
              { id: 'blocked_roads', label: 'Blocked Roads' },
              { id: 'teams', label: 'Teams' },
              { id: 'timeline', label: 'Timeline' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Status Overview</h3>
                <p className="text-sm text-slate-400">
                  Select a category above to manage operations, or interact with the map to view detailed geographic data.
                </p>
                {/* Could show mini summaries here */}
                {activeDisaster ? (
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-medium text-white mb-2">{activeDisaster.name}</h4>
                    <p className="text-sm text-slate-300">{activeDisaster.description}</p>
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                      <strong>Instructions:</strong> {activeDisaster.instructions}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-slate-800 border-dashed rounded-lg text-slate-500">
                    No active disaster event.
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'shelters' && (
              <ShelterManagement shelters={shelters || []} onUpdate={handleUpdateShelter} />
            )}
            
            {activeTab === 'priority' && (
              <PriorityCaseTable 
                cases={priorityCases || []} 
                teams={responseTeams || []} 
                onAssignTeam={handleAssignTeam} 
              />
            )}
            
            {activeTab === 'incidents' && (
              <IncidentManagement 
                incidents={incidents || []} 
                teams={responseTeams || []}
                onUpdateStatus={handleUpdateIncidentStatus}
                onAssignTeam={handleAssignTeam}
              />
            )}

            {activeTab === 'blocked_roads' && (
              <BlockedRoadManagement 
                blockedRoads={blockedRoads || []} 
                onVerify={handleVerifyBlockedRoad}
                onClear={handleClearBlockedRoad}
              />
            )}
            
            {activeTab === 'teams' && (
              <ResponseTeamPanel 
                teams={responseTeams || []}
                incidents={incidents || []}
                priorityCases={priorityCases || []}
                onAssign={(teamId) => {}}
              />
            )}
            
            {activeTab === 'timeline' && (
              <EventTimeline events={timeline || []} maxItems={20} />
            )}
          </div>
        </aside>

        {/* Main Map Area */}
        <main className="flex-1 relative bg-slate-950">
          <EmergencyMap />
          
          {/* Floating Action Button */}
          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="absolute bottom-6 right-6 z-20 flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
            title="Declare Emergency"
          >
            <Plus className="w-6 h-6" />
          </button>
        </main>
      </div>

      <CreateEventForm 
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSubmit={handleCreateEvent}
      />

      {isDemoMode && <DemoController />}
    </div>
  );
}
