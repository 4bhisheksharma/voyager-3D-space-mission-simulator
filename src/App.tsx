import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { SolarSystemScene } from './components/scene/SolarSystemScene';
import { TopNavigation } from './components/navigation/TopNavigation';
import { PlaybackControls } from './components/controls/PlaybackControls';
import { TelemetryPanel } from './components/panels/TelemetryPanel';
import { MilestonesPanel } from './components/panels/MilestonesPanel';
import { GoldenRecordModal } from './components/modals/GoldenRecordModal';
import { ProjectInfoModal } from './components/modals/ProjectInfoModal';
import { Loader2 } from 'lucide-react';

const SimulationApp: React.FC = () => {
  const { isLoadingData } = useSimulation();
  const [showGoldenRecord, setShowGoldenRecord] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [showMilestones, setShowMilestones] = useState(false);

  if (isLoadingData) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#020617] text-slate-100 font-mono gap-4">
        <div className="relative flex items-center justify-center">
          <img
            src="/image00.png"
            alt="Voyager Mission Patch"
            className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-sky-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>INITIALIZING NASA VOYAGER TRAJECTORY DATASETS...</span>
        </div>
        <span className="text-xs text-slate-500">
          Loading 16,201 orbital coordinates & NASA JPL ephemerides
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020617] select-none">
      {/* 1. Full-screen 3D Solar System Viewport */}
      <SolarSystemScene />

      {/* 2. Top Navigation Bar */}
      <TopNavigation
        onOpenGoldenRecord={() => setShowGoldenRecord(true)}
        onOpenInfo={() => setShowProjectInfo(true)}
      />

      {/* 3. Left Milestones Side Panel */}
      <MilestonesPanel
        isOpen={showMilestones}
        onToggle={() => setShowMilestones(!showMilestones)}
      />

      {/* 4. Right Telemetry Side Panel */}
      <TelemetryPanel
        isOpen={showTelemetry}
        onToggle={() => setShowTelemetry(!showTelemetry)}
      />

      {/* 5. Bottom Playback & Timeline Controls */}
      <PlaybackControls />

      {/* 6. Modals */}
      <GoldenRecordModal
        isOpen={showGoldenRecord}
        onClose={() => setShowGoldenRecord(false)}
      />

      <ProjectInfoModal
        isOpen={showProjectInfo}
        onClose={() => setShowProjectInfo(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <SimulationApp />
    </SimulationProvider>
  );
}

