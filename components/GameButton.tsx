import React from 'react';
import { CandidateString, GameState } from '../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  item: CandidateString;
  onClick: (id: string) => void;
  gameState: GameState;
}

const GameButton: React.FC<Props> = ({ item, onClick, gameState }) => {
  const isClickable = item.status === 'idle' && gameState === GameState.PLAYING;

  // Base styles
  // Chuyển sang absolute positioning
  let baseClasses = "absolute transform -translate-x-1/2 flex items-center justify-center px-4 py-2 rounded-lg font-bold text-sm md:text-base transition-colors duration-75 border-2 select-none overflow-hidden shadow-lg whitespace-nowrap z-10";
  
  // Status specific styles
  if (item.status === 'idle') {
    baseClasses += " bg-slate-800 border-slate-600 text-slate-300 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] cursor-pointer active:scale-95 hover:z-20";
  } else if (item.status === 'correct') {
    baseClasses += " opacity-0 scale-150 transition-all duration-300 bg-emerald-900 border-emerald-500 text-emerald-400 pointer-events-none";
  } else if (item.status === 'wrong') {
    baseClasses += " bg-red-900/80 border-red-500 text-red-200 animate-shake pointer-events-none z-0";
  } else if (item.status === 'missed') {
    baseClasses += " bg-slate-800 border-yellow-600 text-yellow-600 opacity-60 pointer-events-none grayscale";
  } else if (item.status === 'gone') {
    return null; // Không render nếu đã biến mất (cho chuỗi sai rơi xuống)
  }

  return (
    <button
      onClick={() => isClickable && onClick(item.id)}
      disabled={!isClickable}
      className={baseClasses}
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
      }}
    >
      <span className="z-10">{item.text}</span>
      
      {/* Icons for feedback */}
      <div className="absolute -right-2 -top-2 opacity-0 transition-opacity duration-300">
         {item.status === 'correct' && <CheckCircle2 size={16} className="text-emerald-400 bg-slate-900 rounded-full" />}
         {item.status === 'wrong' && <XCircle size={16} className="text-red-500 bg-slate-900 rounded-full" />}
      </div>
    </button>
  );
};

export default GameButton;