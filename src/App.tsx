import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { SolarSystemScene } from './components/scene/SolarSystemScene';
import { TopNavigation } from './components/navigation/TopNavigation';
import { PlaybackControls } from './components/controls/PlaybackControls';
import { MissionHUD } from './components/panels/MissionHUD';
import { GoldenRecordModal } from './components/modals/GoldenRecordModal';
import { ProjectInfoModal } from './components/modals/ProjectInfoModal';
import { Loader2 } from 'lucide-react';

const SimulationApp: React.FC = () => {
  const { isLoadingData } = useSimulation();
  const [showGoldenRecord, setShowGoldenRecord] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  if (isLoadingData) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-slate-200 font-mono gap-3">
        <img
          src="/image00.png"
          alt="Voyager"
          className="w-14 h-14 object-contain opacity-80"
        />
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>LOADING VOYAGER TRAJECTORY DATA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 1. Full-screen 3D Viewport */}
      <SolarSystemScene />

      {/* 2. Sleek Top Navigation */}
      <TopNavigation
        onOpenGoldenRecord={() => setShowGoldenRecord(true)}
        onOpenInfo={() => setShowProjectInfo(true)}
      />

      {/* 3. Sleek Floating Mission HUD */}
      <MissionHUD />

      {/* 4. Sleek Bottom Playback Controls */}
      <PlaybackControls />

      {/* 5. Modals */}
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
