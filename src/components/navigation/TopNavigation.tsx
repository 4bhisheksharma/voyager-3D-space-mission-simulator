import React, { useState } from 'react';
import { 
  RotateCcw, 
  Disc, 
  Layers, 
  Info,
  ChevronDown,
  Gauge,
  Menu,
  X
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

  const targets: { id: CameraFocusTarget; label: string }[] = [
    { id: 'overview', label: 'Solar System' },
    { id: 'inner_solar_system', label: 'Inner Planets' },
    { id: 'voyager1', label: 'Voyager 1' },
    { id: 'voyager2', label: 'Voyager 2' },
    { id: 'jupiter', label: 'Jupiter' },
    { id: 'saturn', label: 'Saturn' }
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
    <header className="absolute top-0 inset-x-0 z-20 h-11 px-3 sm:px-4 flex items-center justify-between bg-black/75 backdrop-blur-md border-b border-white/10 select-none">
      {/* Left: Brand & Probe Switcher */}
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

        {/* Minimal Probe Switcher */}
        <div className="flex items-center bg-white/5 p-0.5 rounded border border-white/10 text-[11px] font-mono">
          <button
            onClick={() => handleSelectSpacecraft('voyager1')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedSpacecraft === 'voyager1'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>V1</span>
            {v1Current && <span className="hidden lg:inline text-[10px] text-zinc-400">{v1Current.dist.toFixed(0)}AU</span>}
          </button>

          <button
            onClick={() => handleSelectSpacecraft('voyager2')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedSpacecraft === 'voyager2'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>V2</span>
            {v2Current && <span className="hidden lg:inline text-[10px] text-zinc-400">{v2Current.dist.toFixed(0)}AU</span>}
          </button>
        </div>
      </div>

      {/* Center: Desktop Camera Target Presets */}
      <nav className="hidden lg:flex items-center gap-1 font-mono text-xs">
        {targets.map(t => (
          <button
            key={t.id}
            onClick={() => handleSelectTarget(t.id)}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              cameraTarget === t.id
                ? 'text-white bg-white/10 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Right Controls: Optimization Mode, Layers, Golden Record, Info */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Optimization Mode Toggle (Performance Mode) */}
        <button
          onClick={toggleOptimizationMode}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
            optimizationMode
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
              : 'bg-white/5 text-zinc-400 hover:text-zinc-200 border-white/10'
          }`}
          title="Optimization Mode: switches off non-essential 3D planet models to ensure smooth framerates on all hardware"
        >
          <Gauge className="w-3 h-3 text-sky-400" />
          <span className="hidden sm:inline">Optimize:</span>
          <span>{optimizationMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Overlays Menu */}
        <div className="relative">
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300 transition-colors cursor-pointer"
            title="Display Overlays"
          >
            <Layers className="w-3 h-3 text-zinc-400" />
            <span className="hidden sm:inline">Layers</span>
            <ChevronDown className="w-2.5 h-2.5 text-zinc-400" />
          </button>

          {showLayers && (
            <div className="absolute right-0 mt-2 w-48 p-2 rounded-lg bg-zinc-950/95 border border-white/10 shadow-2xl backdrop-blur-md z-30 font-mono text-xs space-y-1">
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
                <span>Heliosphere Shells</span>
                <input
                  type="checkbox"
                  checked={showHeliosphereBoundaries}
                  onChange={toggleHeliosphereBoundaries}
                  className="rounded accent-rose-500"
                />
              </label>
              <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 cursor-pointer text-zinc-300">
                <span>Milestone Pins</span>
                <input
                  type="checkbox"
                  checked={showEventMarkers}
                  onChange={toggleEventMarkers}
                  className="rounded accent-sky-500"
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
          )}
        </div>

        {/* Golden Record */}
        <button
          onClick={onOpenGoldenRecord}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono transition-colors cursor-pointer"
          title="The Golden Record"
        >
          <Disc className="w-3 h-3 text-amber-400" />
          <span className="hidden md:inline">Record</span>
        </button>

        {/* Reset Camera */}
        <button
          onClick={() => {
            setCameraTarget('overview');
            setIsFollowingSpacecraft(false);
          }}
          className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Reset Camera to Overview"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        {/* Info */}
        <button
          onClick={onOpenInfo}
          className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Documentation & Scientific Grounding"
        >
          <Info className="w-3 h-3" />
        </button>

        {/* Mobile Targets Menu Toggle */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Camera Targets"
        >
          {showMobileMenu ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Mobile Targets Dropdown */}
      {showMobileMenu && (
        <div className="lg:hidden absolute top-11 inset-x-0 bg-zinc-950/95 border-b border-white/10 p-3 flex flex-wrap gap-1.5 backdrop-blur-md z-30 font-mono text-xs shadow-2xl">
          <div className="w-full text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Camera Targets:</div>
          {targets.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelectTarget(t.id)}
              className={`px-2.5 py-1 rounded transition-colors text-xs ${
                cameraTarget === t.id ? 'bg-white text-black font-semibold' : 'bg-white/5 text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
