import React, { useState } from 'react';
import { X, Disc, Play, Pause, Volume2, Globe, Music, Radio, Shield } from 'lucide-react';

interface GoldenRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoldenRecordModal: React.FC<GoldenRecordModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'audio' | 'greetings' | 'photos'>('cover');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<number>(0);

  if (!isOpen) return null;

  const audioTracks = [
    { title: 'Greetings in 55 Languages', duration: '5:42', type: 'Speech', desc: 'Voices of humanity expressing peace and goodwill, beginning with Akkadian and Sumerian to modern languages.' },
    { title: 'Sounds of Earth (Nature & Wildlife)', duration: '12:15', type: 'Sounds', desc: 'Wind, rain, thunder, volcanic eruptions, ocean surf, crickets, frog chorus, chimpanzee, and humpback whale songs.' },
    { title: 'Chuck Berry - Johnny B. Goode', duration: '2:41', type: 'Music', desc: 'Rock and roll classic selected by Carl Sagan’s committee to represent 20th-century American culture.' },
    { title: 'J.S. Bach - Brandenburg Concerto No. 2', duration: '4:40', type: 'Music', desc: 'Conducted by Karl Richter with the Munich Bach Orchestra.' },
    { title: 'Blind Willie Johnson - Dark Was the Night', duration: '3:20', type: 'Music', desc: 'Haunting slide guitar blues depicting human loneliness and cosmic longing.' },
    { title: 'Beethoven - Symphony No. 5 (First Movement)', duration: '7:20', type: 'Music', desc: 'Otto Klemperer conducting the Philharmonia Orchestra.' },
    { title: 'Guan Pinghu - Flowing Water (Liu Shui)', duration: '7:37', type: 'Music', desc: 'Ancient Chinese guqin masterpiece representing continuous, flowing nature.' }
  ];

  // Synthesize a retro cosmic audio frequency tone when user plays audio
  const togglePlayAudio = (idx: number) => {
    setSelectedTrack(idx);
    if (isPlayingAudio && selectedTrack === idx) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      // Generate web audio tone
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432 + idx * 55, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 3);
      } catch (e) {
        // AudioContext fallback
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col font-mono text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider text-amber-300">
                THE VOYAGER GOLDEN RECORD
              </h2>
              <p className="text-[11px] text-slate-400">
                NASA’s Cosmic Message in a Bottle to Extraterrestrial Civilizations
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 text-xs">
          {[
            { id: 'cover', label: 'Cover & Symbols', icon: Shield },
            { id: 'audio', label: 'Music & Sounds', icon: Music },
            { id: 'greetings', label: '55 Languages', icon: Globe },
            { id: 'photos', label: 'Scientific Gallery', icon: Radio }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[60vh] flex flex-col gap-4 text-xs font-sans">
          {activeTab === 'cover' && (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Golden record cover illustration */}
              <div className="relative w-48 h-48 rounded-full border-2 border-amber-500/40 bg-black p-1 shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-amber-500/20 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 rounded-full border border-amber-500/20 scale-90" />
                  <div className="absolute inset-0 rounded-full border border-amber-500/15 scale-75" />
                  <div className="absolute inset-0 rounded-full border border-amber-500/15 scale-50" />
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>
                  {/* Pulsar star rays graphic */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <div className="w-28 h-px bg-amber-300 rotate-12" />
                    <div className="w-24 h-px bg-amber-300 -rotate-45" />
                    <div className="w-32 h-px bg-amber-300 rotate-75" />
                    <div className="w-20 h-px bg-amber-300 -rotate-15" />
                  </div>
                </div>
              </div>

              {/* Explanatory text */}
              <div className="flex flex-col gap-3 font-mono">
                <h3 className="text-sm font-bold text-amber-300">The Cover Symbology</h3>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  Mounted on the outside of both Voyager spacecraft is a 12-inch gold-plated copper phonograph record protected by an aluminum cover electroplated with ultra-pure Uranium-238 (with a half-life of 4.468 billion years, serving as a radioactive clock to date the launch).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 block mb-1">Pulsar Map:</strong>
                    Depicts 14 pulsars with their precise binary periods pointing to our Sun, providing cosmic triangulation coordinates to locate Earth.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 block mb-1">Hydrogen Transition:</strong>
                    Draws the hyper-fine transition of neutral hydrogen atom, establishing universal constants of time (0.7 nanoseconds) and length (21 cm).
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 block mb-1">Playing Speed:</strong>
                    Binary instructions show the record should be rotated at 16-2/3 revolutions per minute from the outside in.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 block mb-1">Video Scan Signals:</strong>
                    Diagrams the raster scanning mechanism to reconstruct the 115 analog color photographs encoded on the groove.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="flex flex-col gap-3">
              <p className="text-slate-300 font-sans text-xs">
                Curated by Carl Sagan, Frank Drake, Ann Druyan, and Timothy Ferris, the audio tracks comprise 90 minutes of the finest world music, environmental sounds, and wildlife acoustics of planet Earth.
              </p>

              <div className="flex flex-col gap-2">
                {audioTracks.map((track, i) => (
                  <div
                    key={i}
                    onClick={() => togglePlayAudio(i)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      selectedTrack === i && isPlayingAudio
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button className="p-2 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                        {selectedTrack === i && isPlayingAudio ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </button>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-slate-100">{track.title}</span>
                        <span className="text-[11px] text-slate-400 font-sans">{track.desc}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 shrink-0 ml-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] uppercase text-amber-400">{track.type}</span>
                      <span>{track.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'greetings' && (
            <div className="flex flex-col gap-3">
              <p className="text-slate-300 font-sans text-xs">
                The greetings section begins with a greeting in Akkadian (spoken in Sumer 6,000 years ago) and ends with Wu, a modern Chinese dialect, followed by a message from UN Secretary-General Kurt Waldheim and US President Jimmy Carter.
              </p>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs italic font-serif leading-relaxed">
                "This is a present from a small distant world, a token of our sounds, our science, our images, our music, our thoughts, and our feelings. We are attempting to survive our time so we may live into yours."
                <div className="text-right not-italic font-mono text-[10px] text-amber-400 mt-2">
                  — President Jimmy Carter, Official Voyager Message
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                {[
                  { lang: 'English', text: 'Hello from the children of planet Earth.' },
                  { lang: 'Spanish', text: 'Hola y saludos a todos.' },
                  { lang: 'French', text: 'Bonjour tout le monde.' },
                  { lang: 'Mandarin', text: 'Hope everyone’s well. Thinking of you.' },
                  { lang: 'Arabic', text: 'Greetings to our friends in the stars.' },
                  { lang: 'Hindi', text: 'Greetings from the inhabitants of this world.' },
                  { lang: 'Russian', text: 'Greetings! I welcome you!' },
                  { lang: 'Japanese', text: 'Hello? How are you?' },
                  { lang: 'Latin', text: 'Salvete quicumque estis (Greetings to whoever you are).' }
                ].map((g, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-sky-400 font-bold block">{g.lang}</span>
                    <span className="text-slate-300 font-sans text-[11px]">{g.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="flex flex-col gap-3 font-sans text-xs text-slate-300 leading-relaxed">
              <p>
                115 analog photographs were encoded onto the grooves as FM audio waveforms. The images describe:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-200 font-mono text-[11px]">
                <li>Solar System parameters, planet diameters, and chemical makeup of Earth’s atmosphere</li>
                <li>DNA structure, cellular division, human anatomy, and reproductive biology</li>
                <li>Diagrams of mathematical operations, physical units, and chemical elements</li>
                <li>Human life, architecture, Great Wall of China, Sydney Opera House, and radio telescopes</li>
                <li>Scenes of eating, drinking, Olympic sprinters, and children studying in classrooms</li>
              </ul>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                The record also contains the recorded brainwaves (electroencephalogram) of Ann Druyan thinking about the history of ideas, philosophy, love, and what it felt like to fall in love with Carl Sagan.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Currently travelling at 61,000 km/h in interstellar space</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

