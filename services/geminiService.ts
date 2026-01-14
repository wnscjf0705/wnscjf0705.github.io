import { GoogleGenAI, Type } from "@google/genai";

// Helper to get API key safely
const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

export const generateSampleNames = async (count: number = 20): Promise<string[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of ${count} realistic Korean full names. Return only the names as a JSON array of strings. Do not include markdown code blocks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const names = JSON.parse(text);
    return Array.isArray(names) ? names : [];
  } catch (error) {
    console.error("Failed to generate names:", error);
    return [];
  }
};
