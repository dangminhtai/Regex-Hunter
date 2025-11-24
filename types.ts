
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
  status: 'idle' | 'correct' | 'wrong' | 'missed' | 'gone'; // 'gone' là khi rớt khỏi màn hình (cho chuỗi sai)
  
  // Physics properties
  x: number; // % Horizontal position (0-100)
  y: number; // % Vertical position (starts negative)
  speed: number; // Movement speed per frame
}

export interface LevelData {
  regex: string;
  candidates: string[]; // Danh sách chuỗi thô
}

export interface GameLevel {
  regex: string;
  items: CandidateString[];
}

export interface HighScore {
  id: string;
  name: string;
  score: number;
  date: number; // Timestamp
}
