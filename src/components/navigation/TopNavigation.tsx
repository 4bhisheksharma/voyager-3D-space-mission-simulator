import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  RotateCcw, 
  Disc, 
  Eye, 
  SlidersHorizontal,
  ChevronDown,
  Info
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
    isFollowingSpacecraft,
    setIsFollowingSpacecraft,
    scaleMode,
    setScaleMode,
    v1Current,
    v2Current,
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

  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const [showCameraDropdown, setShowCameraDropdown] = useState(false);

  const cameraOptions: { id: CameraFocusTarget; label: string; group: string }[] = [
    { id: 'overview', label: 'Full Solar System', group: 'System' },
    { id: 'inner_solar_system', label: 'Inner Solar System', group: 'System' },
    { id: 'voyager1', label: 'Voyager 1 Spacecraft', group: 'Probes' },
    { id: 'voyager2', label: 'Voyager 2 Spacecraft', group: 'Probes' },
    { id: 'sun', label: 'The Sun', group: 'Celestial' },
    { id: 'earth', label: 'Earth (Cradle)', group: 'Celestial' },
    { id: 'jupiter', label: 'Jupiter', group: 'Celestial' },
    { id: 'saturn', label: 'Saturn', group: 'Celestial' },
    { id: 'uranus', label: 'Uranus', group: 'Celestial' },
    { id: 'neptune', label: 'Neptune', group: 'Celestial' }
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      {/* Left: Mission Brand and Patch */}
      <div className="flex items-center gap-3">
        <div className="relative group flex items-center gap-2.5 cursor-pointer" onClick={() => setCameraTarget('overview')}>
          <img
            src="/image00.png"
            alt="Voyager Mission Patch"
            className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-100 flex items-center gap-1.5">
              NASA VOYAGER <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono">SIMULATOR</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Interstellar Space Exploration</span>
          </div>
        </div>

        {/* Spacecraft Selection Tabs */}
        <div className="hidden sm:flex items-center gap-1 ml-4 p-1 rounded-lg bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => {
              setSelectedSpacecraft('voyager1');
              setCameraTarget('voyager1');
              setIsFollowingSpacecraft(true);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
              selectedSpacecraft === 'voyager1'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs shadow-emerald-500/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            <span>VOYAGER 1</span>
            {v1Current && (
              <span className="text-[10px] text-emerald-300/80 bg-emerald-950/60 px-1 py-0.2 rounded">
                {v1Current.dist.toFixed(1)} AU
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setSelectedSpacecraft('voyager2');
              setCameraTarget('voyager2');
              setIsFollowingSpacecraft(true);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
              selectedSpacecraft === 'voyager2'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs shadow-amber-500/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span>VOYAGER 2</span>
            {v2Current && (
              <span className="text-[10px] text-amber-300/80 bg-amber-950/60 px-1 py-0.2 rounded">
                {v2Current.dist.toFixed(1)} AU
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Right Controls: Camera targets, Layers, Scale, Golden Record */}
      <div className="flex items-center gap-2">
        {/* Camera Target Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCameraDropdown(!showCameraDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline capitalize">{cameraTarget.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showCameraDropdown && (
            <div className="absolute right-0 mt-1.5 w-48 py-1.5 rounded-lg bg-slate-900 border border-slate-700 shadow-xl backdrop-blur-md z-30">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Camera Target
              </div>
              {cameraOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setCameraTarget(opt.id);
                    if (opt.id === 'voyager1' || opt.id === 'voyager2') {
                      setIsFollowingSpacecraft(true);
                      setSelectedSpacecraft(opt.id);
                    } else {
                      setIsFollowingSpacecraft(false);
                    }
                    setShowCameraDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                    cameraTarget === opt.id
                      ? 'bg-sky-500/20 text-sky-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {cameraTarget === opt.id && <Eye className="w-3 h-3 text-sky-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Visual Layers Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayersDropdown(!showLayersDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Visual Overlays"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">Overlays</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLayersDropdown && (
            <div className="absolute right-0 mt-1.5 w-56 p-2 rounded-lg bg-slate-900 border border-slate-700 shadow-xl backdrop-blur-md z-30 text-xs font-mono space-y-1.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Display Overlays
              </div>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="text-emerald-400">Voyager 1 Path</span>
                <input
                  type="checkbox"
                  checked={showVoyager1Trajectory}
                  onChange={toggleVoyager1Trajectory}
                  className="rounded accent-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="text-amber-400">Voyager 2 Path</span>
                <input
                  type="checkbox"
                  checked={showVoyager2Trajectory}
                  onChange={toggleVoyager2Trajectory}
                  className="rounded accent-amber-500"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="text-slate-300">Planetary Orbits</span>
                <input
                  type="checkbox"
                  checked={showPlanetaryOrbits}
                  onChange={togglePlanetaryOrbits}
                  className="rounded accent-sky-500"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="text-slate-300">Heliosphere Boundaries</span>
                <input
                  type="checkbox"
                  checked={showHeliosphereBoundaries}
                  onChange={toggleHeliosphereBoundaries}
                  className="rounded accent-rose-500"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="text-slate-300">Milestone Pins</span>
                <input
                  type="checkbox"
                  checked={showEventMarkers}
                  onChange={toggleEventMarkers}
                  className="rounded accent-sky-500"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="text-slate-300">Celestial Labels</span>
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

        {/* Scale Mode Switch */}
        <button
          onClick={() => setScaleMode(scaleMode === 'enhanced' ? 'astronomical' : 'enhanced')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle between enhanced visual sizing and true astronomical scale"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] capitalize">Scale: {scaleMode}</span>
        </button>

        {/* Golden Record Button */}
        <button
          onClick={onOpenGoldenRecord}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono transition-colors cursor-pointer shadow-xs shadow-amber-500/20"
          title="Explore the Golden Record"
        >
          <Disc className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="hidden sm:inline">Golden Record</span>
        </button>

        {/* Reset Camera Button */}
        <button
          onClick={() => {
            setCameraTarget('overview');
            setIsFollowingSpacecraft(false);
          }}
          className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reset Camera to Overview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Project Mission Info */}
        <button
          onClick={onOpenInfo}
          className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Project Dataset & Architecture Info"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
