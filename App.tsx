
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameLevel, CandidateString, GameMode } from './types';
import { generateLevel, getRegexHint } from './services/geminiService';
import { audioService } from './services/audioService';
import GameButton from './components/GameButton';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import RegexHUD from './components/RegexHUD';
import GameOverlays from './components/GameOverlays';
import SettingsModal from './components/SettingsModal';

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
  const [isMuted, setIsMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Hint State
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Refs for Game Loop to avoid closure staleness
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const levelDataRef = useRef<GameLevel | null>(null);
  const gameStateRef = useRef<GameState>(GameState.START);
  
  // Ref to prevent multiple victory triggers due to frame updates
  const victoryScheduledRef = useRef(false);

  // Sync refs
  useEffect(() => {
      levelDataRef.current = levelData;
  }, [levelData]);

  useEffect(() => {
      gameStateRef.current = gameState;
  }, [gameState]);


  const startNewLevel = useCallback(async (currentDifficulty: number, mode: GameMode) => {
    setGameState(GameState.LOADING);
    setMessage("Đang khởi tạo hệ thống...");
    setHint(null); 
    victoryScheduledRef.current = false; // Reset victory lock
    
    // Khởi tạo AudioContext nếu chưa có (cho lần chơi lại)
    audioService.init();

    const data = await generateLevel(currentDifficulty, mode);
    
    const regex = new RegExp(data.regex);
    
    // Khởi tạo items với Vật lý
    const items: CandidateString[] = data.candidates.map((text, index) => {
      // Random X position: 10% -> 80%
      const x = Math.floor(Math.random() * 70) + 15;
      
      // Staggered Y start: Rơi so le nhau
      // Mỗi item cách nhau một khoảng dựa trên độ khó.
      const gap = Math.max(15, 40 - currentDifficulty * 2); 
      const startY = -20 - (index * gap);

      // Tốc độ rơi: Tăng dần theo độ khó
      const baseSpeed = 0.05 + (currentDifficulty * 0.02);
      // Random nhẹ tốc độ để không quá đều
      const speed = baseSpeed + (Math.random() * 0.05);

      return {
        id: uid(),
        text,
        isMatch: regex.test(text),
        status: 'idle',
        x,
        y: startY,
        speed
      };
    });

    const newLevelData = {
      regex: data.regex,
      items
    };

    setLevelData(newLevelData);
    setGameState(GameState.PLAYING);
    setMessage("");
  }, []);

  const startGame = () => {
    audioService.init(); // Đảm bảo audio context được resume
    audioService.playBGM(); // Start Music
    setScore(0);
    setLives(3);
    setDifficulty(1);
    startNewLevel(1, gameMode);
  };

  const toggleMute = () => {
      const muted = audioService.toggleMute();
      setIsMuted(muted);
  };

  // --- GAME LOOP ---
  const animate = (time: number) => {
    if (gameStateRef.current !== GameState.PLAYING || !levelDataRef.current) {
        requestRef.current = requestAnimationFrame(animate);
        return;
    }

    if (lastTimeRef.current !== undefined) {
      // const deltaTime = time - lastTimeRef.current; 
      
      setLevelData(prev => {
        if (!prev) return null;

        let livesLost = 0;
        let gameOverTriggered = false;

        const newItems = prev.items.map(item => {
            if (item.status !== 'idle') return item; // Đã xử lý xong thì đứng im hoặc ẩn

            // Cập nhật vị trí
            const newY = item.y + item.speed;

            // KIỂM TRA VA CHẠM ĐÁY (Threshold 95%)
            if (newY > 95) {
                if (item.isMatch) {
                    // MẤT MẠNG: Chuỗi đúng mà để rơi
                    audioService.playSFX('miss'); // SOUND EFFECT
                    livesLost++;
                    return { ...item, y: newY, status: 'missed' as const };
                } else {
                    // KHÔNG SAO: Chuỗi sai rơi mất
                    return { ...item, y: newY, status: 'gone' as const };
                }
            }

            return { ...item, y: newY };
        });

        // Side Effects logic (thực hiện ở ngoài map)
        if (livesLost > 0) {
            setLives(prevLives => {
                const newLives = prevLives - livesLost;
                if (newLives <= 0 && !gameOverTriggered) {
                    gameOverTriggered = true;
                    // Trigger Game Over
                    setTimeout(() => {
                         audioService.stopBGM();
                         audioService.playSFX('gameover');
                         setGameState(GameState.GAME_OVER);
                    }, 0);
                }
                return newLives;
            });
        }

        return { ...prev, items: newItems };
      });
    }
    
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  // Check Level Complete Effect
  useEffect(() => {
      // Sử dụng victoryScheduledRef để đảm bảo logic thắng chỉ kích hoạt 1 lần duy nhất
      // Dù levelData thay đổi liên tục do physics loop
      if (gameState === GameState.PLAYING && levelData) {
          const remainingMatches = levelData.items.filter(i => i.isMatch && i.status === 'idle');
          
          // Nếu không còn match nào cần tìm VÀ chưa từng lên lịch thắng
          if (remainingMatches.length === 0 && levelData.items.length > 0 && !victoryScheduledRef.current) {
              
              victoryScheduledRef.current = true; // KHOÁ CHỐT NGAY LẬP TỨC

              // Sử dụng setTimeout fire-and-forget (không cleanup)
              setTimeout(() => {
                  setLives(currentLives => {
                      if (currentLives > 0) {
                          handleLevelComplete();
                      }
                      return currentLives;
                  });
              }, 800);
          }
      }
  }, [levelData, gameState]);


  const handleGetHint = async () => {
    if (!levelData || isHintLoading || hint) return;
    setIsHintLoading(true);
    const hintText = await getRegexHint(levelData.regex);
    setHint(hintText);
    setIsHintLoading(false);
  };

  const handleItemClick = (id: string) => {
    if (gameState !== GameState.PLAYING || !levelData) return;

    audioService.init();

    setLevelData(prev => {
      if (!prev) return null;
      const clickedItem = prev.items.find(i => i.id === id);
      if (!clickedItem || clickedItem.status !== 'idle') return prev;

      const isCorrect = clickedItem.isMatch;
      
      if (isCorrect) {
        audioService.playSFX('correct'); // SOUND EFFECT
        setScore(s => s + 10 + (difficulty * 2)); // Điểm thưởng theo độ khó
      } else {
        audioService.playSFX('wrong'); // SOUND EFFECT
        setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
                audioService.stopBGM();
                audioService.playSFX('gameover');
                setGameState(GameState.GAME_OVER);
            }
            return newLives;
        });
      }

      const newItems = prev.items.map(item => 
        item.id === id 
          ? { ...item, status: isCorrect ? 'correct' as const : 'wrong' as const } 
          : item
      );

      return { ...prev, items: newItems };
    });
  };

  const handleLevelComplete = () => {
    audioService.playSFX('levelup'); // SOUND EFFECT
    setGameState(GameState.VICTORY);
    setMessage("Level Cleared! Tăng tốc độ...");
    setTimeout(() => {
      const nextDiff = difficulty + 1;
      setDifficulty(nextDiff);
      startNewLevel(nextDiff, gameMode);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center overflow-hidden">
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <Header 
        gameState={gameState}
        score={score}
        lives={lives}
        difficulty={difficulty}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Game Area */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center relative px-2 md:px-4 pb-4">
        
        {/* START SCREEN */}
        {gameState === GameState.START && (
          <StartScreen 
            gameMode={gameMode} 
            setGameMode={setGameMode} 
            onStart={startGame} 
          />
        )}

        {/* LOADING SCREEN */}
        {gameState === GameState.LOADING && (
           <div className="flex flex-col items-center justify-center h-64 space-y-4 z-20 mt-20">
             <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-emerald-400 font-mono animate-pulse text-lg">{message}</p>
           </div>
        )}

        {/* ACTIVE GAMEPLAY */}
        {(gameState === GameState.PLAYING || gameState === GameState.VICTORY || gameState === GameState.GAME_OVER) && levelData && (
          <div className="w-full h-full flex flex-col">
            
            <RegexHUD 
                regex={levelData.regex}
                gameMode={gameMode}
                hint={hint}
                isHintLoading={isHintLoading}
                onGetHint={handleGetHint}
            />

            {/* Falling Area */}
            <div className="relative w-full flex-1 bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden shadow-inner min-h-[50vh] md:min-h-[60vh]">
                {/* Danger Zone Line */}
                <div className="absolute bottom-0 left-0 w-full h-[5%] bg-red-900/20 border-t border-red-500/30 pointer-events-none z-0 flex items-end justify-center">
                    <span className="text-[10px] text-red-500/50 uppercase tracking-widest mb-1 font-bold">Danger Zone</span>
                </div>

                {levelData.items.map(item => (
                    <GameButton 
                        key={item.id} 
                        item={item} 
                        onClick={handleItemClick}
                        gameState={gameState}
                    />
                ))}

                <GameOverlays 
                    gameState={gameState}
                    message={message}
                    score={score}
                    onRestart={startGame}
                />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-slate-600 text-[10px] text-center w-full bg-slate-900/90 border-t border-slate-800/50 z-10">
        <p>Engine: Procedural Generation + Gemini 2.5 Flash Lite</p>
      </footer>
    </div>
  );
}
