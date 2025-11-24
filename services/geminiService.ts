import { LevelData, GameMode } from "../types";
import { generateProceduralLevel } from "./regexGenerator";

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

export const generateLevel = async (difficulty: number, mode: GameMode): Promise<LevelData> => {
  // Giả lập độ trễ tính toán cực nhỏ
  await new Promise(resolve => setTimeout(resolve, 100));

  // 1. Gọi Engine sinh Regex
  // Lưu ý: Engine luôn sinh ra regex "lõi" (core pattern)
  const coreData = generateProceduralLevel(difficulty);
  
  let finalRegex = coreData.regex;
  let finalCandidates: string[] = [];

  // 2. Xử lý theo Game Mode
  if (mode === 'fullmatch') {
      // Chế độ Full Match: Regex phải có ^ và $
      // Chuỗi đúng phải khớp 100%
      // Chuỗi sai: Đã được engine sinh ra (sai ký tự, sai độ dài)
      
      finalRegex = `^${coreData.regex}$`;
      finalCandidates = [...coreData.correct, ...coreData.wrong];

  } else if (mode === 'match') {
      // Chế độ Match Start: Regex có ^
      // Chuỗi đúng: Core match + (có thể có đuôi rác)
      // Chuỗi sai: Core wrong + ...
      
      finalRegex = `^${coreData.regex}`;
      
      const noisyCorrect = coreData.correct.map(s => Math.random() > 0.5 ? s + "..." : s);
      finalCandidates = [...noisyCorrect, ...coreData.wrong];

  } else {
      // Chế độ Search (Default): Regex để trần
      // Chuỗi đúng: Cần thêm nhiễu bao quanh (Surrounding noise) để người chơi phải tìm substring
      // Nếu để nguyên chuỗi đúng thì quá dễ (trông giống full match)
      
      // Giữ nguyên regex core
      finalRegex = coreData.regex;

      // Thêm nhiễu vào chuỗi đúng để biến nó thành bài toán tìm kiếm substring
      const noisyCorrect = coreData.correct.map(s => addNoise(s));
      
      // Với chuỗi sai, ta cũng có thể thêm nhiễu để đánh lạc hướng, 
      // nhưng phải cẩn thận ko vô tình tạo ra chuỗi đúng trong nhiễu.
      // Tạm thời giữ nguyên chuỗi sai từ engine (vốn đã sai core pattern)
      finalCandidates = [...noisyCorrect, ...coreData.wrong];
  }

  // 3. Trộn và trả về
  return {
    regex: finalRegex,
    candidates: shuffleArray(finalCandidates)
  };
};