import React, { useMemo } from 'react';
import { 
  Radio, 
  Gauge, 
  MapPin, 
  Clock, 
  Compass, 
  Eye, 
  Activity,
  Globe2,
  ChevronRight,
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

export const TelemetryPanel: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const {
    selectedSpacecraft,
    v1Current,
    v2Current,
    currentTimeMs,
    closestPlanetV1,
    closestPlanetV2,
    cameraTarget,
    setCameraTarget,
    isFollowingSpacecraft,
    setIsFollowingSpacecraft,
    setSelectedSpacecraft
  } = useSimulation();

  const isV1 = selectedSpacecraft === 'voyager1';
  const name = isV1 ? 'Voyager 1' : 'Voyager 2';
  const launchDateStr = isV1 ? '1977-09-05T12:56:00Z' : '1977-08-20T14:29:00Z';
  const current = isV1 ? v1Current : v2Current;
  const closestPlanet = isV1 ? closestPlanetV1 : closestPlanetV2;
  const themeColor = isV1 ? 'text-emerald-400' : 'text-amber-400';
  const themeBg = isV1 ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-amber-500/20 border-amber-500/30';

  const jd = useMemo(() => {
    return 2440587.5 + currentTimeMs / 86400000.0;
  }, [currentTimeMs]);

  // Distance from Earth at current timestamp
  const distFromEarthAU = useMemo(() => {
    if (!current) return 0;
    const earthPos = getPlanetPositionAU('earth', jd);
    return distance3D([current.x, current.y, current.z], earthPos);
  }, [current, jd]);

  const met = useMemo(() => {
    return getMissionElapsedTime(launchDateStr, currentTimeMs);
  }, [launchDateStr, currentTimeMs]);

  // Determine Mission Phase based on distance and date
  const missionPhase = useMemo(() => {
    if (!current) return 'Pre-launch';
    const date = new Date(currentTimeMs);
    const year = date.getUTCFullYear();

    if (current.dist > 121) {
      return 'Interstellar Medium (Beyond Heliopause)';
    } else if (current.dist > 84) {
      return 'Heliosheath Boundary Exploration';
    } else if (year >= 1990) {
      return 'Voyager Interstellar Mission (VIM)';
    } else if (year >= 1986 && !isV1) {
      return 'Ice Giants Exploration (Uranus / Neptune)';
    } else if (year >= 1979) {
      return 'Planetary Grand Tour (Jupiter / Saturn)';
    } else {
      return 'Earth Departure & Interplanetary Cruise';
    }
  }, [current, currentTimeMs, isV1]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-16 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-mono text-slate-300 hover:text-white shadow-xl hover:bg-slate-900 transition-all cursor-pointer"
      >
        <Activity className="w-3.5 h-3.5 text-sky-400" />
        <span>Telemetry Panel</span>
      </button>
    );
  }

  return (
    <aside className="absolute top-14 right-4 z-20 w-80 sm:w-96 max-h-[calc(100vh-140px)] overflow-y-auto flex flex-col rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-2xl transition-all font-mono text-slate-200">
      {/* Header with Spacecraft switch and close toggle */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-900/60 sticky top-0 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-lg bg-slate-950 border border-slate-800">
            <button
              onClick={() => setSelectedSpacecraft('voyager1')}
              className={`px-2 py-1 text-[11px] rounded transition-all cursor-pointer ${
                isV1 ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              V1
            </button>
            <button
              onClick={() => setSelectedSpacecraft('voyager2')}
              className={`px-2 py-1 text-[11px] rounded transition-all cursor-pointer ${
                !isV1 ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              V2
            </button>
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${themeColor}`}>
            {name} TELEMETRY
          </span>
        </div>

        <button
          onClick={onToggle}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Minimize Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 flex flex-col gap-3.5 text-xs">
        {/* Spacecraft Visual Card */}
        <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900/80 p-3 flex items-center gap-3">
          <img
            src="/image01.jpg"
            alt="Voyager Spacecraft in Space"
            className="w-16 h-16 rounded-md object-cover border border-slate-700 shadow-md"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Status</span>
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              OPERATIONAL
            </span>
            <span className="text-[11px] text-slate-300">NASA JPL Deep Space Network</span>
            <span className="text-[10px] text-slate-400">Launch: {new Date(launchDateStr).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Mission Phase Badge */}
        <div className={`p-2.5 rounded-lg border flex flex-col gap-1 ${themeBg}`}>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            <Compass className="w-3 h-3 text-sky-400" />
            <span>Mission Phase</span>
          </div>
          <div className="text-xs font-semibold text-white">
            {missionPhase}
          </div>
        </div>

        {/* Vital Telemetry Grid */}
        {current && (
          <div className="grid grid-cols-2 gap-2">
            {/* Distance from Sun */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
                <Globe2 className="w-3 h-3 text-amber-400" />
                <span>Dist. Sun</span>
              </div>
              <div className="text-base font-bold text-amber-300">
                {current.dist.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">AU</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {(current.dist * AU_TO_KM / 1e6).toFixed(1)}M km
              </div>
            </div>

            {/* Heliocentric Velocity */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
                <Gauge className="w-3 h-3 text-sky-400" />
                <span>Speed</span>
              </div>
              <div className="text-base font-bold text-sky-300">
                {current.speed.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">km/s</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {(current.speed * 2236.94).toLocaleString(undefined, { maximumFractionDigits: 0 })} mph
              </div>
            </div>

            {/* Distance from Earth */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Dist. Earth</span>
              </div>
              <div className="text-base font-bold text-emerald-300">
                {distFromEarthAU.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">AU</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {(distFromEarthAU * AU_TO_KM / 1e6).toFixed(1)}M km
              </div>
            </div>

            {/* One-way Light Time */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider">
                <Radio className="w-3 h-3 text-purple-400" />
                <span>Light Time</span>
              </div>
              <div className="text-xs font-bold text-purple-300 truncate" title={getLightTimeFormatted(distFromEarthAU)}>
                {getLightTimeFormatted(distFromEarthAU)}
              </div>
              <div className="text-[10px] text-slate-400">One-way to Earth</div>
            </div>
          </div>
        )}

        {/* Mission Elapsed Time (MET) */}
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">Mission Elapsed Time</span>
              <span className="text-xs font-bold text-white">{met}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400">Since Launch</span>
        </div>

        {/* 3D Coordinates (AU) */}
        {current && (
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              3D Heliocentric Position (AU)
            </div>
            <div className="grid grid-cols-3 gap-1 font-mono text-[11px] text-center">
              <div className="bg-slate-950 p-1 rounded border border-slate-800">
                <span className="text-slate-400">X: </span>
                <span className="text-white">{current.x.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950 p-1 rounded border border-slate-800">
                <span className="text-slate-400">Y: </span>
                <span className="text-white">{current.y.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950 p-1 rounded border border-slate-800">
                <span className="text-slate-400">Z: </span>
                <span className="text-white">{current.z.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Closest Planet Encounter */}
        {closestPlanet && (
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">Closest Celestial Body</span>
              <span className="text-xs font-bold text-white">{closestPlanet.name}</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-sky-300">
                {closestPlanet.distanceKm > 1e6
                  ? `${(closestPlanet.distanceKm / 1e6).toFixed(1)}M km`
                  : `${closestPlanet.distanceKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`}
              </div>
              <div className="text-[10px] text-slate-400">
                {(closestPlanet.distanceKm / AU_TO_KM).toFixed(3)} AU
              </div>
            </div>
          </div>
        )}

        {/* Camera Quick Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => {
              setCameraTarget(selectedSpacecraft);
              setIsFollowingSpacecraft(true);
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              cameraTarget === selectedSpacecraft
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Focus Camera</span>
          </button>

          <button
            onClick={() => setIsFollowingSpacecraft(!isFollowingSpacecraft)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFollowingSpacecraft
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Keep camera locked onto spacecraft position as it moves"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isFollowingSpacecraft ? 'Following' : 'Follow'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

