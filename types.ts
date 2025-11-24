export enum GameState {
  START = 'START',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  VICTORY = 'VICTORY',
  GAME_OVER = 'GAME_OVER'
}

export type GameMode = 'search' | 'match' | 'fullmatch';

export interface CandidateString {
  id: string;
  text: string;
  isMatch: boolean; // Dùng để verify logic sau khi generate
  status: 'idle' | 'correct' | 'wrong' | 'missed'; // Trạng thái hiển thị
}

export interface LevelData {
  regex: string;
  description: string; // Giải thích ngắn gọn về regex
  candidates: string[]; // Danh sách chuỗi thô từ AI
}

export interface GameLevel {
  regex: string;
  description: string;
  items: CandidateString[];
}