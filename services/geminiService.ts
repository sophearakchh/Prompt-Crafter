import { GoogleGenAI } from "@google/genai";
import { ModelType, PromptStyle } from "../types";

// Declare process to satisfy TypeScript compiler since it is injected by Vite at build time
declare const process: {
  env: {
    API_KEY: string;
  };
};

// Helper to convert Blob/File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the Data-URL prefix (e.g. "data:image/jpeg;base64,") to get just the base64 data
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getSystemInstruction = (style: PromptStyle): string => {
  switch (style) {
    case PromptStyle.MIDJOURNEY:
      return "You are an expert AI art prompt engineer. Analyze the input media and create a detailed, comma-separated prompt suitable for Midjourney or Stable Diffusion. Focus on lighting, artistic style, medium (e.g., oil painting, 35mm photography), composition, and mood. Start with the main subject.";
    case PromptStyle.ACCESSIBILITY:
      return "You are an accessibility expert. Provide a clear, concise, and objective description of the image or video for a screen reader (Alt Text). Focus on the most important information first. Do not use flowery language.";
    case PromptStyle.TAGS:
      return "Analyze the media and provide a list of relevant SEO keywords and tags separated by commas. Focus on objects, colors, styles, and concepts visible.";
    case PromptStyle.DESCRIPTIVE:
    default:
      return "You are a visual analyst. Provide a comprehensive and fluid description of what is happening in the media. Describe the setting, characters/subjects, action, and atmosphere in natural language.";
  }
};

export const generatePromptFromMedia = async (
  file: File,
  model: ModelType,
  style: PromptStyle
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare the media part
    const mediaPart = await fileToGenerativePart(file);

    // Prepare the system instruction based on style
    const systemInstruction = getSystemInstruction(style);

    const userPrompt = "Analyze this media and generate the output based on the assigned persona/style.";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        role: 'user',
        parts: [
          mediaPart,
          { text: userPrompt }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, // Lower temperature for more accurate descriptions
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text generated from the model.");
    }
    return text;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze media.");
  }
};