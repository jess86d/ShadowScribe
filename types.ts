export enum View {
  GENESIS = 'GENESIS',
  VOCAL_FORGE = 'VOCAL_FORGE',
  BEAT_ARCHITECT = 'BEAT_ARCHITECT',
  STUDIO = 'STUDIO',
  MARKETPLACE = 'MARKETPLACE',
  VIDEO_LAB = 'VIDEO_LAB'
}

export interface SongProject {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  lyrics: string;
  coverArtUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface VoicePreset {
  id: string;
  name: string;
  description: string;
  style: string;
}

// Global augmentation for the AiStudio API key selection
declare global {
  // Fix: Augment AIStudio interface to include key selection methods.
  // This ensures compatibility if AIStudio is already defined elsewhere, and avoids 'identical modifiers' errors.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fix: Remove aistudio property declaration to avoid conflict with existing global definition.
    webkitAudioContext: typeof AudioContext;
  }
}