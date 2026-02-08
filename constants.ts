import { AppMode } from "./types";

// Models
// Primary: Gemini 3 Flash Preview (Fast, Multimodal, Reasoning)
export const GEMINI_FAST_MODEL = 'gemini-3-flash-preview'; 
export const GEMINI_PRO_MODEL = 'gemini-3-pro-preview';

// Fallback 1: Gemini 2.0 Flash (High performance, widely available)
// Fixed: Removed -exp suffix which was causing 404s
export const GEMINI_FALLBACK_MODEL = 'gemini-2.0-flash';

// Fallback 2: Safe Mode (Standard Flash Latest - highly reliable alias)
export const GEMINI_SAFE_MODEL = 'gemini-flash-latest';

// Updated instruction to be friendlier and more natural
export const SYSTEM_INSTRUCTION = "You are VisionAI, a helpful and friendly guide for a visually impaired user. Speak naturally, clearly, and with a warm tone. When describing scenes, be descriptive but not overly wordy. For navigation, prioritize safety hazards and clear directions. Do not use markdown formatting.";

export const PROMPTS: Record<AppMode, string> = {
  [AppMode.SCENE]: "Describe this scene naturally. Mention the overall vibe, the people (if any), and the main objects around.",
  
  [AppMode.READ]: "Read the text in this image. Read it exactly as it appears. If it's a menu, read the items and prices. If there is no text, just say 'I don't see any text here'.",
  
  [AppMode.OBJECT]: "What is the main object here? Describe what it looks like, its color, material, and condition in a natural way.",
  
  [AppMode.NAV]: "Navigation Mode. Scan for hazards. \n1. Start with 'Stop', 'Caution', or 'Safe'.\n2. Mention obstacles and their distance (Very Close, Close, Far).\n3. Specify direction (Left, Right, Ahead).\n4. Warn about floor hazards like steps or cords.",
  
  [AppMode.COLOR]: "What are the main colors you see? Describe the object's color and the background.",

  [AppMode.CHAT]: "" // Chat uses dynamic user input
};

export const DEFAULT_SPEECH_RATE = 1.0; // Reset to 1.0 for more natural pacing
export const SPEECH_PITCH = 1.0;

export const MODE_LABELS: Record<AppMode, string> = {
  [AppMode.SCENE]: "Scene",
  [AppMode.READ]: "Read",
  [AppMode.OBJECT]: "Object",
  [AppMode.NAV]: "Navigate",
  [AppMode.COLOR]: "Color",
  [AppMode.CHAT]: "Chat"
};

export const MODE_COLORS: Record<AppMode, string> = {
  [AppMode.SCENE]: "#3B82F6", // Blue
  [AppMode.READ]: "#10B981",  // Green
  [AppMode.OBJECT]: "#8B5CF6", // Purple
  [AppMode.NAV]: "#EF4444",    // Red
  [AppMode.COLOR]: "#EC4899",  // Pink
  [AppMode.CHAT]: "#F59E0B"    // Orange
};

// Vibration Patterns (ms)
export const HAPTIC_PATTERNS = {
  CLICK: [10],
  SUCCESS: [50, 50, 50],
  ERROR: [50, 100, 50, 100],
  HAZARD: [300, 100, 300, 100, 300],
  WARNING: [200, 100],
  VERY_CLOSE: [400, 50, 400],
  CLOSE: [200, 200]
};

// Voice command mappings
export const VOICE_COMMANDS = {
  start: ['start', 'begin', 'go'], 
  stop: ['stop', 'pause', 'halt', 'cancel'],
  scene: ['scene', 'describe', 'surroundings'],
  read: ['read', 'text', 'scan'],
  object: ['object', 'identify', 'what is this'],
  navigate: ['navigate', 'navigation', 'walk'],
  color: ['color', 'colours'],
  chat: ['chat', 'question', 'ask'],
  help: ['help', 'commands']
};