import React, { useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  StepBack, 
  StepForward, 
  Calendar,
  Clock,
  Zap
} from 'lucide-react';
import { useSimulation, SPEED_PRESETS, PRESENT_DAY_MS } from '../../context/SimulationContext';
import { unixMsToJulianDate } from '../../utils/astronomy';

export const PlaybackControls: React.FC = () => {
  const {
    currentTimeMs,
    isPlaying,
    playbackSpeed,
    playbackDirection,
    minTimeMs,
    maxTimeMs,
    togglePlay,
    setSpeed,
    setDirection,
    seekToTime,
    stepDays,
    resetToStart,
    jumpToPresent,
    events,
    jumpToEvent
  } = useSimulation();

  const currentDate = useMemo(() => new Date(currentTimeMs), [currentTimeMs]);
  const formattedDate = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  }, [currentDate]);

  const formattedTime = useMemo(() => {
    return currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    }) + ' UTC';
  }, [currentDate]);

  const jd = useMemo(() => unixMsToJulianDate(currentTimeMs).toFixed(2), [currentTimeMs]);

  // Major milestone ticks on the timeline scrubber
  const timelineTicks = useMemo(() => {
    const keyEventIds = [
      'v2-launch',
      'v1-launch',
      'v1-jupiter',
      'v1-saturn',
      'v2-uranus',
      'v2-neptune',
      'v1-pale-blue-dot',
      'v1-termination-shock',
      'v1-interstellar',
      'v1-present'
    ];
    return events
      .filter(e => keyEventIds.includes(e.id))
      .map(e => {
        const t = new Date(e.date).getTime();
        const percent = ((t - minTimeMs) / (maxTimeMs - minTimeMs)) * 100;
        return {
          event: e,
          percent: Math.max(0, Math.min(100, percent))
        };
      });
  }, [events, minTimeMs, maxTimeMs]);

  const currentPercent = Math.max(0, Math.min(100, ((currentTimeMs - minTimeMs) / (maxTimeMs - minTimeMs)) * 100));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const timeMs = minTimeMs + (val / 100) * (maxTimeMs - minTimeMs);
    seekToTime(timeMs);
  };

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-20 px-4 py-3 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Top bar: Interactive Timeline with Scrubbing and Milestone markers */}
        <div className="flex flex-col gap-1">
          <div className="relative w-full flex items-center group">
            {/* Custom slider input */}
            <input
              type="range"
              min="0"
              max="100"
              step="0.01"
              value={currentPercent}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-hidden hover:bg-slate-700/80 transition-colors"
            />

            {/* Event Markers along the timeline */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
              {timelineTicks.map(({ event, percent }) => (
                <div
                  key={event.id}
                  style={{ left: `${percent}%` }}
                  className="absolute -translate-x-1/2 pointer-events-auto group/pin"
                >
                  <button
                    onClick={() => jumpToEvent(event)}
                    title={`${event.short} (${new Date(event.date).getFullYear()})`}
                    className="w-2.5 h-2.5 rounded-full bg-slate-400 hover:bg-sky-400 hover:scale-125 transition-all border border-slate-900 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Timeline labels (1977 -> 2026 -> 2220) */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-0.5">
            <span>Aug 1977 (Launch)</span>
            <span className="hidden sm:inline">1979-1989 (Flybys)</span>
            <span className="text-sky-400 font-semibold cursor-pointer hover:underline" onClick={jumpToPresent}>
              Nov 2026 (Present Day)
            </span>
            <span className="hidden sm:inline">2012 / 2018 (Interstellar)</span>
            <span>Dec 2220 (Trajectory Horizon)</span>
          </div>
        </div>

        {/* Bottom bar: Controls, Date/Time Telemetry, Speed Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Playback transport controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Reset to Start */}
            <button
              onClick={resetToStart}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset Simulation to 1977 Launch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Step -30 Days */}
            <button
              onClick={() => stepDays(-30)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Step Backward 30 Days"
            >
              <StepBack className="w-3.5 h-3.5" />
            </button>

            {/* Reverse Direction */}
            <button
              onClick={() => {
                setDirection(-1);
                if (!isPlaying) togglePlay();
              }}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isPlaying && playbackDirection === -1
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs shadow-rose-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Play Backward (Reverse Time)"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>

            {/* Main Play / Pause */}
            <button
              onClick={togglePlay}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/25'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>PLAY</span>
                </>
              )}
            </button>

            {/* Forward Direction */}
            <button
              onClick={() => {
                setDirection(1);
                if (!isPlaying) togglePlay();
              }}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isPlaying && playbackDirection === 1
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-xs shadow-sky-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Play Forward (Advance Time)"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            {/* Step +30 Days */}
            <button
              onClick={() => stepDays(30)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Step Forward 30 Days"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>

            {/* Jump to Present Day */}
            <button
              onClick={jumpToPresent}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono transition-colors cursor-pointer"
              title="Jump to Present Day (2026)"
            >
              <Clock className="w-3 h-3 text-sky-400" />
              <span>Today</span>
            </button>
          </div>

          {/* Center: Mission Time Telemetry */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 font-mono">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs sm:text-sm font-bold tracking-wider">{formattedDate}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-xs text-slate-400">
              {formattedTime}
            </div>
            <span className="hidden sm:inline text-slate-600">|</span>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <span className="text-slate-400">JD</span>
              <span className="text-slate-200">{jd}</span>
            </div>
          </div>

          {/* Right: Simulation Speed Preset Selector */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-xs font-mono text-slate-400 mr-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="hidden lg:inline">Speed:</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {SPEED_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setSpeed(preset.value)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    playbackSpeed === preset.value
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {preset.label.replace('/s', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

