import React, { useState } from 'react';
import { 
  RotateCcw, 
  Disc, 
  Layers, 
  Info, 
  ChevronDown, 
  Gauge, 
  Menu, 
  X, 
  Camera
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { CameraFocusTarget } from '../../types/simulation';

interface TopNavigationProps {
  onOpenGoldenRecord: () => void;
  onOpenInfo: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ onOpenGoldenRecord, onOpenInfo }) => {
  const {
    selectedSpacecraft,
    setSelectedSpacecraft,
    cameraTarget,
    setCameraTarget,
    setIsFollowingSpacecraft,
    v1Current,
    v2Current,
    optimizationMode,
    toggleOptimizationMode,
    showVoyager1Trajectory,
    showVoyager2Trajectory,
    showPlanetaryOrbits,
    showHeliosphereBoundaries,
    showEventMarkers,
    showCelestialLabels,
    toggleVoyager1Trajectory,
    toggleVoyager2Trajectory,
    togglePlanetaryOrbits,
    toggleHeliosphereBoundaries,
    toggleEventMarkers,
    toggleCelestialLabels
  } = useSimulation();

  const [showLayers, setShowLayers] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Curated Quick Focus Targets: Only Sun, Earth, Solar System, Voyager 1 & Voyager 2
  const targets: { id: CameraFocusTarget; label: string }[] = [
    { id: 'overview', label: 'Solar System' },
    { id: 'sun', label: 'Sun' },
    { id: 'earth', label: 'Earth' },
    { id: 'voyager1', label: 'Voyager 1' },
    { id: 'voyager2', label: 'Voyager 2' }
  ];

  const handleSelectSpacecraft = (id: 'voyager1' | 'voyager2') => {
    setSelectedSpacecraft(id);
    setCameraTarget(id);
    setIsFollowingSpacecraft(true);
  };

  const handleSelectTarget = (id: CameraFocusTarget) => {
    setCameraTarget(id);
    if (id === 'voyager1' || id === 'voyager2') {
      setSelectedSpacecraft(id);
      setIsFollowingSpacecraft(true);
    } else {
      setIsFollowingSpacecraft(false);
    }
    setShowMobileMenu(false);
  };

  return (
    <header className="absolute top-0 inset-x-0 z-40 h-11 px-3 sm:px-4 flex items-center justify-between bg-zinc-950/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.6)] select-none">
      {/* Left: Brand & Probe Switcher (Without distracting colored dots) */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div
          onClick={() => { setCameraTarget('overview'); setIsFollowingSpacecraft(false); }}
          className="flex items-center gap-2 cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
        >
          <img src="/image00.png" alt="Voyager Patch" className="w-5 h-5 object-contain" />
          <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider text-zinc-200 uppercase truncate">
            Voyager <span className="hidden sm:inline">Simulator</span>
          </span>
        </div>

        {/* Minimal Probe Switcher - Clean Typographic NASA Design (No green/yellow dots) */}
        <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10 text-[11px] font-mono">
          <button
            onClick={() => handleSelectSpacecraft('voyager1')}
            className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedSpacecraft === 'voyager1'
                ? 'bg-emerald-500/25 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <span>V1</span>
            {v1Current && <span className="hidden xl:inline text-[10px] text-zinc-400 font-normal">{v1Current.dist.toFixed(0)}AU</span>}
          </button>

          <button
            onClick={() => handleSelectSpacecraft('voyager2')}
            className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedSpacecraft === 'voyager2'
                ? 'bg-amber-500/25 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <span>V2</span>
            {v2Current && <span className="hidden xl:inline text-[10px] text-zinc-400 font-normal">{v2Current.dist.toFixed(0)}AU</span>}
          </button>
        </div>
      </div>

      {/* Center: Curated Camera Target Presets & Free Cam Mode */}
      <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
        {targets.map(t => (
          <button
            key={t.id}
            onClick={() => handleSelectTarget(t.id)}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              cameraTarget === t.id
                ? 'text-white bg-white/15 font-semibold border border-white/20 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* Free Roam Camera Toggle with Camera Icon */}
        <button
          onClick={() => handleSelectTarget('free')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ml-1.5 ${
            cameraTarget === 'free'
              ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50 font-semibold shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-white/10'
          }`}
          title="Free Camera Mode: Pan freely across space, and zoom directly towards cursor position"
        >
          <Camera className="w-3.5 h-3.5 text-sky-400" />
          <span>Free Cam</span>
        </button>
      </nav>

      {/* Right Controls: Optimization Mode, Layers, Golden Record, Info */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Optimization Mode Toggle (Performance Mode) */}
        <button
          onClick={toggleOptimizationMode}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
            optimizationMode
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
              : 'bg-white/5 text-zinc-400 hover:text-zinc-200 border-white/10'
          }`}
          title="Optimization Mode: switches off non-essential 3D planet models to ensure smooth framerates on all hardware"
        >
          <Gauge className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Optimize:</span>
          <span>{optimizationMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Overlays Menu with Backdrop and Top Stacking Context */}
        <div className="relative">
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300 transition-colors cursor-pointer"
            title="Display Overlays"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Layers</span>
            <ChevronDown className="w-2.5 h-2.5 text-zinc-400" />
          </button>

          {showLayers && (
            <>
              {/* Invisible Click-away Backdrop to close on outside click */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setShowLayers(false)} 
              />

              {/* Elevated Popover Dialogue (High z-50 to never get covered by HUD) */}
              <div className="absolute right-0 mt-2 w-52 p-2 rounded-xl bg-zinc-950/95 border border-white/15 shadow-2xl backdrop-blur-xl z-50 font-mono text-xs space-y-1">
                <div className="px-1.5 py-1 text-[10px] text-zinc-400 font-semibold tracking-wider uppercase border-b border-white/10 mb-1">
                  Scene Overlays
                </div>
                <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 cursor-pointer text-zinc-300">
                  <span>Voyager 1 Path</span>
                  <input
                    type="checkbox"
                    checked={showVoyager1Trajectory}
                    onChange={toggleVoyager1Trajectory}
                    className="rounded accent-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 cursor-pointer text-zinc-300">
                  <span>Voyager 2 Path</span>
                  <input
                    type="checkbox"
                    checked={showVoyager2Trajectory}
                    onChange={toggleVoyager2Trajectory}
                    className="rounded accent-amber-500"
                  />
                </label>
                <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 cursor-pointer text-zinc-300">
                  <span>Planetary Orbits</span>
                  <input
                    type="checkbox"
                    checked={showPlanetaryOrbits}
                    onChange={togglePlanetaryOrbits}
                    className="rounded accent-sky-500"
                  />
                </label>
                <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 cursor-pointer text-zinc-300">
                  <span>Distance Boundaries</span>
                  <input
                    type="checkbox"
                    checked={showHeliosphereBoundaries}
                    onChange={toggleHeliosphereBoundaries}
                    className="rounded accent-sky-500"
                  />
                </label>
                <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 cursor-pointer text-zinc-300">
                  <span>Mission Milestones</span>
                  <input
                    type="checkbox"
                    checked={showEventMarkers}
                    onChange={toggleEventMarkers}
                    className="rounded accent-amber-500"
                  />
                </label>
                <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 cursor-pointer text-zinc-300">
                  <span>Celestial Labels</span>
                  <input
                    type="checkbox"
                    checked={showCelestialLabels}
                    onChange={toggleCelestialLabels}
                    className="rounded accent-sky-500"
                  />
                </label>
              </div>
            </>
          )}
        </div>

        {/* Golden Record */}
        <button
          onClick={onOpenGoldenRecord}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono transition-colors cursor-pointer"
          title="The Golden Record"
        >
          <Disc className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Record</span>
        </button>

        {/* Reset Camera */}
        <button
          onClick={() => {
            setCameraTarget('overview');
            setIsFollowingSpacecraft(false);
          }}
          className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Reset Camera to Overview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Info */}
        <button
          onClick={onOpenInfo}
          className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Documentation & Scientific Grounding"
        >
          <Info className="w-3.5 h-3.5" />
        </button>

        {/* Mobile Targets Menu Toggle */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Camera Targets"
        >
          {showMobileMenu ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Mobile Targets Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-11 inset-x-0 bg-zinc-950/95 border-b border-white/10 p-3 flex flex-col gap-2 backdrop-blur-md z-30 font-mono text-xs shadow-2xl">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Camera Targets:</div>
          <div className="flex flex-wrap gap-1.5">
            {targets.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelectTarget(t.id)}
                className={`px-3 py-1.5 rounded-md transition-colors text-xs cursor-pointer ${
                  cameraTarget === t.id ? 'bg-white text-black font-semibold' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleSelectTarget('free')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-xs w-full mt-1 justify-center cursor-pointer ${
              cameraTarget === 'free' ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50 font-semibold' : 'bg-white/5 text-zinc-300'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span>Free Roam Camera</span>
          </button>
        </div>
      )}
    </header>
  );
};