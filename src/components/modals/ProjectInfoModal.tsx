import React from 'react';
import { X, Database, CheckCircle2, FileText, Globe2, Cpu } from 'lucide-react';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col font-mono text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider text-sky-300">
                DATASET & SCIENTIFIC GROUNDING
              </h2>
              <p className="text-[11px] text-slate-400">
                NASA JPL Ephemerides & Celestia/Gaia Sky Trajectory Integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[65vh] flex flex-col gap-4 text-xs font-sans text-slate-300 leading-relaxed">
          <div>
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              1. Primary Telemetry Datasets
            </h3>
            <p>
              The simulation is strictly driven by the project's original historical files:
            </p>
            <ul className="mt-1 space-y-1 font-mono text-[11px] text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-200">orbit/voyager1.dat.gz:</strong> 6,681 historical JPL trajectory points (1977 to 2209).</li>
              <li><strong className="text-slate-200">orbit/voyager2.dat.gz:</strong> 9,520 historical JPL trajectory points (1977 to 2220).</li>
              <li><strong className="text-slate-200">models/voyager/voyager.glb:</strong> Official 3D glTF 2.0 spacecraft model from NASA VTAD.</li>
              <li><strong className="text-slate-200">satellite-voyagers.json & dataset.json:</strong> Mission cards and metadata.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-sky-400" />
              2. Coordinate Frame Alignment
            </h3>
            <p>
              The Celestia / Gaia Sky datasets store coordinates in kilometers where the orbital (ecliptic) plane corresponds to the horizontal X-Z plane, and Y is perpendicular to the ecliptic (the North Ecliptic Pole).
            </p>
            <div className="mt-2 p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
              <code>Three.js X = Celestia X (y_ecl) / 149,597,870.7 km</code><br />
              <code>Three.js Y = Celestia Y (z_ecl, Normal to Ecliptic) / 149,597,870.7 km</code><br />
              <code>Three.js Z = Celestia Z (x_ecl) / 149,597,870.7 km</code>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              This exact transformation matches NASA JPL planetary ephemerides for Jupiter, Saturn, Uranus, Neptune, and Earth at every encounter date to within 0.01 AU without any coordinate skew.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              3. Dynamic Interpolation & Reverse Playback
            </h3>
            <p>
              Spacecraft positions between dataset samples are interpolated continuously using binary search (O(log N)) on timestamps. The simulation engine supports bidirectional playback (forward and reverse), custom time rates from real-time 1× up to 3 years per second, and scrubber timeline navigation without cumulative drift.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

