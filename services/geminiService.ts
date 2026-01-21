import { GoogleGenAI, Type } from "@google/genai";

export const generateGiftSuggestion = async (
  query: string, 
  availableProducts: string[]
): Promise<{ suggestion: string; reason: string; recommendedProduct: string }> => {
  
  if (!process.env.API_KEY) {
    // Fallback if no key is present for the demo
    return {
      suggestion: "瞌睡小兔玩偶",
      reason: "没有 API Key 我只能猜啦！但谁能拒绝一只可爱的小兔子呢？",
      recommendedProduct: "瞌睡小兔玩偶"
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        你是一家手工毛线编织店的贴心店员。
        用户正在寻找礼物： "${query}".
        
        现有商品列表: ${availableProducts.join(', ')}.

        请从列表中推荐 ONE (一个) 最符合用户需求的商品。
        请用**中文**回答。
        语气要求：可爱、温暖、热情、治愈。
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestion: { type: Type.STRING },
            reason: { type: Type.STRING },
            recommendedProduct: { type: Type.STRING }
          },
          required: ["suggestion", "reason", "recommendedProduct"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      suggestion: "温暖围巾",
      reason: "我的毛线球打结了，想不出主意... 但送温暖总没错！",
      recommendedProduct: availableProducts[0]
    };
  }
};