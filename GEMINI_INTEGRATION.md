# Gemini 3 Integration Documentation

## Overview

VisionAI uses **Gemini 3 Flash Preview** as its core AI engine for multimodal analysis. This document details how we integrated Gemini 3 and why it's essential to our application.

## Why Gemini 3?

### 1. Multimodal Capabilities
Gemini 3's ability to process both images and text simultaneously is crucial for VisionAI. Traditional computer vision APIs only provide labels or bounding boxes, but Gemini 3 understands context and relationships.

**Example:**
- Traditional CV: "Person, Chair, Table"
- Gemini 3: "A person is sitting at a table to your left. The chair is 3 feet away."

### 2. Advanced Reasoning (Thinking Config)
We utilize the **Thinking Config** with a budget of 1024 tokens. This allows the model to "think" before speaking, dramatically improving the accuracy of hazard detection in Navigation mode and OCR in Text Reading mode.

### 3. Low Latency (Flash variant)
For navigation mode, speed is critical for safety. Gemini 3 Flash provides:
- < 2 second response time
- Real-time continuous processing
- Suitable for streaming applications

## Implementation Details

### API Setup

```typescript
// services/geminiService.ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (base64Image: string, prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      role: "user",
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt },
      ],
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 1024 },
      maxOutputTokens: 2048,
    },
  });
  return response.text;
};
```

### System Instruction

We use a carefully crafted system instruction to ensure responses are optimized for text-to-speech and accessibility:

```typescript
const SYSTEM_INSTRUCTION =
  "You are VisionAI, an expert accessibility assistant for a visually impaired user. " +
  "Your goal is to provide safety-critical, accurate, and concise information. " +
  "When analyzing images, first internalize the spatial layout and text, then speak directly to the user. " +
  "Do not use markdown formatting (like **bold** or *italics*) in your final response, " +
  "as it is being read aloud by a text-to-speech engine. " +
  "Keep responses natural and conversational but urgent when necessary.";
```

### Mode-Specific Prompts

Each of VisionAI's 6 modes uses a specialized prompt:

**Navigation Mode Example:**
```typescript
"You are a navigation guide. Scan the ground and path ahead.
1. Is the path clear? (Yes/No)
2. List immediate obstacles and their estimated distance in feet.
3. Check for tripping hazards (cords, steps, uneven ground) or head-height hazards.
4. Give a direct command: 'Safe to walk', 'Stop', 'Turn Left', or 'Turn Right'."
```

## Performance Optimization

### 1. Image Quality Balance
We capture images at 1024px width with 90% JPEG quality. This provides high enough resolution for OCR (Text Reading) while keeping payload sizes manageable for low latency.

### 2. Request Throttling
Continuous modes (Scene, Navigation) wait for Text-to-Speech to finish before triggering the next API call. This prevents API spam, reduces costs, and ensures the user isn't overwhelmed with audio overlap.

## Conclusion

Gemini 3 is not just a component of VisionAI - it IS VisionAI's intelligence. It enables a single, cohesive AI assistant that truly understands the visual world and can communicate it effectively to visually impaired users.
