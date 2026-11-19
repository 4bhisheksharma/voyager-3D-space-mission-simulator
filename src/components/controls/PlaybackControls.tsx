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

  // Milestone marks along the scrubber
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
    <footer className="absolute bottom-0 inset-x-0 z-30 px-3 sm:px-6 py-2 sm:py-3 bg-zinc-950/85 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">
        {/* Timeline Scrubber with Luminous Progress Fill */}
        <div className="relative w-full flex items-center group py-1">
          {/* Background Track */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
            {/* Luminous Gradient Travelled Fill */}
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-amber-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all duration-75"
              style={{ width: `${currentPercent}%` }}
            />
          </div>

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

          {/* Event Notches along Timeline */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
            {timelineTicks.map(({ event, percent }) => (
              <div
                key={event.id}
                style={{ left: `${percent}%` }}
                className="absolute -translate-x-1/2 pointer-events-auto group/tick"
              >
                <button
                  onClick={() => jumpToEvent(event)}
                  title={`${event.title} (${new Date(event.date).getFullYear()})`}
                  className={`w-1.5 h-3.5 rounded-full transition-all cursor-pointer shadow-xs ${
                    percent <= currentPercent
                      ? 'bg-sky-300 hover:bg-white hover:scale-125'
                      : 'bg-white/30 hover:bg-white/70 hover:scale-110'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Controls and Telemetry Readout */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          {/* Transport buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={resetToStart}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Reset to 1977 Launch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => stepDays(-30)}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Step -30 Days"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setDirection(-1);
                if (!isPlaying) togglePlay();
              }}
              className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPlaying && playbackDirection === -1
                  ? 'text-rose-400 bg-rose-500/20 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Play Reverse"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause Glowing Button */}
            <button
              onClick={togglePlay}
              className="px-3 py-1 rounded-lg bg-white text-black font-semibold hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer mx-1 text-xs shadow-[0_0_16px_rgba(255,255,255,0.3)]"
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => {
                setDirection(1);
                if (!isPlaying) togglePlay();
              }}
              className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPlaying && playbackDirection === 1
                  ? 'text-sky-400 bg-sky-500/20 border border-sky-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Play Forward"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => stepDays(30)}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Step +30 Days"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={jumpToPresent}
              className="ml-1 sm:ml-2 px-2 py-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white text-[10px] sm:text-[11px] transition-colors cursor-pointer flex items-center gap-1 border border-white/5"
              title="Jump to Present (2026)"
            >
              <Clock className="w-3 h-3 text-sky-400" />
              <span className="hidden sm:inline font-medium">Present</span>
            </button>
          </div>

          {/* Time Readout with Glass Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] sm:text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white tracking-wider">{dateStr}</span>
            <span className="text-zinc-400">{timeStr}</span>
            <span className="text-zinc-600 hidden md:inline">•</span>
            <span className="text-zinc-400 hidden md:inline">JD {jd}</span>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-[10px] sm:text-[11px]">
            {SPEED_PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => setSpeed(preset.value)}
                className={`px-1.5 sm:px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  playbackSpeed === preset.value
                    ? 'bg-white/25 text-white font-semibold shadow-xs'
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
