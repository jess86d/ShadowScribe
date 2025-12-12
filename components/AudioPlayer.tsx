import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Loader } from 'lucide-react';

interface AudioPlayerProps {
  base64Audio: string | null;
  label?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ base64Audio, label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const playAudio = async () => {
    if (!base64Audio) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      }

      // Decode base64
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to Int16 to Float32 (assuming 16-bit PCM from Gemini)
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => setIsPlaying(false);
      
      sourceRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio playback failed", e);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-3 bg-shadow-800 p-2 rounded-lg border border-shadow-700">
      <button
        onClick={isPlaying ? stopAudio : playAudio}
        disabled={!base64Audio}
        className={`p-2 rounded-full ${!base64Audio ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neon-cyan/20 text-neon-cyan'}`}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <div className="text-xs font-mono text-gray-400">
        {label || "Vocal Preview"}
      </div>
    </div>
  );
};