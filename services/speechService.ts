import { SPEECH_PITCH, DEFAULT_SPEECH_RATE } from "../constants";

let synthesis: SpeechSynthesis | null = null;
if (typeof window !== 'undefined') {
  synthesis = window.speechSynthesis;
}

export const speak = (text: string, rate: number = DEFAULT_SPEECH_RATE, onEnd?: () => void): void => {
  if (!synthesis) return;

  try {
    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = SPEECH_PITCH;
    
    // Try to select a high-quality voice
    const voices = synthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
                           voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = (e) => {
          console.error("Speech error", e);
          // Don't call onEnd immediately on error to prevent rapid loops if speech fails consistently
          // But ensure the app doesn't hang
          setTimeout(onEnd, 500);
      };
    }

    synthesis.speak(utterance);
  } catch (e) {
      console.error("Speech synthesis failed", e);
      if (onEnd) setTimeout(onEnd, 500);
  }
};

export const stopSpeaking = (): void => {
  if (synthesis) {
    try {
      synthesis.cancel();
    } catch (e) {
      console.warn("Failed to cancel speech", e);
    }
  }
};

export const isSpeaking = (): boolean => {
  return synthesis ? synthesis.speaking : false;
};