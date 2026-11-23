import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Radio, 
  Compass, 
  Eye, 
  MapPin, 
  Clock, 
  Milestone,
  Activity,
  Maximize2,
  Signal,
  Sparkles
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  AU_TO_KM, 
  getLightTimeFormatted, 
  getMissionElapsedTime, 
  getPlanetPositionAU, 
  distance3D 
} from '../../utils/astronomy';
import { MissionEvent, SpacecraftId } from '../../types/simulation';

export const MissionHUD: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [tab, setTab] = useState<'telemetry' | 'milestones'>('telemetry');
  const [filterCraft, setFilterCraft] = useState<'all' | SpacecraftId>('all');

  const {
    selectedSpacecraft,
    setSelectedSpacecraft,
    v1Current,
    v2Current,
    currentTimeMs,
    closestPlanetV1,
    closestPlanetV2,
    cameraTarget,
    setCameraTarget,
    isFollowingSpacecraft,
    setIsFollowingSpacecraft,
    events,
    jumpToEvent,
    selectedEvent,
    startOneLightDaySimulation
  } = useSimulation();

  const isV1 = selectedSpacecraft === 'voyager1';
  const name = isV1 ? 'Voyager 1' : 'Voyager 2';
  const launchDateStr = isV1 ? '1977-09-05T12:56:00Z' : '1977-08-20T14:29:00Z';
  const current = isV1 ? v1Current : v2Current;
  const closestPlanet = isV1 ? closestPlanetV1 : closestPlanetV2;
  const accentColor = isV1 ? 'text-emerald-400' : 'text-amber-400';

  const jd = useMemo(() => 2440587.5 + currentTimeMs / 86400000.0, [currentTimeMs]);

  // Pre-launch state check
  const isPreLaunch = useMemo(() => {
    const launchMs = new Date(launchDateStr).getTime();
    return currentTimeMs < launchMs;
  }, [launchDateStr, currentTimeMs]);

  // Distance from Earth
  const distFromEarthAU = useMemo(() => {
    if (isPreLaunch) return 0;
    if (!current) return 0;
    const earthPos = getPlanetPositionAU('earth', jd);
    return distance3D([current.x, current.y, current.z], earthPos);
  }, [isPreLaunch, current, jd]);

  const met = useMemo(() => {
    return getMissionElapsedTime(launchDateStr, currentTimeMs);
  }, [launchDateStr, currentTimeMs]);

  const missionPhase = useMemo(() => {
    if (isPreLaunch) return 'Pre-launch (Cape Canaveral SLC-41)';
    if (!current) return 'Pre-launch';
    const year = new Date(currentTimeMs).getUTCFullYear();
    if (current.dist > 121) return 'Interstellar Space';
    if (current.dist > 84) return 'Heliosheath Crossing';
    if (year >= 1990) return 'Interstellar Mission (VIM)';
    if (year >= 1986 && !isV1) return 'Ice Giants (Uranus / Neptune)';
    if (year >= 1979) return 'Planetary Grand Tour';
    return 'Earth Departure';
  }, [isPreLaunch, current, currentTimeMs, isV1]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterCraft !== 'all' && e.spacecraft !== filterCraft) return false;
      return true;
    });
  }, [events, filterCraft]);

  // Heliosphere Journey Progress (% to Heliopause 121.6 AU)
  const heliopauseProgress = useMemo(() => {
    if (!current || isPreLaunch) return 0;
    return Math.min(100, Math.max(0, (current.dist / 121.6) * 100));
  }, [current, isPreLaunch]);

  // Collapsed Minimalist Pill
  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="absolute top-13 right-2 sm:right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/85 hover:bg-zinc-900 border border-white/15 backdrop-blur-xl text-xs font-mono text-zinc-200 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all hover:scale-105 active:scale-95"
      >
        <span className="font-semibold tracking-wider">{name}</span>
        {current && (
          <>
            <span className="text-zinc-600">•</span>
            <span className="text-sky-300 font-medium">{current.dist.toFixed(0)} AU</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-zinc-400">{current.speed.toFixed(1)} km/s</span>
          </>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
      </div>
    );
  }

  // Expanded Aerospace Drawer
  return (
    <aside className="absolute top-13 right-2 sm:right-4 z-20 w-[calc(100vw-16px)] max-w-72 sm:max-w-84 max-h-[calc(100vh-120px)] flex flex-col rounded-2xl bg-zinc-950/85 backdrop-blur-xl border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.8)] font-mono text-zinc-200 select-none overflow-hidden">
      {/* Top Bar with Spacecraft Switcher and Minimize */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="flex bg-black/60 p-0.5 rounded-lg border border-white/10 text-[11px]">
            <button
              onClick={() => setSelectedSpacecraft('voyager1')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                isV1 ? 'bg-emerald-500/25 text-emerald-300 font-semibold shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              V1
            </button>
            <button
              onClick={() => setSelectedSpacecraft('voyager2')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                !isV1 ? 'bg-amber-500/25 text-amber-300 font-semibold shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              V2
            </button>
          </div>

          <span className={`text-xs font-semibold tracking-wider uppercase ml-1 ${accentColor}`}>
            {name}
          </span>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Minimize HUD"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 text-xs text-center bg-black/40">
        <button
          onClick={() => setTab('telemetry')}
          className={`flex-1 py-1.5 transition-colors cursor-pointer ${
            tab === 'telemetry' ? 'text-white border-b-2 border-sky-400 font-semibold bg-white/5' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Telemetry
        </button>
        <button
          onClick={() => setTab('milestones')}
          className={`flex-1 py-1.5 transition-colors cursor-pointer ${
            tab === 'milestones' ? 'text-white border-b-2 border-sky-400 font-semibold bg-white/5' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Milestones
        </button>
      </div>

      {/* Tab 1: Telemetry */}
      {tab === 'telemetry' && current && (
        <div className="p-3.5 flex flex-col gap-2.5 overflow-y-auto text-xs">
          {/* Live DSN Signal Link Banner */}
          <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-[10px] text-emerald-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <Signal className="w-3 h-3 text-emerald-400" />
              <span>DSN CARRIER</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[9px] text-emerald-300 font-semibold tracking-wider px-1 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                LOCKED (70m SUB)
              </span>
            </div>
          </div>

          {/* Phase readout */}
          <div className="flex items-center justify-between text-[11px] pb-1 border-b border-white/5">
            <span className="text-zinc-400">Mission Phase</span>
            <span className="text-white font-medium truncate max-w-[170px] text-right">{missionPhase}</span>
          </div>

          {/* Heliosphere Journey Bar */}
          <div className="flex flex-col gap-1 p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-400">Heliosphere Progress</span>
              <span className="text-sky-300 font-semibold">{current.dist.toFixed(1)} / 121 AU</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-300 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all duration-300"
                style={{ width: `${heliopauseProgress}%` }}
              />
            </div>
          </div>

          {/* Core Telemetry 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[10px] text-zinc-400">Distance (Sun)</span>
              <span className="text-sm font-bold text-white mt-0.5">{current.dist.toFixed(2)} AU</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">{(current.dist * AU_TO_KM / 1e6).toFixed(0)}M km</span>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[10px] text-zinc-400">Velocity</span>
              <span className="text-sm font-bold text-white mt-0.5">
                {isPreLaunch ? '0.0 km/s' : `${current.speed.toFixed(1)} km/s`}
              </span>
              <span className="text-[10px] text-zinc-500 mt-0.5">
                {isPreLaunch ? 'Launch Pad SLC-41' : `${(current.speed * 2236.94).toLocaleString(undefined, { maximumFractionDigits: 0 })} mph`}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[10px] text-zinc-400">Distance (Earth)</span>
              <span className="text-sm font-bold text-white mt-0.5">{distFromEarthAU.toFixed(2)} AU</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">{(distFromEarthAU * AU_TO_KM / 1e6).toFixed(0)}M km</span>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[10px] text-zinc-400">Light Travel Time</span>
              <span className="text-xs font-bold text-white mt-0.5 truncate">{getLightTimeFormatted(distFromEarthAU)}</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">One-way transmission</span>
            </div>
          </div>

          {/* Mission Elapsed Time */}
          <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
            <span className="text-zinc-400">Mission Elapsed Time</span>
            <span className="text-white font-semibold">{met}</span>
          </div>

          {/* 3D Coordinates */}
          <div className="flex flex-col gap-1 text-[11px]">
            <span className="text-zinc-400 text-[10px] uppercase tracking-wider">3D Coordinates (AU)</span>
            <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
              <div className="p-1 rounded-lg bg-white/5 border border-white/5 text-zinc-300">X {current.x.toFixed(2)}</div>
              <div className="p-1 rounded-lg bg-white/5 border border-white/5 text-zinc-300">Y {current.y.toFixed(2)}</div>
              <div className="p-1 rounded-lg bg-white/5 border border-white/5 text-zinc-300">Z {current.z.toFixed(2)}</div>
            </div>
          </div>

          {/* Closest Planet */}
          {closestPlanet && (
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
              <span className="text-zinc-400">Closest Body</span>
              <span className="text-white font-medium">
                {closestPlanet.name} ({(closestPlanet.distanceKm / 1e6).toFixed(1)}M km)
              </span>
            </div>
          )}

          {/* 1 Light Day Milestone Banner */}
          {isV1 && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-sky-500/10 to-transparent border border-amber-500/30 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  1 Light Day Milestone
                </span>
                <span className="text-[9px] text-amber-400/80 font-mono">24.00h Horizon</span>
              </div>
              <p className="text-[10px] text-zinc-300 font-sans leading-tight">
                Voyager 1 surpasses 1 light day (25.9B km) from Earth. Simulate the cosmic light journey from the Sun.
              </p>
              <button
                onClick={startOneLightDaySimulation}
                className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[10px] font-semibold font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Simulate 1 Light Day Flight</span>
                <ChevronRight className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          )}

          {/* Camera Focus Controls */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setCameraTarget(selectedSpacecraft);
                setIsFollowingSpacecraft(true);
              }}
              className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs border border-white/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>View Craft</span>
            </button>

            <button
              onClick={() => setIsFollowingSpacecraft(!isFollowingSpacecraft)}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer text-xs ${
                isFollowingSpacecraft
                  ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/15 font-semibold shadow-xs'
                  : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>{isFollowingSpacecraft ? 'Locked' : 'Lock'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Milestones */}
      {tab === 'milestones' && (
        <div className="p-3 flex flex-col gap-2 overflow-y-auto text-xs">
          {/* Probe Filter */}
          <div className="flex gap-1 text-[10px] pb-1 border-b border-white/5">
            <button
              onClick={() => setFilterCraft('all')}
              className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                filterCraft === 'all' ? 'bg-white/20 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterCraft('voyager1')}
              className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                filterCraft === 'voyager1' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Voyager 1
            </button>
            <button
              onClick={() => setFilterCraft('voyager2')}
              className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                filterCraft === 'voyager2' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Voyager 2
            </button>
          </div>

          {/* List */}
          <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredEvents.map(event => {
              const isSelected = selectedEvent?.id === event.id;
              const evTime = new Date(event.date).getTime();
              const isPast = currentTimeMs >= evTime;

              return (
                <div
                  key={event.id}
                  onClick={() => jumpToEvent(event)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400/40 text-white shadow-xs'
                      : isPast
                      ? 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/15'
                      : 'bg-transparent border-transparent opacity-50 hover:opacity-100 text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-white tracking-wide">{event.title}</span>
                    <span className="text-zinc-400">{event.date.slice(0, 10)}</span>
                  </div>
                  <p className="text-[10px] text-zinc-300 line-clamp-2 leading-relaxed font-sans">
                    {event.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
