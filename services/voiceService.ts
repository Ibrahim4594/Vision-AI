import { VOICE_COMMANDS } from "../constants";

type VoiceCommandCallback = (command: string, transcript: string) => void;

export class VoiceCommandService {
  private recognition: any;
  private isListening: boolean = false;
  private onCommand: VoiceCommandCallback;
  private isChatMode: boolean = false;

  constructor(onCommand: VoiceCommandCallback) {
    this.onCommand = onCommand;

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = this.handleResult.bind(this);
      this.recognition.onerror = this.handleError.bind(this);
      this.recognition.onend = this.handleEnd.bind(this);
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }

  public updateCallback(newCallback: VoiceCommandCallback) {
    this.onCommand = newCallback;
  }

  public setChatMode(enabled: boolean) {
    this.isChatMode = enabled;
  }

  private handleResult(event: any) {
    const results = event.results;
    const transcript = results[results.length - 1][0].transcript.toLowerCase().trim();
    console.log('Voice Input:', transcript);

    const command = this.parseCommand(transcript);
    if (command) {
      this.onCommand(command, transcript);
    }
  }

  private parseCommand(transcript: string): string | null {
    // 1. Handle "Ask" / "Vision" commands specially (greedy match)
    // Matches: "Ask [question]", "Vision [question]"
    const askMatch = transcript.match(/^(?:ask|question|vision(?:\s+ai)?)\s+(?:vision\s+ai\s+)?(.+)/i);
    if (askMatch) {
        return `ask:${askMatch[1]}`;
    }

    // 2. Handle standard commands with stricter boundary checking
    for (const [command, triggers] of Object.entries(VOICE_COMMANDS)) {
      if (triggers.some(trigger => {
        const regex = new RegExp(`\\b${trigger}\\b`, 'i');
        return regex.test(transcript);
      })) {
        return command;
      }
    }

    // 3. Fallback for Chat Mode: Treat all other input as chat if in chat mode
    // We filter very short utterances to avoid noise
    if (this.isChatMode && transcript.length > 2) {
        return `chat:${transcript}`;
    }

    return null;
  }

  private handleError(event: any) {
    if (event.error === 'no-speech') return;
    console.warn('Voice recognition error:', event.error);
  }

  private handleEnd() {
    // Auto-restart if it was supposed to be listening
    if (this.isListening) {
      try {
        this.recognition?.start();
      } catch (e) {
        // Ignore errors if already started
      }
    }
  }

  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        console.error("Failed to start voice recognition", e);
      }
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }
}