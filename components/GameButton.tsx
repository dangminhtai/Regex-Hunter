import React from 'react';
import { CandidateString, GameState } from '../types';
import { MousePointer2, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  item: CandidateString;
  onClick: (id: string) => void;
  gameState: GameState;
}

const GameButton: React.FC<Props> = ({ item, onClick, gameState }) => {
  const isClickable = item.status === 'idle' && gameState === GameState.PLAYING;

  // Base styles
  let baseClasses = "relative group flex items-center justify-center p-4 rounded-lg font-bold text-lg transition-all duration-300 border-2 select-none overflow-hidden";
  
  // Status specific styles
  if (item.status === 'idle') {
    baseClasses += " bg-slate-800 border-slate-600 text-slate-300 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] cursor-pointer active:scale-95";
  } else if (item.status === 'correct') {
    // Biến mất dần
    baseClasses += " opacity-0 scale-50 bg-emerald-900 border-emerald-500 text-emerald-400 pointer-events-none";
  } else if (item.status === 'wrong') {
    baseClasses += " bg-red-900/50 border-red-500 text-red-400 animate-shake pointer-events-none";
  } else if (item.status === 'missed') {
    // Show correct items that were missed at end game
    baseClasses += " bg-slate-800 border-yellow-500 text-yellow-500 opacity-50 pointer-events-none";
  }

  return (
    <button
      onClick={() => isClickable && onClick(item.id)}
      disabled={!isClickable}
      className={baseClasses}
    >
      <span className="z-10 truncate max-w-full">{item.text}</span>
      
      {/* Hover Effect Background */}
      <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Icons for feedback */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300">
         {item.status === 'correct' && <CheckCircle2 size={16} />}
         {item.status === 'wrong' && <XCircle size={16} />}
      </div>
    </button>
  );
};

export default GameButton;