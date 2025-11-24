
import { HighScore } from "../types";

const KEY_USER = 'rh_username';
const KEY_SCORES = 'rh_highscores';

const generateDefaultName = () => {
    const suffix = Math.floor(Math.random() * 9000) + 1000;
    return `RegexHacker#${suffix}`;
};

// Dữ liệu mẫu ban đầu để bảng xếp hạng không bị trống
const SEED_DATA: HighScore[] = [
  { id: 'seed_1', name: 'MinhTai', score: 2450, date: Date.now() - 86400000 * 2 }, 
  { id: 'seed_2', name: 'trongNhan2207', score: 2180, date: Date.now() - 86400000 * 5 },
  { id: 'seed_3', name: 'Duybuoito', score: 1950, date: Date.now() - 86400000 * 1 },
  { id: 'seed_4', name: 'Vinhsaygex123', score: 1820, date: Date.now() - 86400000 * 3 },
  { id: 'seed_5', name: 'baohoang', score: 1650, date: Date.now() - 86400000 * 7 },
  { id: 'seed_6', name: 'TuanBui', score: 1400, date: Date.now() - 86400000 * 4 },
  { id: 'seed_7', name: 'leQuocHung', score: 1200, date: Date.now() - 86400000 * 6 },
  { id: 'seed_8', name: 'AnhKiet', score: 980, date: Date.now() - 86400000 * 8 },
  { id: 'seed_9', name: 'hoangtuannam', score: 850, date: Date.now() - 86400000 * 10 },
  { id: 'seed_10', name: 'GiaBaoDo', score: 500, date: Date.now() - 86400000 * 12 },
];


export const storageService = {
    // --- USERNAME ---
    getUsername: (): string => {
        const stored = localStorage.getItem(KEY_USER);
        if (stored) return stored;
        
        const newName = generateDefaultName();
        localStorage.setItem(KEY_USER, newName);
        return newName;
    },

    setUsername: (name: string) => {
        if (!name.trim()) return;
        localStorage.setItem(KEY_USER, name.trim());
    },

    // --- LEADERBOARD ---
    getHighScores: (): HighScore[] => {
        try {
            const stored = localStorage.getItem(KEY_SCORES);
            if (!stored) {
                // Nếu chưa có dữ liệu, nạp seed data vào
                localStorage.setItem(KEY_SCORES, JSON.stringify(SEED_DATA));
                return SEED_DATA;
            }
            
            const parsed = JSON.parse(stored);
            // Nếu mảng rỗng (do lỗi hoặc user xóa tay), nạp lại seed data
            if (Array.isArray(parsed) && parsed.length === 0) {
                 localStorage.setItem(KEY_SCORES, JSON.stringify(SEED_DATA));
                 return SEED_DATA;
            }
            
            return parsed;
        } catch (e) {
            console.error("Error reading scores", e);
            // Fallback nếu lỗi parse JSON
            return SEED_DATA;
        }
    },

    saveScore: (name: string, score: number) => {
        const scores = storageService.getHighScores();
        
        const newEntry: HighScore = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            score: score,
            date: Date.now()
        };

        // Thêm điểm mới
        scores.push(newEntry);

        // Sắp xếp giảm dần theo điểm
        scores.sort((a, b) => b.score - a.score);

        // Giữ lại Top 10
        const top10 = scores.slice(0, 10);

        localStorage.setItem(KEY_SCORES, JSON.stringify(top10));
        return top10;
    }
};
