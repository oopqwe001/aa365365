import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async predictLuckyNumbers(gameName: string, pickCount: number, maxNumber: number): Promise<number[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `あなたは宝くじの専門家です。${gameName}（1から${maxNumber}の中から${pickCount}个选ぶ）のラッキーナンバーを${pickCount}个予測してください。
        直近のトレンドや数秘術的な観点から、期待値の高そうな数字を厳選してください。
        返信はJSON形式で、"numbers"というキーに数字の配列を入れて返してください。例: {"numbers": [1, 5, 12, ...]}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              numbers: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER }
              }
            },
            required: ["numbers"]
          }
        }
      });

      const result = JSON.parse(response.text || '{"numbers": []}');
      // 确保数字在范围内且不重复
      const validNumbers = Array.from(new Set(result.numbers as number[]))
        .filter(n => n >= 1 && n <= maxNumber)
        .slice(0, pickCount)
        .sort((a, b) => a - b);
      
      return validNumbers;
    } catch (error) {
      console.error("Gemini Prediction Error:", error);
      return [];
    }
  }
};