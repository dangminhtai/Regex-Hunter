
import React, { useState, useCallback } from 'react';
import { GameState, GameLevel, CandidateString, GameMode } from './types';
import { generateLevel } from './services/geminiService';
import GameButton from './components/GameButton';
import { Terminal, Heart, Trophy, RefreshCw, Play, AlertTriangle, ShieldCheck, CheckCircle2, Search, ArrowRightFromLine, Maximize2 } from 'lucide-react';

// Utility to generate unique IDs
const uid = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [levelData, setLevelData] = useState<GameLevel | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<string>("");
  const [gameMode, setGameMode] = useState<GameMode>('search');

  const startNewLevel = useCallback(async (currentDifficulty: number, mode: GameMode) => {
    setGameState(GameState.LOADING);
    setMessage("Đang khởi tạo hệ thống...");
    
    const data = await generateLevel(currentDifficulty, mode);
    
    // Validate candidates locally - Double check logic
    const regex = new RegExp(data.regex);
    const items: CandidateString[] = data.candidates.map(text => ({
      id: uid(),
      text,
      isMatch: regex.test(text),
      status: 'idle'
    }));

    setLevelData({
      regex: data.regex,
      items
    });
    
    setGameState(GameState.PLAYING);
    setMessage("");
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setDifficulty(1);
    startNewLevel(1, gameMode);
  };

  const handleItemClick = (id: string) => {
    if (gameState !== GameState.PLAYING || !levelData) return;

    setLevelData(prev => {
      if (!prev) return null;

      const clickedItem = prev.items.find(i => i.id === id);
      if (!clickedItem) return prev;

      const isCorrect = clickedItem.isMatch;
      
      // Update item status
      const newItems = prev.items.map(item => 
        item.id === id 
          ? { ...item, status: isCorrect ? 'correct' as const : 'wrong' as const } 
          : item
      );

      // Game Logic Side Effects
      if (isCorrect) {
        setScore(s => s + 10);
        // Check win condition for level
        const remainingMatches = newItems.filter(i => i.isMatch && i.status === 'idle');
        if (remainingMatches.length === 0) {
          setTimeout(() => handleLevelComplete(), 500);
        }
      } else {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setTimeout(() => handleGameOver(newItems), 500);
          }
          return newLives;
        });
      }

      return { ...prev, items: newItems };
    });
  };

  const handleLevelComplete = () => {
    setGameState(GameState.VICTORY);
    setMessage("Level Complete! Đang tăng độ khó...");
    setTimeout(() => {
      const nextDiff = difficulty + 1;
      setDifficulty(nextDiff);
      startNewLevel(nextDiff, gameMode);
    }, 1500);
  };

  const handleGameOver = (finalItems: CandidateString[]) => {
    setGameState(GameState.GAME_OVER);
    // Reveal missed items
    setLevelData(prev => {
        if(!prev) return null;
        return {
            ...prev,
            items: finalItems.map(i => i.isMatch && i.status === 'idle' ? {...i, status: 'missed'} : i)
        }
    })
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tighter">REGEX <span className="text-emerald-400">HUNTER</span></h1>
        </div>
        
        {gameState !== GameState.START && (
            <div className="flex gap-4 md:gap-6 font-mono text-sm md:text-base">
            <div className="flex items-center gap-2 text-red-400">
                <Heart className={`fill-current ${lives <= 1 ? 'animate-pulse' : ''}`} size={20} />
                <span>x{lives}</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
                <Trophy className="fill-current" size={20} />
                <span>{score}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400 hidden sm:flex">
                <ShieldCheck size={20} />
                <span>LVL {difficulty}</span>
            </div>
            </div>
        )}
      </header>

      {/* Game Area */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center relative">
        
        {/* State: START */}
        {gameState === GameState.START && (
          <div className="text-center mt-10 space-y-6 animate-fade-in w-full max-w-lg">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Terminal size={48} className="text-emerald-400" />
            </div>
            <h2 className="text-4xl font-bold">Regex Hunter</h2>
            <p className="text-slate-400">
              Chọn chế độ và chứng minh kỹ năng Regex của bạn.
            </p>

            {/* Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-8">
                <button 
                  onClick={() => setGameMode('search')}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${gameMode === 'search' ? 'bg-slate-800 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                    <Search size={24} />
                    <span className="font-bold text-sm">SEARCH</span>
                    <span className="text-xs opacity-70">Tìm chuỗi con</span>
                </button>

                <button 
                  onClick={() => setGameMode('match')}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${gameMode === 'match' ? 'bg-slate-800 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                    <ArrowRightFromLine size={24} />
                    <span className="font-bold text-sm">MATCH START</span>
                    <span className="text-xs opacity-70">Khớp đầu chuỗi</span>
                </button>

                <button 
                  onClick={() => setGameMode('fullmatch')}
                  className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${gameMode === 'fullmatch' ? 'bg-slate-800 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                    <Maximize2 size={24} />
                    <span className="font-bold text-sm">FULL MATCH</span>
                    <span className="text-xs opacity-70">Khớp toàn bộ</span>
                </button>
            </div>

            <button 
              onClick={startGame}
              className="w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-lg"
            >
              <Play size={24} /> BẮT ĐẦU CHIẾN
            </button>
          </div>
        )}

        {/* State: LOADING */}
        {gameState === GameState.LOADING && (
           <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-emerald-400 font-mono animate-pulse">{message}</p>
           </div>
        )}

        {/* State: PLAYING / VICTORY / GAME_OVER (Show board) */}
        {(gameState === GameState.PLAYING || gameState === GameState.VICTORY || gameState === GameState.GAME_OVER) && levelData && (
          <div className="w-full space-y-8 animate-fade-in">
            
            {/* Regex Display */}
            <div className="bg-black/50 border border-slate-700 rounded-xl p-6 text-center relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
               <div className="flex justify-center items-center gap-2 text-slate-500 text-sm mb-2 uppercase tracking-widest font-bold">
                 <span>MỤC TIÊU:</span>
                 {gameMode === 'search' && <span className="text-emerald-400 flex items-center gap-1"><Search size={14}/> Search</span>}
                 {gameMode === 'match' && <span className="text-blue-400 flex items-center gap-1"><ArrowRightFromLine size={14}/> Match Start</span>}
                 {gameMode === 'fullmatch' && <span className="text-purple-400 flex items-center gap-1"><Maximize2 size={14}/> Full Match</span>}
               </div>
               <code className="block text-3xl md:text-5xl font-mono text-emerald-400 neon-text break-words px-2">
                 /{levelData.regex}/
               </code>
               <p className="text-slate-500 mt-2 text-xs uppercase tracking-wider">
                 Tự phân tích cú pháp. Không có gợi ý.
               </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
              {levelData.items.map(item => (
                <GameButton 
                  key={item.id} 
                  item={item} 
                  onClick={handleItemClick}
                  gameState={gameState}
                />
              ))}
            </div>

            {/* Overlay Messages */}
            {gameState === GameState.VICTORY && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                    <div className="text-center p-8 bg-slate-900 border border-emerald-500 rounded-2xl shadow-2xl">
                        <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">NHIỆM VỤ HOÀN THÀNH</h2>
                        <p className="text-emerald-300 mb-4">{message}</p>
                    </div>
                </div>
            )}

            {gameState === GameState.GAME_OVER && (
                 <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-500">
                 <div className="text-center p-8 bg-slate-900 border border-red-600 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)] max-w-md w-full mx-4">
                     <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
                     <h2 className="text-4xl font-bold text-red-500 mb-2">GAME TOANG!</h2>
                     <p className="text-slate-300 mb-6">Bạn đã chọn sai quá 3 lần.</p>
                     
                     <div className="bg-slate-800 p-4 rounded-lg mb-6">
                        <p className="text-slate-400 text-sm">Điểm số cuối cùng</p>
                        <p className="text-3xl font-mono text-yellow-400 font-bold">{score}</p>
                     </div>

                     <button 
                       onClick={startGame}
                       className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                     >
                       <RefreshCw size={20} /> CHƠI LẠI TỪ ĐẦU
                     </button>
                 </div>
             </div>
            )}

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 text-slate-600 text-sm text-center py-4">
        <p>Engine: Procedural Generation (v1.0)</p>
      </footer>

      {/* Custom Keyframe animation for Shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
