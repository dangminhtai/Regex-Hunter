
import { LevelData, GameMode } from "../types";
import { STATIC_LEVELS } from "./staticLevels";

// Hàm tiện ích để lấy ngẫu nhiên phần tử mảng
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Hàm xáo trộn mảng
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateLevel = async (difficulty: number, mode: GameMode): Promise<LevelData> => {
  // Giả lập độ trễ mạng cực nhỏ để tạo cảm giác "loading" mượt mà
  await new Promise(resolve => setTimeout(resolve, 300));

  // 1. Lọc các level phù hợp với độ khó
  // Difficulty 1-3: Easy
  // Difficulty 4-6: Medium
  // Difficulty 7+: Hard
  // Nếu không có level chính xác, lấy random toàn bộ để game không bị crash
  let availableLevels = STATIC_LEVELS.filter(l => {
    if (difficulty <= 3) return l.difficulty <= 3;
    if (difficulty <= 6) return l.difficulty > 3 && l.difficulty <= 6;
    return l.difficulty > 6;
  });

  if (availableLevels.length === 0) {
    availableLevels = STATIC_LEVELS;
  }

  // 2. Chọn ngẫu nhiên một đề bài
  const rawLevel = getRandomItem(availableLevels);

  // 3. Biến đổi Regex theo Game Mode
  let finalRegex = rawLevel.rawRegex;
  let modeDescription = "";

  switch (mode) {
    case 'fullmatch':
      // Nếu regex chưa có neo, thêm vào
      if (!finalRegex.startsWith('^')) finalRegex = '^' + finalRegex;
      if (!finalRegex.endsWith('$')) finalRegex = finalRegex + '$';
      modeDescription = "(Yêu cầu khớp toàn bộ)";
      break;
    case 'match':
      if (!finalRegex.startsWith('^')) finalRegex = '^' + finalRegex;
      // Nếu có $ ở cuối thì bỏ đi để phù hợp chế độ "Match Start"
      if (finalRegex.endsWith('$') && !rawLevel.rawRegex.endsWith('$')) {
          finalRegex = finalRegex.slice(0, -1);
      }
      modeDescription = "(Yêu cầu bắt đầu bằng...)";
      break;
    case 'search':
    default:
      // Xóa neo nếu có trong raw (trừ khi rawRegex bản chất đã có)
      // Ở đây ta giả định rawRegex trong staticLevels được viết cho dạng search/general
      // Tuy nhiên nếu rawRegex có ^ hoặc $ cứng, ta giữ nguyên tôn trọng người ra đề
      modeDescription = "(Tìm chuỗi con)";
      break;
  }

  // 4. Validate và Lọc Candidates
  // Ta cần đảm bảo rằng với Regex MỚI (đã thêm ^ $), danh sách candidates vẫn hợp lý.
  // Ví dụ: Regex gốc \d{3}. Candidates "abc123xyz".
  // - Mode Search: Match (ĐÚNG)
  // - Mode FullMatch: ^\d{3}$ -> Fail (ĐÚNG logic)
  
  // Chúng ta lấy danh sách candidates gốc và trộn lên
  let candidates = shuffleArray(rawLevel.candidates);

  // Đảm bảo luôn có ít nhất 1 đáp án đúng trong danh sách trả về
  // Thực tế bộ data static đã thiết kế để có match/no-match, nhưng khi đổi mode (ví dụ sang FullMatch),
  // số lượng match có thể giảm về 0.
  // Ta cần kiểm tra:
  const tempRegex = new RegExp(finalRegex);
  const hasMatch = candidates.some(c => tempRegex.test(c));

  if (!hasMatch) {
    // Nếu chế độ chơi quá khó khiến không chuỗi nào khớp (VD: bắt search "abc" thành fullmatch "abc" mà input toàn "xyzabc"),
    // Ta phải "hack" một chút: Tạo ra một candidate đúng từ chính regex (Rất khó nếu regex phức tạp)
    // HOẶC đơn giản hơn: Fallback về mode 'search' cho level này nếu không tìm thấy match nào phù hợp mode hiện tại
    // Nhưng cách tốt nhất cho Static Data: Đảm bảo Data Candidates đa dạng (đã làm ở file staticLevels).
    
    // Fallback an toàn: Nếu không có match nào, ta quay về regex gốc (Search mode) để game không bị kẹt
    // Hoặc báo lỗi. Ở đây ta chọn cách revert về search mode regex nếu cần thiết
    if (mode !== 'search') {
        console.warn(`Level "${rawLevel.description}" không có đáp án đúng ở chế độ ${mode}. Revert về search mode.`);
        finalRegex = rawLevel.rawRegex; 
    }
  }

  return {
    regex: finalRegex,
    description: `${rawLevel.description} ${modeDescription}`,
    candidates: candidates
  };
};
