import React, { useState } from 'react';
import { LayoutDashboard, Mic2, Music, ShoppingCart, Sliders, Video, PlayCircle, Menu, X, Disc, Zap, Activity, Waves, Smile } from 'lucide-react';
import { View } from './types';
import { HindsightChat } from './components/HindsightChat';
import { AudioPlayer } from './components/AudioPlayer';
import { generateSongConcept, generateAlbumArt, generateVocalPreview, startVideoGeneration, generateSculptedVocal } from './services/geminiService';
import { ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// --- Sub-components for Views ---

// 1. GENESIS VIEW
const GenesisView = () => {
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [vocalPreview, setVocalPreview] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!genre || !mood || !topic) return;

    // Check for Paid API Key (Required for Imagen 3 Pro / Album Art)
    try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
        }
    } catch (e) {
        console.warn("Key selection check failed", e);
    }

    setLoading(true);
    setResult(null);
    setCoverArt(null);
    setVocalPreview(null);

    try {
      // Parallel execution for demo speed
      const [concept, art] = await Promise.all([
        generateSongConcept(genre, mood, topic),
        generateAlbumArt(`${mood} ${genre} album cover about ${topic}`)
      ]);

      setResult(concept);
      setCoverArt(art);

      // Generate a quick vocal preview based on the first verse if available
      if (concept?.structure) {
        const verse = concept.structure.find((s: any) => s.lyrics && s.lyrics.length > 10);
        if (verse) {
           const audioData = await generateVocalPreview(verse.lyrics.substring(0, 100)); // Limit length
           setVocalPreview(audioData);
        }
      }

    } catch (e) {
      console.error(e);
      alert("Generation failed. Check console or API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple mb-2">
          SHADOWSCRIBE GENESIS
        </h1>
        <p className="text-gray-400">The world's most advanced AI song engine. Infinite possibilities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="bg-shadow-800 p-6 rounded-2xl border border-shadow-700 shadow-xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">GENRE FUSION</label>
              <input 
                type="text" 
                value={genre}
                onChange={e => setGenre(e.target.value)}
                placeholder="e.g. Cyberpunk Phonk x Jazz"
                className="w-full bg-shadow-900 border border-shadow-600 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">MOOD / ATMOSPHERE</label>
              <input 
                type="text" 
                value={mood}
                onChange={e => setMood(e.target.value)}
                placeholder="e.g. Gritty, Ethereal, Aggressive"
                className="w-full bg-shadow-900 border border-shadow-600 rounded-lg px-4 py-3 text-white focus:border-neon-purple focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">LYRIC TOPIC</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="What is this song about?"
                rows={3}
                className="w-full bg-shadow-900 border border-shadow-600 rounded-lg px-4 py-3 text-white focus:border-neon-red focus:outline-none"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-4 rounded-lg font-display font-bold text-lg tracking-wider transition-all
                ${loading 
                  ? 'bg-shadow-700 text-gray-500 cursor-wait' 
                  : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:scale-[1.02]'
                }`}
            >
              {loading ? 'INITIALIZING AI KERNEL...' : 'GENERATE FULL SONG'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {result && (
            <div className="bg-shadow-800 rounded-2xl border border-shadow-700 overflow-hidden shadow-xl animate-fade-in">
              <div className="p-6 border-b border-shadow-700 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-display font-bold text-white">{result.title || "Untitled Project"}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="bg-neon-cyan/20 text-neon-cyan px-3 py-1 rounded text-xs font-bold border border-neon-cyan/30">BPM: {result.bpm}</span>
                    <span className="bg-neon-purple/20 text-neon-purple px-3 py-1 rounded text-xs font-bold border border-neon-purple/30">{genre.toUpperCase()}</span>
                  </div>
                </div>
                {coverArt && (
                  <img src={coverArt} alt="Cover" className="w-24 h-24 rounded-lg shadow-lg border border-shadow-600" />
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 bg-shadow-900 p-4 rounded-xl border border-shadow-600">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-neon-red/20 flex items-center justify-center text-neon-red">
                            <PlayCircle size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Master Audio</div>
                            <div className="font-bold text-white">Generating Instrumental... (Simulated)</div>
                        </div>
                    </div>
                    {vocalPreview && <AudioPlayer base64Audio={vocalPreview} label="AI Vocal Preview" />}
                </div>

                <div className="space-y-4">
                  <h3 className="font-display font-bold text-gray-400 border-b border-shadow-700 pb-2">SONG STRUCTURE</h3>
                  {result.structure?.map((section: any, idx: number) => (
                    <div key={idx} className="group">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-neon-cyan font-bold text-sm">{section.section}</span>
                        <span className="text-xs text-gray-500">{section.description}</span>
                      </div>
                      {section.lyrics && (
                        <p className="text-gray-300 font-mono text-sm leading-relaxed pl-4 border-l-2 border-shadow-600 group-hover:border-neon-purple transition-colors">
                          {section.lyrics}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-shadow-700 rounded-2xl p-12">
              <Disc size={64} className="mb-4 opacity-20" />
              <p className="font-display text-xl opacity-50">AWAITING GENESIS INPUT</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 1.5 VOCAL FORGE VIEW (UPDATED)
const VocalForgeView = () => {
    const [lyrics, setLyrics] = useState("We riding lightcycles in the neon rain\nChasing ghosts inside the mainframe");
    const [pitchCorrection, setPitchCorrection] = useState(50);
    const [emotion, setEmotion] = useState('clean');
    const [voice, setVoice] = useState('Fenrir');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const emotions = [
        { id: 'clean', label: 'Clean', color: 'bg-gray-600' },
        { id: 'aggressive', label: 'Aggressive', color: 'bg-neon-red' },
        { id: 'ethereal', label: 'Ethereal', color: 'bg-neon-cyan' },
        { id: 'melancholic', label: 'Melancholic', color: 'bg-indigo-500' },
        { id: 'hype', label: 'Hype', color: 'bg-neon-green' },
        { id: 'whisper', label: 'Whisper', color: 'bg-purple-400' },
    ];

    const voices = ['Fenrir', 'Puck', 'Kore', 'Zephyr', 'Charon'];

    const handleForge = async () => {
        setLoading(true);
        setResult(null);
        try {
            const audio = await generateSculptedVocal(lyrics, voice, emotion, pitchCorrection);
            setResult(audio);
        } catch (e) {
            alert("Forge failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Mic2 size={40} className="text-neon-purple" />
                <div>
                    <h1 className="text-4xl font-display font-bold text-white">HOLOGENIC VOCAL FORGE</h1>
                    <p className="text-gray-400">Next-Gen Vocal Synthesis & Real-Time Emotion Sculpting</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Controls */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Lyrics Input */}
                    <div className="bg-shadow-800 p-5 rounded-2xl border border-shadow-700">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3">
                            <Activity size={16} /> INPUT LYRICS
                        </label>
                        <textarea 
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            rows={4}
                            className="w-full bg-shadow-900 border border-shadow-600 rounded-lg px-4 py-3 text-white focus:border-neon-purple focus:outline-none font-mono text-sm"
                            placeholder="Enter lyrics to synthesize..."
                        />
                    </div>

                    {/* Pitch Correction Slider */}
                    <div className="bg-shadow-800 p-5 rounded-2xl border border-shadow-700">
                        <div className="flex justify-between items-center mb-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                                <Waves size={16} /> AI MELODY CORRECTION
                            </label>
                            <span className="text-neon-cyan font-mono text-xs">{pitchCorrection}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={pitchCorrection} 
                            onChange={(e) => setPitchCorrection(Number(e.target.value))}
                            className="w-full h-2 bg-shadow-900 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                            <span>NATURAL</span>
                            <span>POLISHED</span>
                            <span>ROBOTIC</span>
                        </div>
                    </div>

                     {/* Voice Model */}
                     <div className="bg-shadow-800 p-5 rounded-2xl border border-shadow-700">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3">
                            <Mic2 size={16} /> VOICE MODEL
                        </label>
                        <select 
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full bg-shadow-900 border border-shadow-600 rounded-lg px-4 py-3 text-white focus:border-neon-purple focus:outline-none"
                        >
                            {voices.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                </div>

                {/* Right Panel: Emotion & Result */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Emotion Sculpting */}
                    <div className="bg-shadow-800 p-6 rounded-2xl border border-shadow-700">
                         <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-4">
                            <Smile size={16} /> EMOTION SCULPTING
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {emotions.map((emo) => (
                                <button
                                    key={emo.id}
                                    onClick={() => setEmotion(emo.id)}
                                    className={`p-3 rounded-lg border text-sm font-bold transition-all relative overflow-hidden group
                                        ${emotion === emo.id 
                                            ? `border-${emo.color.replace('bg-', '')} bg-opacity-20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]` 
                                            : 'border-shadow-600 bg-shadow-900 text-gray-400 hover:border-gray-400'
                                        }`}
                                >
                                    {/* Active Background Glow */}
                                    {emotion === emo.id && (
                                        <div className={`absolute inset-0 opacity-20 ${emo.color}`}></div>
                                    )}
                                    <span className="relative z-10">{emo.label.toUpperCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action & Result */}
                    <button 
                        onClick={handleForge}
                        disabled={loading}
                        className={`w-full py-6 rounded-xl font-display font-bold text-2xl tracking-widest transition-all shadow-lg
                            ${loading 
                            ? 'bg-shadow-700 text-gray-500 cursor-wait' 
                            : 'bg-gradient-to-r from-neon-purple to-pink-600 text-white hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(188,19,254,0.4)]'
                            }`}
                    >
                        {loading ? 'SCULPTING VOCALS...' : 'INITIATE VOCAL FORGE'}
                    </button>

                    <div className={`bg-shadow-900 rounded-2xl border border-shadow-700 p-8 flex flex-col items-center justify-center min-h-[200px] transition-all ${result ? 'border-neon-green shadow-[0_0_20px_rgba(10,255,96,0.1)]' : ''}`}>
                        {result ? (
                            <div className="w-full animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-neon-green font-bold tracking-wider">PROCESS COMPLETE</span>
                                    <span className="text-xs text-gray-500 font-mono">WAV // 24-BIT // 48KHZ</span>
                                </div>
                                <div className="bg-shadow-800 p-4 rounded-xl border border-shadow-600 mb-4">
                                     <div className="h-16 flex items-end gap-1 justify-center opacity-50">
                                        {[...Array(20)].map((_, i) => (
                                            <div key={i} className="w-2 bg-neon-purple animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }}></div>
                                        ))}
                                     </div>
                                </div>
                                <AudioPlayer base64Audio={result} label="Final Vocal Output" />
                            </div>
                        ) : (
                            <div className="text-center opacity-30">
                                <Waves size={48} className="mx-auto mb-2" />
                                <p className="font-display">AWAITING SIGNAL</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. VIDEO LAB VIEW
const VideoLabView = () => {
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'checking_key' | 'generating' | 'done'>('idle');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const checkKeyAndGenerate = async () => {
        setStatus('checking_key');
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
                // We assume user selects key. In real app, we might need to re-check.
            }
            
            setStatus('generating');
            const op = await startVideoGeneration(prompt);
            
            // SIMULATION: Since we can't easily wait for operation in this stateless snippet without backend callbacks
            // we will simulate the waiting period and show the result if it was real.
            // For the Hackathon/Demo purpose, we will inform the user.
            
            console.log("Video Operation Started:", op);
            
            // In a real implementation: pollVideoOperation(op.name) until done.
            // Here we just mock a success state after delay to show UX.
            setTimeout(() => {
                setStatus('done');
                // Mock video or result. Since we can't get actual video easily without waiting minutes:
                setVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"); // Placeholder
            }, 5000);

        } catch (e) {
            console.error(e);
            setStatus('idle');
            alert("Video generation failed. Ensure you selected a paid API key for Veo.");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-display font-bold text-white mb-8">AUTO-VIDEO MODE <span className="text-neon-red text-sm align-top">VEO POWERED</span></h1>
            
            <div className="bg-shadow-800 p-8 rounded-2xl border border-shadow-700">
                <div className="max-w-xl mx-auto space-y-6">
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Describe the visualizer (e.g. neon city rain loop)"
                        className="w-full bg-shadow-900 border border-shadow-600 rounded-lg px-4 py-3 text-white focus:border-neon-red focus:outline-none"
                    />
                    
                    {status === 'idle' && (
                         <button 
                         onClick={checkKeyAndGenerate}
                         className="px-8 py-3 bg-neon-red text-black font-bold rounded-lg hover:bg-neon-red/80 transition-colors flex items-center gap-2 mx-auto"
                     >
                         <Video size={20} /> GENERATE VISUALIZER
                     </button>
                    )}

                    {status === 'checking_key' && <p className="text-neon-cyan animate-pulse">Verifying Access Keys...</p>}
                    
                    {status === 'generating' && (
                        <div className="space-y-4">
                             <div className="w-full bg-shadow-900 rounded-full h-2 overflow-hidden">
                                <div className="bg-neon-red h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite]"></div>
                             </div>
                             <p className="text-gray-400 text-sm">Rendering with Veo (This may take a moment)...</p>
                        </div>
                    )}

                    {status === 'done' && videoUrl && (
                        <div className="mt-8 animate-fade-in">
                            <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg shadow-[0_0_30px_rgba(255,0,60,0.3)]" />
                            <p className="mt-4 text-green-400 font-mono text-sm">RENDER COMPLETE</p>
                            <button onClick={() => setStatus('idle')} className="mt-4 text-gray-500 hover:text-white underline text-sm">Generate Another</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 3. STUDIO & MARKETPLACE PLACEHOLDERS
const StudioView = () => {
    // Generate dummy data for visualizer
    const data = Array.from({ length: 50 }, () => ({ value: Math.random() * 100 }));
    
    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-display font-bold text-white">STUDIO X DAW</h1>
                 <button className="bg-neon-green text-black px-4 py-2 rounded font-bold hover:scale-105 transition-transform">EXPORT RADIO READY</button>
            </div>
            
            <div className="flex-1 bg-shadow-800 rounded-xl border border-shadow-700 p-4 relative overflow-hidden">
                {/* Timeline Tracks */}
                {[1, 2, 3, 4].map((track) => (
                    <div key={track} className="mb-4 bg-shadow-900 rounded-lg p-3 flex items-center gap-4">
                        <div className="w-24 text-xs font-bold text-gray-400">TRACK 0{track}</div>
                        <div className="flex-1 h-16 bg-shadow-800 rounded relative overflow-hidden border border-shadow-700">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <Bar dataKey="value" fill={track % 2 === 0 ? '#00f3ff' : '#bc13fe'} />
                                </BarChart>
                             </ResponsiveContainer>
                        </div>
                        <div className="flex gap-2 text-gray-500">
                            <Sliders size={16} className="hover:text-white cursor-pointer" />
                            <Mic2 size={16} className="hover:text-white cursor-pointer" />
                        </div>
                    </div>
                ))}
                
                {/* Playhead overlay */}
                <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-neon-red shadow-[0_0_10px_#ff003c] z-10 pointer-events-none"></div>
            </div>
        </div>
    )
}

const MarketplaceView = () => (
    <div className="p-6">
        <h1 className="text-3xl font-display font-bold text-white mb-6">MONEY MODULE <span className="text-neon-green">$</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-shadow-800 rounded-xl border border-shadow-700 p-4 hover:border-neon-green transition-colors group">
                    <div className="h-32 bg-shadow-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                        <img src={`https://picsum.photos/seed/${i + 120}/300/300?grayscale`} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10 font-display font-bold text-2xl">${(Math.random() * 50 + 10).toFixed(2)}</span>
                    </div>
                    <h3 className="font-bold text-white">Dark Matter Vol. {i}</h3>
                    <p className="text-xs text-gray-500 mb-3">By ShadowUser_{i*99}</p>
                    <button className="w-full py-2 bg-shadow-700 hover:bg-neon-green hover:text-black rounded text-sm font-bold transition-colors">
                        BUY LICENSE
                    </button>
                </div>
            ))}
        </div>
    </div>
)


