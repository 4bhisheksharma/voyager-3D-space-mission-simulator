import React from 'react';
import { X, Database, CheckCircle2, Globe2, Cpu } from 'lucide-react';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-xl bg-zinc-950 border border-white/10 shadow-2xl flex flex-col font-mono text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-white uppercase">
              Dataset & Scientific Grounding
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[65vh] flex flex-col gap-4 text-xs font-sans text-zinc-300 leading-relaxed">
          <div>
            <h3 className="font-mono text-xs font-semibold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              1. Historical JPL Datasets
            </h3>
            <p>
              The simulation is strictly driven by the original mission ephemeris files:
            </p>
            <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-zinc-400 list-disc list-inside">
              <li><strong className="text-zinc-200">orbit/voyager1.dat.gz:</strong> 6,681 JPL points (1977 to 2209).</li>
              <li><strong className="text-zinc-200">orbit/voyager2.dat.gz:</strong> 9,520 JPL points (1977 to 2220).</li>
              <li><strong className="text-zinc-200">models/voyager/voyager.glb:</strong> Official NASA VTAD 3D spacecraft model.</li>
              <li><strong className="text-zinc-200">models/planets/:</strong> High-fidelity planetary 3D models.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs font-semibold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
              2. Coordinate Frame Transformation
            </h3>
            <p>
              Celestia coordinates are transformed into Three.js J2000 ecliptic coordinates in Astronomical Units (1 AU = 149,597,870.7 km):
            </p>
            <div className="mt-1.5 p-2.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-zinc-300">
              <code>Three.js X = Celestia X (y_ecl) / 149,597,870.7 km</code><br />
              <code>Three.js Y = Celestia Y (z_ecl, Normal to Ecliptic) / 149,597,870.7 km</code><br />
              <code>Three.js Z = Celestia Z (x_ecl) / 149,597,870.7 km</code>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              This exact transformation matches NASA JPL planetary ephemerides for Jupiter, Saturn, Uranus, Neptune, and Earth at every encounter date to within 0.01 AU without any coordinate skew.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs font-semibold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              3. Continuous Interpolation & Optimization
            </h3>
            <p>
              Spacecraft telemetry is interpolated continuously using $O(\log N)$ binary search across timestamps. Optimization Mode allows users on lower-end devices to switch non-essential planets to lightweight procedural shaders while keeping Sun, Earth, and Voyager 3D models active.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white text-black font-semibold font-mono hover:bg-zinc-200 transition-colors cursor-pointer text-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
