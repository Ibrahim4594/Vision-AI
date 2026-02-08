import { GoogleGenAI } from "@google/genai";
import { 
  GEMINI_FAST_MODEL, 
  GEMINI_PRO_MODEL, 
  GEMINI_FALLBACK_MODEL, 
  GEMINI_SAFE_MODEL,
  SYSTEM_INSTRUCTION 
} from "../constants";

interface AnalysisOptions {
  usePro?: boolean;
}

/**
 * analyzes an image using Gemini.
 * Uses Flash for speed (default) or Pro for complex reasoning (Chat).
 * Automatically falls back to backup models if quota is exceeded or model is missing.
 */
export const analyzeImage = async (
  base64Image: string,
  prompt: string,
  options: AnalysisOptions = {},
  retries: number = 3
): Promise<string> => {
  // Re-initialize client on every request to pick up any API key changes from window.aistudio selection
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let modelName = options.usePro ? GEMINI_PRO_MODEL : GEMINI_FAST_MODEL;
  
  // Track which models we've tried to avoid infinite loops
  const triedModels = new Set<string>();

  // Helper to get config based on current model
  const getConfig = (currentModel: string) => {
     const baseConfig: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
     };

     // Only use Thinking Config for Gemini 3 series
     if (currentModel.includes('gemini-3')) {
        baseConfig.thinkingConfig = { thinkingBudget: 16384 }; // Reduced budget for speed/quota
     } else {
        baseConfig.maxOutputTokens = 1024;
     }
     return baseConfig;
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      triedModels.add(modelName);

      // Strip the data:image/jpeg;base64, prefix if present
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: getConfig(modelName),
      });

      return response.text || "I could not analyze the image.";
    } catch (error: any) {
      console.error(`Gemini API Error (${modelName}, attempt ${attempt}/${retries}):`, error);

      // Check for Quota (429) or Not Found (404)
      const isQuotaError = error.status === 429 || 
                           (error.message && (
                             error.message.toLowerCase().includes('quota') || 
                             error.message.includes('429') ||
                             error.message.toLowerCase().includes('resource exhausted')
                           ));
                           
      const isNotFoundError = error.status === 404 || 
                              (error.message && (
                                error.message.toLowerCase().includes('not found') || 
                                error.message.includes('404')
                              ));

      // Fallback Logic
      if ((isQuotaError || isNotFoundError) && modelName !== GEMINI_SAFE_MODEL) {
        let nextModel = '';

        if (modelName === GEMINI_FAST_MODEL || modelName === GEMINI_PRO_MODEL) {
            // First fallback: Gemini 2.0
            nextModel = GEMINI_FALLBACK_MODEL;
        } else if (modelName === GEMINI_FALLBACK_MODEL) {
            // Ultimate fallback: Gemini Flash Latest (Safe Mode)
            nextModel = GEMINI_SAFE_MODEL;
        }

        if (nextModel && !triedModels.has(nextModel)) {
            console.warn(`Error with ${modelName} (${isQuotaError ? 'Quota' : 'Not Found'}). Switching to: ${nextModel}`);
            modelName = nextModel;
            // Don't count as an attempt failure, try immediately
            attempt--; 
            continue;
        }
      }

      // If last attempt, return detailed error for UI
      if (attempt === retries) {
        if (error.message?.includes('API key')) {
           return "Configuration Error: Invalid API Key.";
        }
        if (isQuotaError) {
            return "Usage limit reached. Please try again in a moment.";
        }
        if (isNotFoundError) {
            return "Model unavailable. Please try again later.";
        }
        return "Sorry, I am having trouble connecting to the network right now.";
      }

      // Wait before retry (exponential backoff: 1s, 2s, 3s...)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return "Connection failed after multiple attempts.";
};