import React, { useState } from 'react';
import { X, Disc, Play, Pause, Music, Globe, Radio, Shield } from 'lucide-react';

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
    { title: 'Greetings in 55 Languages', duration: '5:42', type: 'Speech', desc: 'Voices of humanity expressing peace and goodwill, beginning with Akkadian and Sumerian.' },
    { title: 'Sounds of Earth (Nature & Wildlife)', duration: '12:15', type: 'Sounds', desc: 'Wind, rain, thunder, volcanoes, ocean surf, crickets, frogs, chimpanzees, and whale songs.' },
    { title: 'Chuck Berry - Johnny B. Goode', duration: '2:41', type: 'Music', desc: 'Rock and roll classic selected by Carl Sagan to represent 20th-century culture.' },
    { title: 'J.S. Bach - Brandenburg Concerto No. 2', duration: '4:40', type: 'Music', desc: 'Conducted by Karl Richter with the Munich Bach Orchestra.' },
    { title: 'Blind Willie Johnson - Dark Was the Night', duration: '3:20', type: 'Music', desc: 'Slide guitar blues depicting human loneliness and cosmic longing.' },
    { title: 'Beethoven - Symphony No. 5', duration: '7:20', type: 'Music', desc: 'Otto Klemperer conducting the Philharmonia Orchestra.' },
    { title: 'Guan Pinghu - Flowing Water (Liu Shui)', duration: '7:37', type: 'Music', desc: 'Ancient Chinese guqin masterpiece representing continuous, flowing nature.' }
  ];

  // Synthesize a retro audio tone when testing playback
  const togglePlayAudio = (idx: number) => {
    setSelectedTrack(idx);
    if (isPlayingAudio && selectedTrack === idx) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432 + idx * 55, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 3);
      } catch (e) {
        // Fallback
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-xl bg-zinc-950 border border-white/10 shadow-2xl flex flex-col font-mono text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <Disc className="w-4 h-4 text-amber-400" />
            <div>
              <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-white uppercase">
                The Voyager Golden Record
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 text-xs bg-black/40 overflow-x-auto">
          {[
            { id: 'cover', label: 'Cover & Symbols', icon: Shield },
            { id: 'audio', label: 'Audio Tracks', icon: Music },
            { id: 'greetings', label: '55 Languages', icon: Globe },
            { id: 'photos', label: 'Image Gallery', icon: Radio }
          ].map(tabItem => {
            const Icon = tabItem.icon;
            return (
              <button
                key={tabItem.id}
                onClick={() => setActiveTab(tabItem.id as any)}
                className={`flex items-center gap-1.5 py-2.5 px-3 sm:px-4 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer text-xs ${
                  activeTab === tabItem.id
                    ? 'border-amber-400 text-amber-300 bg-white/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tabItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[62vh] flex flex-col gap-4 text-xs">
          {activeTab === 'cover' && (
            <div className="flex flex-col md:flex-row gap-5 items-center">
              {/* REAL NASA GOLDEN RECORD IMAGE from public/the-golden-record.png */}
              <div className="relative shrink-0 flex flex-col items-center gap-2">
                <img
                  src="/the-golden-record.png"
                  alt="The Voyager Golden Record Cover"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-full border border-amber-500/30 shadow-xl shadow-amber-500/5 hover:scale-102 transition-transform"
                />
                <span className="text-[10px] text-zinc-400 font-mono">
                  Electroplated Aluminum Cover
                </span>
              </div>

              {/* Explanatory text */}
              <div className="flex flex-col gap-2.5 font-sans">
                <h3 className="font-mono text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Scientific Symbology & Decryption
                </h3>
                <p className="text-zinc-300 leading-relaxed text-xs">
                  Mounted on the outside of both Voyager spacecraft is a 12-inch gold-plated copper phonograph record protected by an aluminum cover electroplated with ultra-pure Uranium-238 (with a half-life of 4.468 billion years, serving as a radioactive clock to date the launch).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono mt-1">
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong className="text-amber-300 block mb-0.5">Pulsar Map:</strong>
                    Depicts 14 pulsars with their binary frequencies pointing to our Sun to locate Earth in the Milky Way.
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong className="text-amber-300 block mb-0.5">Hydrogen Transition:</strong>
                    Draws the hyperfine transition of neutral hydrogen, establishing cosmic units of time (0.7 ns) and wavelength (21 cm).
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong className="text-amber-300 block mb-0.5">Playing Speed:</strong>
                    Binary notation indicates the record should be rotated at 16-2/3 RPM from the outside in.
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong className="text-amber-300 block mb-0.5">Video Rasters:</strong>
                    Diagrams the raster scanning mechanism to reconstruct the 115 color analog photos stored on the disc.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="flex flex-col gap-2.5 font-sans">
              <p className="text-zinc-300 text-xs">
                Curated by Carl Sagan and the NASA committee, the record contains 90 minutes of world music, natural sounds, and wildlife acoustics of planet Earth.
              </p>

              <div className="flex flex-col gap-1.5 font-mono">
                {audioTracks.map((track, i) => (
                  <div
                    key={i}
                    onClick={() => togglePlayAudio(i)}
                    className={`p-2.5 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                      selectedTrack === i && isPlayingAudio
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button className="p-1.5 rounded-full bg-white/10 text-amber-400">
                        {selectedTrack === i && isPlayingAudio ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </button>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-100">{track.title}</span>
                        <span className="text-[10px] text-zinc-400 font-sans">{track.desc}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 shrink-0 ml-2">
                      <span className="text-amber-400 uppercase">{track.type}</span>
                      <span>{track.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'greetings' && (
            <div className="flex flex-col gap-3 font-sans">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-xs italic leading-relaxed">
                "This is a present from a small distant world, a token of our sounds, our science, our images, our music, our thoughts, and our feelings. We are attempting to survive our time so we may live into yours."
                <div className="text-right not-italic font-mono text-[10px] text-zinc-400 mt-1.5">
                  — President Jimmy Carter, Official Message on Voyager
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px]">
                {[
                  { lang: 'English', text: 'Hello from the children of planet Earth.' },
                  { lang: 'Spanish', text: 'Hola y saludos a todos.' },
                  { lang: 'French', text: 'Bonjour tout le monde.' },
                  { lang: 'Mandarin', text: 'Hope everyone is well. Thinking of you.' },
                  { lang: 'Arabic', text: 'Greetings to our friends in the stars.' },
                  { lang: 'Hindi', text: 'Greetings from the inhabitants of this world.' },
                  { lang: 'Russian', text: 'Greetings! I welcome you!' },
                  { lang: 'Japanese', text: 'Hello? How are you?' },
                  { lang: 'Latin', text: 'Salvete quicumque estis.' }
                ].map((g, idx) => (
                  <div key={idx} className="p-2 rounded bg-white/5 border border-white/5">
                    <span className="text-sky-300 font-bold block">{g.lang}</span>
                    <span className="text-zinc-300 font-sans text-[11px]">{g.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="flex flex-col gap-2 font-sans text-xs text-zinc-300 leading-relaxed">
              <p>
                115 analog photographs were encoded onto the grooves as FM audio waveforms. The images describe:
              </p>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-zinc-200 mt-1">
                <li>Solar System parameters, planet diameters, and chemical makeup of Earth’s atmosphere</li>
                <li>DNA structure, cellular division, human anatomy, and reproductive biology</li>
                <li>Diagrams of mathematical operations, physical units, and chemical elements</li>
                <li>Human life, architecture, Great Wall of China, Sydney Opera House, and radio telescopes</li>
                <li>Scenes of eating, drinking, Olympic sprinters, and children studying in classrooms</li>
              </ul>
              <div className="p-2.5 rounded bg-white/5 border border-white/5 text-[11px] font-mono text-zinc-400 mt-2">
                The record also contains the recorded brainwaves of Ann Druyan thinking about the history of ideas, philosophy, love, and what it felt like to fall in love with Carl Sagan.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-white/5 flex items-center justify-between text-xs">
          <span className="text-zinc-400 text-[11px]">
            Travelling in interstellar space beyond 166 AU
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white text-black font-semibold font-mono hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
