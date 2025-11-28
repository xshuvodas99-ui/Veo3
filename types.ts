export interface GeneratedVideo {
  id: string;
  url: string | null;
  prompt: string;
  timestamp: number;
  status: 'generating' | 'completed' | 'failed';
  aspectRatio: string;
  resolution: string;
  thumbnail?: string; // Base64 or URL
}

export interface VideoConfig {
  prompt: string;
  image?: File | null;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

// Augment window for the AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}