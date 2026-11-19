import React, { useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  ChevronLeft, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { useSimulation, SPEED_PRESETS } from '../../context/SimulationContext';
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

  const dateStr = useMemo(() => {
    return currentDate.toISOString().slice(0, 10);
  }, [currentDate]);

  const timeStr = useMemo(() => {
    return currentDate.toISOString().slice(11, 19) + ' UTC';
  }, [currentDate]);

  const jd = useMemo(() => {
    return unixMsToJulianDate(currentTimeMs).toFixed(1);
  }, [currentTimeMs]);

  // Major mission milestones along the timeline
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
    <footer className="absolute bottom-0 inset-x-0 z-30 px-3 sm:px-6 py-2.5 bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-2.5">
        {/* Sleek Timeline Scrubber */}
        <div className="relative w-full flex items-center group py-1">
          {/* Background Track */}
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden relative">
            {/* Luminous Gradient Travelled Fill */}
            <div 
              className="h-full bg-linear-to-r from-emerald-500 via-sky-400 to-amber-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all duration-75"
              style={{ width: `${currentPercent}%` }}
            />
          </div>

          {/* Precision Milestone Ticks (Discrete, perfectly centered, no ugly overlapping bars) */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
            {timelineTicks.map(({ event, percent }) => (
              <div
                key={event.id}
                style={{ left: `${percent}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-auto"
              >
                <button
                  onClick={() => jumpToEvent(event)}
                  title={`${event.title} (${new Date(event.date).getFullYear()})`}
                  className={`w-0.5 h-2 rounded-full transition-all cursor-pointer ${
                    percent <= currentPercent
                      ? 'bg-sky-300 hover:bg-white hover:h-3'
                      : 'bg-white/30 hover:bg-white/80 hover:h-3'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Scrubber Thumb Indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 -ml-1.25 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] pointer-events-none transition-transform group-hover:scale-125"
            style={{ left: `${currentPercent}%` }}
          />

          {/* Invisible Interactive Range Input */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.01"
            value={currentPercent}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        {/* Unified Flight Deck Controls (Strictly aligned heights & balanced padding) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
          {/* Transport Controls (Unified Segmented Control - exactly h-8) */}
          <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/10 h-8">
            <button
              onClick={resetToStart}
              className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Reset to 1977 Launch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => stepDays(-30)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Step -30 Days"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setDirection(-1);
                if (!isPlaying) togglePlay();
              }}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                isPlaying && playbackDirection === -1
                  ? 'bg-rose-500/25 text-rose-300 font-semibold border border-rose-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Play Reverse"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause Primary Button (Uniform h-7 height) */}
            <button
              onClick={togglePlay}
              className={`h-7 px-3 rounded-md flex items-center gap-1.5 font-semibold text-xs transition-all cursor-pointer shadow-xs ${
                isPlaying
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-sky-500 text-white hover:bg-sky-400'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => {
                setDirection(1);
                if (!isPlaying) togglePlay();
              }}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                isPlaying && playbackDirection === 1
                  ? 'bg-sky-500/25 text-sky-300 font-semibold border border-sky-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Play Forward"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => stepDays(30)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Step +30 Days"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-white/10 mx-0.5" />

            <button
              onClick={jumpToPresent}
              className="h-7 px-2 rounded-md flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Jump to Present (2026)"
            >
              <Clock className="w-3 h-3 text-sky-400" />
              <span className="hidden sm:inline font-medium">Present</span>
            </button>
          </div>

          {/* Time Readout Box (Matching h-8 height, No green dot) */}
          <div className="flex items-center gap-2 px-3 h-8 rounded-lg bg-white/5 border border-white/10 text-xs">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="font-semibold text-white tracking-wider">{dateStr}</span>
            <span className="text-zinc-400 text-[11px]">{timeStr}</span>
            <span className="text-zinc-600 hidden md:inline">•</span>
            <span className="text-zinc-400 hidden md:inline text-[11px]">JD {jd}</span>
          </div>

          {/* Speed Presets Selector (Matching h-8 height, aligned padding) */}
          <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/10 h-8 text-[11px]">
            {SPEED_PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => setSpeed(preset.value)}
                className={`h-7 px-2 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  playbackSpeed === preset.value
                    ? 'bg-white/20 text-white font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                {preset.label.replace('/s', '').replace('Realtime (1×)', '1×')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};