
import { HighScore } from "../types";

const KEY_USER = 'rh_username';
const KEY_SCORES = 'rh_highscores';

const generateDefaultName = () => {
    const suffix = Math.floor(Math.random() * 9000) + 1000;
    return `RegexHacker#${suffix}`;
};

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
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Error reading scores", e);
            return [];
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
