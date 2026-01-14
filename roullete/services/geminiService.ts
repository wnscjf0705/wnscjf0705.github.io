import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestMenus = async (count: number = 6): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest ${count} popular, distinct, and short lunch menu names in Korean. e.g. "Kimchi Stew", "Pasta". Just the names.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            menus: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of menu names",
            },
          },
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      if (parsed.menus && Array.isArray(parsed.menus)) {
        return parsed.menus;
      }
    }
    return ["김치찌개", "돈까스", "제육볶음", "파스타", "짜장면", "햄버거"];
  } catch (error) {
    console.error("Failed to fetch menus from Gemini:", error);
    // Fallback if API fails
    return ["피자", "치킨", "삼겹살", "냉면", "비빔밥", "초밥"];
  }
};