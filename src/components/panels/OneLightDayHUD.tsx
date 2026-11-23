import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Sparkles, 
  Radio, 
  Volume2, 
  VolumeX, 
  Compass, 
  Zap, 
  ChevronRight,
  Sun,
  Globe
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  getOneLightDayFlightState, 
  ONE_LIGHT_DAY_STAGES, 
  AU_TO_KM, 
  SPEED_OF_LIGHT_KMS 
} from '../../utils/astronomy';

export const OneLightDayHUD: React.FC = () => {
  const {
    isOneLightDaySimulation,
    oneLightDayProgress,
    setOneLightDayProgress,
    oneLightDaySpeed,
    setOneLightDaySpeed,
    isOneLightDayPlaying,
    toggleOneLightDayPlay,
    replayOneLightDaySimulation,
    stopOneLightDaySimulation
  } = useSimulation();

  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Flight calculations
  const flight = useMemo(() => {
    return getOneLightDayFlightState(oneLightDayProgress);
  }, [oneLightDayProgress]);

  // Audio drone synthesizer (ambient space frequency)
  useEffect(() => {
    if (!soundEnabled || !isOneLightDaySimulation) {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (e) {
          // ignore
        }
        oscRef.current = null;
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pitch gently shifts as you travel deeper into interstellar space
      const baseFreq = 120 - oneLightDayProgress * 55; // 120Hz down to 65Hz
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      // Audio not supported or blocked
    }

    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (e) {}
        oscRef.current = null;
      }
    };
  }, [soundEnabled, isOneLightDaySimulation]);

  // Update audio frequency smoothly as progress changes
  useEffect(() => {
    if (oscRef.current && audioCtxRef.current && soundEnabled) {
      const freq = 120 - oneLightDayProgress * 55;
      oscRef.current.frequency.setTargetAtTime(freq, audioCtxRef.current.currentTime, 0.1);
    }
  }, [oneLightDayProgress, soundEnabled]);

  // Keyboard navigation (ESC to exit, Space to toggle play)
  useEffect(() => {
    if (!isOneLightDaySimulation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        stopOneLightDaySimulation();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        toggleOneLightDayPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOneLightDaySimulation, stopOneLightDaySimulation, toggleOneLightDayPlay]);

  if (!isOneLightDaySimulation) return null;

  const isCompleted = oneLightDayProgress >= 0.999;

  // Format Billions of km
  const billionsKm = (flight.distKm / 1e9).toFixed(2);
  // Distance from Earth (~0.46 AU greater due to Earth position in Oct 2026)
  const distEarthAU = Math.min(173.14, flight.distAU + 0.46 * (flight.distAU / 172.68));
  const billionsKmEarth = ((distEarthAU * AU_TO_KM) / 1e9).toFixed(2);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-3 sm:p-6 select-none font-mono">
      {/* Top Bar: Mission Status & Header */}
      <div className="pointer-events-auto flex items-center justify-between w-full max-w-6xl mx-auto pt-1 sm:pt-2">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-2xl border border-sky-400/40 shadow-2xl shadow-black">
          <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-bold tracking-wider text-sky-200 uppercase">
              Voyager 1 • 1 Light Day Journey
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-[10px] sm:text-[11px] text-amber-400 font-semibold hidden sm:inline">
              24.00h Comm Horizon
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(s => !s)}
            className={`p-2 rounded-full border backdrop-blur-xl shadow-lg transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                : 'bg-zinc-900/85 border-white/10 text-zinc-400 hover:text-zinc-200'
            }`}
            title={soundEnabled ? 'Mute Cosmic Ambient Audio' : 'Enable Cosmic Ambient Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Exit Button */}
          <button
            onClick={stopOneLightDaySimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/85 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/15 backdrop-blur-xl shadow-lg transition-all cursor-pointer text-xs"
            title="Exit 1 Light Day Flight (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Flight</span>
            <kbd className="hidden sm:inline px-1 py-0.2 bg-white/10 rounded text-[9px] text-zinc-400 ml-1">ESC</kbd>
          </button>
        </div>
      </div>

      {/* Bottom Main Flight Console */}
      <div className="pointer-events-auto w-full max-w-4xl mx-auto flex flex-col gap-2.5">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950/92 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 sm:p-5 flex flex-col gap-4">
          
          {/* Top Row: Digital Light Travel Time Telemetry & Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-white/10">
            {/* 1. Large Light Travel Time */}
            <div className="sm:col-span-1 flex flex-col justify-center bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Light Travel Time</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white tracking-tight text-amber-300 font-mono drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                {flight.formattedLightTime}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Target: 24h 00m 00s (1 Light Day)
              </div>
            </div>

            {/* 2. Distance from Sun & Earth */}
            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col justify-center">
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Sun Distance</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-zinc-100">
                  {flight.distAU.toFixed(2)} <span className="text-xs text-zinc-400">AU</span>
                </div>
                <div className="text-[10px] text-zinc-500">
                  {billionsKm} Billion km
                </div>
              </div>

              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col justify-center">
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">
                  <Globe className="w-3 h-3 text-sky-400" />
                  <span>Earth Distance</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-sky-200">
                  {distEarthAU.toFixed(2)} <span className="text-xs text-sky-400">AU</span>
                </div>
                <div className="text-[10px] text-zinc-500">
                  {billionsKmEarth} Billion km
                </div>
              </div>
            </div>
          </div>

          {/* Active Sector Narrative Banner */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping inline-block" />
                <span>{flight.stage.sector}</span>
              </div>
              <span className="text-[10px] text-zinc-400">
                {flight.stage.subtitle}
              </span>
            </div>
            <p className="text-xs font-sans text-zinc-300 leading-relaxed">
              {flight.stage.description}
            </p>
          </div>

          {/* Interactive Scrubbable Milestone Timeline Track */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="relative w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/10 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setOneLightDayProgress(frac);
              }}
            >
              {/* Progress Fill */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-400 transition-all duration-75"
                style={{ width: `${oneLightDayProgress * 100}%` }}
              />

              {/* Milestone Indicator Ticks */}
              {ONE_LIGHT_DAY_STAGES.map((s, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 w-0.5 bg-white/40 hover:bg-white transition-colors"
                  style={{ left: `${s.progressThreshold * 100}%` }}
                  title={`${s.sector} (${s.distAU} AU)`}
                />
              ))}
            </div>

            {/* Quick-Jump Milestone Buttons */}
            <div className="flex items-center justify-between text-[9px] text-zinc-400 overflow-x-auto no-scrollbar gap-1 pt-0.5">
              <button 
                onClick={() => setOneLightDayProgress(0)}
                className="hover:text-amber-300 transition-colors cursor-pointer shrink-0"
              >
                ☀️ Sun (0 AU)
              </button>
              <button 
                onClick={() => setOneLightDayProgress(0.12)}
                className="hover:text-sky-300 transition-colors cursor-pointer shrink-0"
              >
                🌍 Earth (1 AU)
              </button>
              <button 
                onClick={() => setOneLightDayProgress(0.35)}
                className="hover:text-amber-200 transition-colors cursor-pointer shrink-0"
              >
                🪐 Jupiter (5.2 AU)
              </button>
              <button 
                onClick={() => setOneLightDayProgress(0.48)}
                className="hover:text-amber-200 transition-colors cursor-pointer shrink-0"
              >
                🪐 Saturn (9.5 AU)
              </button>
              <button 
                onClick={() => setOneLightDayProgress(0.70)}
                className="hover:text-sky-200 transition-colors cursor-pointer shrink-0"
              >
                🔵 Neptune (30 AU)
              </button>
              <button 
                onClick={() => setOneLightDayProgress(0.82)}
                className="hover:text-purple-300 transition-colors cursor-pointer shrink-0"
              >
                ⚡ Term. Shock (94 AU)
              </button>
              <button 
                onClick={() => setOneLightDayProgress(0.90)}
                className="hover:text-sky-300 transition-colors cursor-pointer shrink-0"
              >
                🌌 Heliopause (121 AU)
              </button>
              <button 
                onClick={() => setOneLightDayProgress(0.98)}
                className="hover:text-emerald-300 text-emerald-400 font-bold transition-colors cursor-pointer shrink-0"
              >
                🛰️ 1 Light Day (173 AU)
              </button>
            </div>
          </div>

          {/* Bottom Controls Row: Play/Pause, Replay, Speed */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <button
                  onClick={replayOneLightDaySimulation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Journey</span>
                </button>
              ) : (
                <button
                  onClick={toggleOneLightDayPlay}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/40 transition-all cursor-pointer text-xs font-semibold"
                >
                  {isOneLightDayPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Flight</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume Flight</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={replayOneLightDaySimulation}
                className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Restart from Sun"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Flight Speed Selection */}
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-white/10 text-xs">
              <span className="text-[10px] text-zinc-500 px-1.5 hidden sm:inline">SPEED:</span>
              {[0.5, 1, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => setOneLightDaySpeed(speed)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    oneLightDaySpeed === speed
                      ? 'bg-sky-500/30 text-sky-300 border border-sky-400/40'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {speed}×
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
