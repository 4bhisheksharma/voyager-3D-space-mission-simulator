import React, { useState, useEffect, Suspense, lazy } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { SolarSystemScene } from './components/scene/SolarSystemScene';
import { TopNavigation } from './components/navigation/TopNavigation';
import { PlaybackControls } from './components/controls/PlaybackControls';
import { MissionHUD } from './components/panels/MissionHUD';
import { CinematicTourHUD } from './components/panels/CinematicTourHUD';
import { OneLightDayHUD } from './components/panels/OneLightDayHUD';
import { Loader2 } from 'lucide-react';

// Lazy-load heavy modals on-demand to minimize initial bundle size and accelerate page boot
const GoldenRecordModal = lazy(() =>
  import('./components/modals/GoldenRecordModal').then(m => ({ default: m.GoldenRecordModal }))
);
const ProjectInfoModal = lazy(() =>
  import('./components/modals/ProjectInfoModal').then(m => ({ default: m.ProjectInfoModal }))
);

const SimulationApp: React.FC = () => {
  const { isLoadingData, isModalOpen, registerModal, isCinematicTour, isOneLightDaySimulation } = useSimulation();
  const [showGoldenRecord, setShowGoldenRecord] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  // Synchronize modal open states to suppress all 3D HTML labels during dialog view
  useEffect(() => {
    registerModal('golden-record', showGoldenRecord);
  }, [showGoldenRecord, registerModal]);

  useEffect(() => {
    registerModal('project-info', showProjectInfo);
  }, [showProjectInfo, registerModal]);

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

  const isCinematicActive = isCinematicTour || isOneLightDaySimulation;

  return (
    <div 
      data-modal-open={isModalOpen ? 'true' : 'false'}
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
    >
      {/* 1. Full-screen 3D Viewport */}
      <SolarSystemScene />

      {/* 2. Sleek Top Navigation */}
      <TopNavigation
        onOpenGoldenRecord={() => setShowGoldenRecord(true)}
        onOpenInfo={() => setShowProjectInfo(true)}
      />

      {/* 3. Sleek Floating Mission HUD (hidden during Cinematic Tour or 1-Light-Day Flight) */}
      {!isCinematicActive && <MissionHUD />}

      {/* 4. Sleek Bottom Playback Controls (hidden during Cinematic Tour or 1-Light-Day Flight) */}
      {!isCinematicActive && <PlaybackControls />}

      {/* 5. Autopilot Cinematic Grand Tour HUD */}
      {isCinematicTour && <CinematicTourHUD />}

      {/* 6. One Light Day Flight Simulation HUD */}
      {isOneLightDaySimulation && <OneLightDayHUD />}

      {/* 7. On-Demand Lazy Loaded Modals */}
      <Suspense fallback={null}>
        {showGoldenRecord && (
          <GoldenRecordModal
            isOpen={showGoldenRecord}
            onClose={() => setShowGoldenRecord(false)}
          />
        )}
        {showProjectInfo && (
          <ProjectInfoModal
            isOpen={showProjectInfo}
            onClose={() => setShowProjectInfo(false)}
          />
        )}
      </Suspense>
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
