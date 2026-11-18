import React, { useState } from 'react';
import { 
  RotateCcw, 
  Disc, 
  Layers, 
  Info,
  ChevronDown
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

  return (
    <header className="absolute top-0 inset-x-0 z-20 h-12 px-4 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-white/10 select-none">
      {/* Left: Brand & Probe Switcher */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => { setCameraTarget('overview'); setIsFollowingSpacecraft(false); }}
          className="flex items-center gap-2 cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
        >
          <img src="/image00.png" alt="Voyager Patch" className="w-6 h-6 object-contain" />
          <span className="text-xs font-mono font-semibold tracking-widest text-slate-200 uppercase">
            Voyager Mission Simulator
          </span>
        </div>

        {/* Minimal Probe Pills */}
        <div className="flex items-center bg-white/5 p-0.5 rounded border border-white/10 text-xs font-mono">
          <button
            onClick={() => handleSelectSpacecraft('voyager1')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedSpacecraft === 'voyager1'
                ? 'bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>VOYAGER 1</span>
            {v1Current && <span className="opacity-60 text-[10px]">{v1Current.dist.toFixed(0)} AU</span>}
          </button>

          <button
            onClick={() => handleSelectSpacecraft('voyager2')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedSpacecraft === 'voyager2'
                ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>VOYAGER 2</span>
            {v2Current && <span className="opacity-60 text-[10px]">{v2Current.dist.toFixed(0)} AU</span>}
          </button>
        </div>
      </div>

      {/* Center: Camera Target Presets */}
      <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
        {targets.map(t => (
          <button
            key={t.id}
            onClick={() => {
              setCameraTarget(t.id);
              if (t.id === 'voyager1' || t.id === 'voyager2') {
                setSelectedSpacecraft(t.id);
                setIsFollowingSpacecraft(true);
              } else {
                setIsFollowingSpacecraft(false);
              }
            }}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              cameraTarget === t.id
                ? 'text-white bg-white/10 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Overlays toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            title="Display Overlays"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Layers</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLayers && (
            <div className="absolute right-0 mt-2 w-52 p-2 rounded-lg bg-slate-950/95 border border-white/10 shadow-2xl backdrop-blur-md z-30 font-mono text-xs space-y-1">
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer text-slate-300">
                <span>Voyager 1 Path</span>
                <input
                  type="checkbox"
                  checked={showVoyager1Trajectory}
                  onChange={toggleVoyager1Trajectory}
                  className="rounded accent-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer text-slate-300">
                <span>Voyager 2 Path</span>
                <input
                  type="checkbox"
                  checked={showVoyager2Trajectory}
                  onChange={toggleVoyager2Trajectory}
                  className="rounded accent-amber-500"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer text-slate-300">
                <span>Planetary Orbits</span>
                <input
                  type="checkbox"
                  checked={showPlanetaryOrbits}
                  onChange={togglePlanetaryOrbits}
                  className="rounded accent-sky-500"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer text-slate-300">
                <span>Heliosphere Shells</span>
                <input
                  type="checkbox"
                  checked={showHeliosphereBoundaries}
                  onChange={toggleHeliosphereBoundaries}
                  className="rounded accent-rose-500"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer text-slate-300">
                <span>Milestone Pins</span>
                <input
                  type="checkbox"
                  checked={showEventMarkers}
                  onChange={toggleEventMarkers}
                  className="rounded accent-sky-500"
                />
              </label>
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer text-slate-300">
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

        {/* Golden Record button */}
        <button
          onClick={onOpenGoldenRecord}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono transition-colors cursor-pointer"
          title="The Golden Record"
        >
          <Disc className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Golden Record</span>
        </button>

        {/* Reset Camera */}
        <button
          onClick={() => {
            setCameraTarget('overview');
            setIsFollowingSpacecraft(false);
          }}
          className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Reset Camera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Science Info */}
        <button
          onClick={onOpenInfo}
          className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Documentation & Scientific Grounding"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
