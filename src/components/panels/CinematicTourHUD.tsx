import React, { useEffect, useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Compass, 
  Calendar, 
  Sparkles,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const CinematicTourHUD: React.FC = () => {
  const {
    isCinematicTour,
    tourStageIndex,
    tourStages,
    nextTourStage,
    prevTourStage,
    setTourStage,
    stopCinematicTour,
    selectedSpacecraft
  } = useSimulation();

  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const timerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const stage = tourStages[tourStageIndex] || tourStages[0];

  // Auto-advance timer logic
  useEffect(() => {
    if (!isCinematicTour || isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const durationMs = (stage?.durationSec || 15) * 1000;
    const intervalMs = 100;
    const startTime = performance.now();

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const frac = Math.min(1.0, elapsed / durationMs);
      setProgress(frac);
    }, intervalMs);

    timerRef.current = window.setTimeout(() => {
      nextTourStage();
    }, durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isCinematicTour, tourStageIndex, isPaused, nextTourStage, stage]);

  // Keyboard navigation: Esc exits, Left/Right changes stage, Space toggles pause
  useEffect(() => {
    if (!isCinematicTour) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        stopCinematicTour();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextTourStage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevTourStage();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCinematicTour, stopCinematicTour, nextTourStage, prevTourStage]);

  if (!isCinematicTour || !stage) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-3 sm:p-6 select-none">
      {/* Top Bar: Grand Tour Status & Exit Button */}
      <div className="pointer-events-auto flex items-center justify-between w-full max-w-5xl mx-auto pt-1 sm:pt-2">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-sky-400/30 shadow-lg shadow-black/80">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span className="text-[11px] font-mono font-semibold tracking-wider text-sky-200 uppercase">
            Autopilot Grand Tour
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-[11px] font-mono text-zinc-300">
            Stage {tourStageIndex + 1} of {tourStages.length}
          </span>
        </div>

        <button
          onClick={stopCinematicTour}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/85 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-white/15 backdrop-blur-xl shadow-lg transition-all cursor-pointer font-mono text-[11px]"
          title="Exit Cinematic Tour (Esc)"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Tour</span>
          <kbd className="hidden sm:inline px-1 py-0.2 bg-white/10 rounded text-[9px] text-zinc-400 ml-1">ESC</kbd>
        </button>
      </div>

      {/* Bottom Floating Narrative & Flight Deck HUD */}
      <div className="pointer-events-auto w-full max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950/92 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-4 sm:p-5 flex flex-col gap-3 font-mono">
          
          {/* Timeline stage indicator ticks */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2 w-full pb-1">
            {tourStages.map((st, idx) => {
              const isCurrent = idx === tourStageIndex;
              const isPast = idx < tourStageIndex;
              return (
                <button
                  key={st.id}
                  onClick={() => setTourStage(idx)}
                  className={`group relative h-1.5 rounded-full transition-all cursor-pointer overflow-hidden ${
                    isCurrent 
                      ? 'bg-sky-400 ring-2 ring-sky-400/40' 
                      : isPast 
                        ? 'bg-sky-500/50 hover:bg-sky-400/70' 
                        : 'bg-white/15 hover:bg-white/30'
                  }`}
                  title={`${idx + 1}. ${st.title}`}
                >
                  {isCurrent && !isPaused && (
                    <div 
                      className="absolute inset-y-0 left-0 bg-white"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Stage Metadata Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-semibold tracking-wider uppercase">
                  {stage.craft === 'voyager1' ? 'Voyager 1' : 'Voyager 2'}
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {stage.subtitle}
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-bold tracking-tight text-white uppercase">
                {stage.title}
              </h2>
            </div>

            {/* Transport & Control Buttons */}
            <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
              <button
                onClick={prevTourStage}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Previous Milestone (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPaused(p => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 transition-all cursor-pointer text-xs font-semibold"
                title="Pause / Resume Auto-Tour (Space)"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                <span className="text-[11px] uppercase tracking-wider">{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={nextTourStage}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Next Milestone (→)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Historical Narrative Description */}
          <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-sans font-normal opacity-95">
            {stage.description}
          </p>

          {/* Micro Telemetry Bar */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/5 font-mono">
            <div className="flex items-center gap-3">
              <span>TARGET: <strong className="text-zinc-200 uppercase">{stage.target}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">MODE: <strong className="text-zinc-200">ORBITAL SWEEP</strong></span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span>{Math.max(0, Math.ceil((1 - progress) * (stage.durationSec || 15)))}s next</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
