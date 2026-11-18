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
    <footer className="absolute bottom-0 inset-x-0 z-20 px-6 py-3 bg-black/70 backdrop-blur-md border-t border-white/10 select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">
        {/* Timeline Scrubber */}
        <div className="relative w-full flex items-center group py-1">
          <input
            type="range"
            min="0"
            max="100"
            step="0.01"
            value={currentPercent}
            onChange={handleSliderChange}
            className="w-full h-1 bg-white/15 rounded appearance-none cursor-pointer accent-white hover:bg-white/25 focus:outline-hidden transition-colors"
          />

          {/* Event Notches */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
            {timelineTicks.map(({ event, percent }) => (
              <div
                key={event.id}
                style={{ left: `${percent}%` }}
                className="absolute -translate-x-1/2 pointer-events-auto"
              >
                <button
                  onClick={() => jumpToEvent(event)}
                  title={`${event.title} (${new Date(event.date).getFullYear()})`}
                  className="w-1.5 h-3 bg-white/40 hover:bg-white hover:h-4 transition-all cursor-pointer rounded-xs"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Controls and Telemetry Readout */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Transport buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={resetToStart}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset to 1977 Launch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => stepDays(-30)}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Step -30 Days"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setDirection(-1);
                if (!isPlaying) togglePlay();
              }}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isPlaying && playbackDirection === -1
                  ? 'text-rose-400 bg-rose-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Play Reverse"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="px-3 py-1 rounded bg-white text-black font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer ml-1 mr-1"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => {
                setDirection(1);
                if (!isPlaying) togglePlay();
              }}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isPlaying && playbackDirection === 1
                  ? 'text-sky-400 bg-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Play Forward"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => stepDays(30)}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Step +30 Days"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={jumpToPresent}
              className="ml-2 px-2 py-1 rounded hover:bg-white/10 text-slate-400 hover:text-white text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              title="Jump to Present (2026)"
            >
              <Clock className="w-3 h-3" />
              <span>Today</span>
            </button>
          </div>

          {/* Time Readout */}
          <div className="flex items-center gap-3 text-slate-200">
            <span className="font-semibold text-white tracking-wider">{dateStr}</span>
            <span className="text-slate-400">{timeStr}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">JD {jd}</span>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded border border-white/10 text-[11px]">
            {SPEED_PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => setSpeed(preset.value)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  playbackSpeed === preset.value
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
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
