import React, { useState, useMemo } from 'react';
import { 
  Milestone, 
  ChevronLeft, 
  Calendar, 
  Sparkles, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { MissionEvent, SpacecraftId } from '../../types/simulation';

export const MilestonesPanel: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const { events, jumpToEvent, selectedEvent, currentTimeMs } = useSimulation();
  const [filterCraft, setFilterCraft] = useState<'all' | SpacecraftId>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterCraft !== 'all' && e.spacecraft !== filterCraft) return false;
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      return true;
    });
  }, [events, filterCraft, filterCategory]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-16 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-mono text-slate-300 hover:text-white shadow-xl hover:bg-slate-900 transition-all cursor-pointer"
      >
        <Milestone className="w-3.5 h-3.5 text-amber-400" />
        <span>Mission Milestones</span>
      </button>
    );
  }

  return (
    <aside className="absolute top-14 left-4 z-20 w-80 sm:w-96 max-h-[calc(100vh-140px)] overflow-y-auto flex flex-col rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-2xl transition-all font-mono text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-900/60 sticky top-0 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Milestone className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
            MISSION MILESTONES
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
            {filteredEvents.length}
          </span>
        </div>

        <button
          onClick={onToggle}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Minimize Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 flex flex-col gap-2 text-xs">
        {/* Spacecraft filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase w-12">Probe:</span>
          <div className="flex gap-1 flex-1">
            <button
              onClick={() => setFilterCraft('all')}
              className={`flex-1 py-1 rounded text-[10px] transition-colors cursor-pointer ${
                filterCraft === 'all'
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterCraft('voyager1')}
              className={`flex-1 py-1 rounded text-[10px] transition-colors cursor-pointer ${
                filterCraft === 'voyager1'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Voyager 1
            </button>
            <button
              onClick={() => setFilterCraft('voyager2')}
              className={`flex-1 py-1 rounded text-[10px] transition-colors cursor-pointer ${
                filterCraft === 'voyager2'
                  ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Voyager 2
            </button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase w-12">Type:</span>
          <div className="flex gap-1 flex-1 overflow-x-auto pb-0.5">
            {['all', 'encounter', 'interstellar', 'boundary', 'photo', 'launch'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap capitalize transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-slate-800 text-slate-100 font-bold border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="p-3 flex flex-col gap-2.5">
        {filteredEvents.map(event => {
          const isSelected = selectedEvent?.id === event.id;
          const evTime = new Date(event.date).getTime();
          const isPast = currentTimeMs >= evTime;
          const isV1 = event.spacecraft === 'voyager1';

          return (
            <div
              key={event.id}
              onClick={() => jumpToEvent(event)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                isSelected
                  ? 'bg-sky-500/15 border-sky-400/80 shadow-md shadow-sky-500/10'
                  : isPast
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  : 'bg-slate-950/60 border-slate-800/50 opacity-70 hover:opacity-100 hover:bg-slate-900'
              }`}
            >
              {/* Event Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isV1 ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-[10px] uppercase font-bold text-slate-300">
                    {isV1 ? 'Voyager 1' : 'Voyager 2'}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                    {event.category}
                  </span>
                </div>

                <div className="text-[10px] text-sky-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Event Title */}
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>{event.title}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {event.description}
              </p>

              {/* Metrics footer */}
              <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                <span>Dist: <strong className="text-slate-200">{event.distanceAU} AU</strong></span>
                {event.encounterDistanceKm && (
                  <span>
                    Closest: <strong className="text-slate-200">{event.encounterDistanceKm.toLocaleString()} km</strong>
                  </span>
                )}
                {event.targetPlanet && (
                  <span className="ml-auto text-sky-400 font-semibold">{event.targetPlanet}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