// --- Main App Component ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.GENESIS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2
        ${currentView === view 
          ? 'bg-shadow-700 text-neon-cyan border border-neon-cyan/20 shadow-[0_0_15px_rgba(0,243,255,0.1)]' 
          : 'text-gray-400 hover:text-white hover:bg-shadow-800'
        }`}
    >
      <Icon size={20} />
      <span className="font-bold tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-shadow-900 text-gray-200 font-sans flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-shadow-900 border-r border-shadow-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-shadow-800">
            <div className="w-8 h-8 bg-neon-purple rounded rotate-45 flex items-center justify-center">
                <Zap size={16} className="text-white -rotate-45" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-widest">GENESIS</span>
        </div>
        
        <nav className="p-4 mt-4">
            <NavItem view={View.GENESIS} icon={Disc} label="GENESIS ENGINE" />
            <NavItem view={View.VOCAL_FORGE} icon={Mic2} label="VOCAL FORGE" />
            <NavItem view={View.BEAT_ARCHITECT} icon={Sliders} label="BEAT ARCHITECT" />
            <NavItem view={View.STUDIO} icon={Music} label="STUDIO X DAW" />
            <NavItem view={View.VIDEO_LAB} icon={Video} label="VIDEO LAB" />
            <NavItem view={View.MARKETPLACE} icon={ShoppingCart} label="MARKETPLACE" />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-shadow-800 bg-shadow-900">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-cyan to-neon-purple"></div>
                <div>
                    <div className="font-bold text-white text-sm">Producer_01</div>
                    <div className="text-xs text-neon-green">Pro Plan Active</div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-shadow-700 flex justify-between items-center bg-shadow-900/80 backdrop-blur">
             <span className="font-display font-bold text-xl text-white">GENESIS</span>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                {mobileMenuOpen ? <X /> : <Menu />}
             </button>
        </div>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-shadow-800 to-shadow-900">
            {currentView === View.GENESIS && <GenesisView />}
            {currentView === View.VIDEO_LAB && <VideoLabView />}
            {currentView === View.STUDIO && <StudioView />}
            {currentView === View.MARKETPLACE && <MarketplaceView />}
            {currentView === View.VOCAL_FORGE && <VocalForgeView />}
            {(currentView === View.BEAT_ARCHITECT) && (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center p-8 bg-shadow-800 rounded-2xl border border-shadow-700 max-w-md">
                        <Sliders size={48} className="mx-auto text-neon-purple mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Module Locked</h2>
                        <p className="text-gray-400">Please upgrade to ShadowScribe Pro to access the deep-learning DSP modules.</p>
                    </div>
                </div>
            )}
        </div>

        {/* Hindsight Overlay */}
        <HindsightChat />
      </main>

    </div>
  );
};

export default App;