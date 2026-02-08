export enum AppMode {
  SCENE = 'SCENE',
  READ = 'READ',
  OBJECT = 'OBJECT',
  NAV = 'NAV',
  COLOR = 'COLOR',
  CHAT = 'CHAT'
}

export interface VisionResponse {
  text: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AppSettings {
  speechRate: number;
  voiceEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface AppState {
  isActive: boolean; // Is the continuous loop running?
  isProcessing: boolean; // Is an API call in flight?
  currentMode: AppMode;
  lastSpokenText: string;
  chatHistory: ChatMessage[];
  error: string | null;
  settings: AppSettings;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}