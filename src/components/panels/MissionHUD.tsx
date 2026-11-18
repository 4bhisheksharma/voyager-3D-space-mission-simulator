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
  Maximize2
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
    selectedEvent
  } = useSimulation();

  const isV1 = selectedSpacecraft === 'voyager1';
  const name = isV1 ? 'Voyager 1' : 'Voyager 2';
  const launchDateStr = isV1 ? '1977-09-05T12:56:00Z' : '1977-08-20T14:29:00Z';
  const current = isV1 ? v1Current : v2Current;
  const closestPlanet = isV1 ? closestPlanetV1 : closestPlanetV2;
  const accentColor = isV1 ? 'text-emerald-400' : 'text-amber-400';
  const dotColor = isV1 ? 'bg-emerald-400' : 'bg-amber-400';

  const jd = useMemo(() => 2440587.5 + currentTimeMs / 86400000.0, [currentTimeMs]);

  // Distance from Earth
  const distFromEarthAU = useMemo(() => {
    if (!current) return 0;
    const earthPos = getPlanetPositionAU('earth', jd);
    return distance3D([current.x, current.y, current.z], earthPos);
  }, [current, jd]);

  const met = useMemo(() => {
    return getMissionElapsedTime(launchDateStr, currentTimeMs);
  }, [launchDateStr, currentTimeMs]);

  const missionPhase = useMemo(() => {
    if (!current) return 'Pre-launch';
    const year = new Date(currentTimeMs).getUTCFullYear();
    if (current.dist > 121) return 'Interstellar Space';
    if (current.dist > 84) return 'Heliosheath Crossing';
    if (year >= 1990) return 'Interstellar Mission (VIM)';
    if (year >= 1986 && !isV1) return 'Ice Giants (Uranus / Neptune)';
    if (year >= 1979) return 'Planetary Grand Tour';
    return 'Earth Departure';
  }, [current, currentTimeMs, isV1]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterCraft !== 'all' && e.spacecraft !== filterCraft) return false;
      return true;
    });
  }, [events, filterCraft]);

  // Collapsed Minimalist Pill
  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="absolute top-14 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 border border-white/10 backdrop-blur-md text-xs font-mono text-slate-200 cursor-pointer shadow-lg transition-all"
      >
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="font-semibold">{name}</span>
        {current && (
          <>
            <span className="text-slate-500">•</span>
            <span>{current.dist.toFixed(1)} AU</span>
            <span className="text-slate-500">•</span>
            <span>{current.speed.toFixed(1)} km/s</span>
          </>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </div>
    );
  }

  // Expanded Minimalist Drawer
  return (
    <aside className="absolute top-14 right-4 z-20 w-80 sm:w-84 max-h-[calc(100vh-140px)] flex flex-col rounded-xl bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl font-mono text-slate-200 select-none overflow-hidden">
      {/* Top Bar with Spacecraft Switcher and Minimize */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-1.5">
          <div className="flex bg-black/60 p-0.5 rounded border border-white/10 text-[11px]">
            <button
              onClick={() => setSelectedSpacecraft('voyager1')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                isV1 ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              V1
            </button>
            <button
              onClick={() => setSelectedSpacecraft('voyager2')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                !isV1 ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
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
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
            tab === 'telemetry' ? 'text-white border-b border-white font-medium bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          Telemetry
        </button>
        <button
          onClick={() => setTab('milestones')}
          className={`flex-1 py-1.5 transition-colors cursor-pointer ${
            tab === 'milestones' ? 'text-white border-b border-white font-medium bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          Milestones
        </button>
      </div>

      {/* Tab 1: Telemetry */}
      {tab === 'telemetry' && current && (
        <div className="p-3.5 flex flex-col gap-3 overflow-y-auto text-xs">
          {/* Phase readout */}
          <div className="flex items-center justify-between text-[11px] pb-1 border-b border-white/5">
            <span className="text-slate-400">Mission Phase</span>
            <span className="text-white font-medium">{missionPhase}</span>
          </div>

          {/* Core Telemetry 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400">Distance (Sun)</span>
              <span className="text-sm font-bold text-white mt-0.5">{current.dist.toFixed(2)} AU</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{(current.dist * AU_TO_KM / 1e6).toFixed(0)}M km</span>
            </div>

            <div className="p-2 rounded bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400">Velocity</span>
              <span className="text-sm font-bold text-white mt-0.5">{current.speed.toFixed(1)} km/s</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{(current.speed * 2236.94).toLocaleString(undefined, { maximumFractionDigits: 0 })} mph</span>
            </div>

            <div className="p-2 rounded bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400">Distance (Earth)</span>
              <span className="text-sm font-bold text-white mt-0.5">{distFromEarthAU.toFixed(2)} AU</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{(distFromEarthAU * AU_TO_KM / 1e6).toFixed(0)}M km</span>
            </div>

            <div className="p-2 rounded bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400">Light Travel Time</span>
              <span className="text-xs font-bold text-white mt-0.5 truncate">{getLightTimeFormatted(distFromEarthAU)}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">One-way</span>
            </div>
          </div>

          {/* Mission Elapsed Time */}
          <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
            <span className="text-slate-400">Mission Elapsed Time</span>
            <span className="text-white font-medium">{met}</span>
          </div>

          {/* 3D Coordinates */}
          <div className="flex flex-col gap-1 text-[11px]">
            <span className="text-slate-400 text-[10px] uppercase">3D Coordinates (AU)</span>
            <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
              <div className="p-1 rounded bg-white/5">X {current.x.toFixed(2)}</div>
              <div className="p-1 rounded bg-white/5">Y {current.y.toFixed(2)}</div>
              <div className="p-1 rounded bg-white/5">Z {current.z.toFixed(2)}</div>
            </div>
          </div>

          {/* Closest Planet */}
          {closestPlanet && (
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
              <span className="text-slate-400">Closest Body</span>
              <span className="text-white">
                {closestPlanet.name} ({(closestPlanet.distanceKm / 1e6).toFixed(1)}M km)
              </span>
            </div>
          )}

          {/* Camera Focus Controls */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setCameraTarget(selectedSpacecraft);
                setIsFollowingSpacecraft(true);
              }}
              className="flex-1 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Craft</span>
            </button>

            <button
              onClick={() => setIsFollowingSpacecraft(!isFollowingSpacecraft)}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-1 cursor-pointer text-xs ${
                isFollowingSpacecraft
                  ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10'
                  : 'border-white/10 text-slate-400 hover:text-white'
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
              className={`flex-1 py-0.5 rounded transition-colors cursor-pointer ${
                filterCraft === 'all' ? 'bg-white/20 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterCraft('voyager1')}
              className={`flex-1 py-0.5 rounded transition-colors cursor-pointer ${
                filterCraft === 'voyager1' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Voyager 1
            </button>
            <button
              onClick={() => setFilterCraft('voyager2')}
              className={`flex-1 py-0.5 rounded transition-colors cursor-pointer ${
                filterCraft === 'voyager2' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'
              }`}
            >
              Voyager 2
            </button>
          </div>

          {/* List */}
          <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto">
            {filteredEvents.map(event => {
              const isSelected = selectedEvent?.id === event.id;
              const evTime = new Date(event.date).getTime();
              const isPast = currentTimeMs >= evTime;

              return (
                <div
                  key={event.id}
                  onClick={() => jumpToEvent(event)}
                  className={`p-2 rounded border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-white/15 border-white/40 text-white'
                      : isPast
                      ? 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                      : 'bg-transparent border-transparent opacity-60 hover:opacity-100 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-white">{event.title}</span>
                    <span className="text-slate-400">{event.date.slice(0, 10)}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed font-sans">
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
