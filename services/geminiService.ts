import { LevelData, GameMode } from "../types";
import { generateProceduralLevel } from "./regexGenerator";
import { GoogleGenAI } from "@google/genai";

// Hàm tiện ích xáo trộn mảng
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Hàm sinh nhiễu (noise) để bao quanh chuỗi đúng trong chế độ Search
const addNoise = (core: string): string => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789_-.";
    const noiseLen = Math.floor(Math.random() * 3) + 1; // 1-3 ký tự rác
    let noise = "";
    for(let i=0; i<noiseLen; i++) noise += chars[Math.floor(Math.random() * chars.length)];
    
    // 50% nhiễu đầu, 50% nhiễu đuôi, hoặc cả hai
    const r = Math.random();
    if (r < 0.33) return noise + core;
    if (r < 0.66) return core + noise;
    return noise + core + noise;
};

// --- CORE GAMEPLAY: PROCEDURAL GENERATION ---
export const generateLevel = async (difficulty: number, mode: GameMode): Promise<LevelData> => {
  // Giả lập độ trễ tính toán cực nhỏ
  await new Promise(resolve => setTimeout(resolve, 50));

  // 1. Gọi Engine sinh Regex
  const coreData = generateProceduralLevel(difficulty);
  
  let finalRegex = coreData.regex;
  let finalCandidates: string[] = [];

  // 2. Xử lý theo Game Mode
  if (mode === 'fullmatch') {
      finalRegex = `^${coreData.regex}$`;
      finalCandidates = [...coreData.correct, ...coreData.wrong];
  } else if (mode === 'match') {
      finalRegex = `^${coreData.regex}`;
      const noisyCorrect = coreData.correct.map(s => Math.random() > 0.5 ? s + "..." : s);
      finalCandidates = [...noisyCorrect, ...coreData.wrong];
  } else {
      // Search Mode
      finalRegex = coreData.regex;
      const noisyCorrect = coreData.correct.map(s => addNoise(s));
      finalCandidates = [...noisyCorrect, ...coreData.wrong];
  }

  return {
    regex: finalRegex,
    candidates: shuffleArray(finalCandidates)
  };
};

// --- OPTIONAL AI FEATURE: HINTS ---
// Chỉ gọi khi người dùng yêu cầu
export const getRegexHint = async (regex: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "Chưa cấu hình API Key. Hãy tự phân tích nhé!";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Sử dụng Flash Lite cho nhanh và rẻ
    const model = 'gemini-flash-lite-latest';
    
    const prompt = `Giải thích ngắn gọn (dưới 20 từ) Pattern Regex sau đây khớp với cái gì. Dùng tiếng Việt. Chỉ giải thích ý nghĩa, không đưa ra ví dụ.
    Regex: /${regex}/`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Không thể tạo gợi ý lúc này.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Lỗi kết nối AI. Bạn phải tự lực cánh sinh rồi!";
  }
};