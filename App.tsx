
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameLevel, CandidateString, GameMode } from './types';
import { generateLevel, getRegexHint } from './services/geminiService';
import { audioService } from './services/audioService';
import { storageService } from './services/storageService'; 
import GameButton from './components/GameButton';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import RegexHUD from './components/RegexHUD';
import GameOverlays from './components/GameOverlays';
import SettingsModal from './components/SettingsModal';
import LeaderboardModal from './components/LeaderboardModal';
import UsernameModal from './components/UsernameModal';
import PauseOverlay from './components/PauseOverlay'; // New

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
  const [isPaused, setIsPaused] = useState(false); // New Pause State
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isUsernameOpen, setIsUsernameOpen] = useState(false);
  
  // User Data
  const [username, setUsername] = useState("Player");

  // Hint State
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Refs for Game Loop
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const levelDataRef = useRef<GameLevel | null>(null);
  const gameStateRef = useRef<GameState>(GameState.START);
  const victoryScheduledRef = useRef(false);
  const isPausedRef = useRef(false); // Ref for sync in loop

  // Load User Data on Mount
  useEffect(() => {
    setUsername(storageService.getUsername());
  }, []);

  // Sync refs
  useEffect(() => {
      levelDataRef.current = levelData;
  }, [levelData]);

  useEffect(() => {
      gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
      isPausedRef.current = isPaused;
  }, [isPaused]);

  // AUTO PAUSE ON TAB SWITCH
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.hidden && gameStateRef.current === GameState.PLAYING) {
              setIsPaused(true);
          }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // SAVE SCORE ON GAME OVER
  useEffect(() => {
      if (gameState === GameState.GAME_OVER) {
          storageService.saveScore(username, score);
      }
  }, [gameState, score, username]);


  const startNewLevel = useCallback(async (currentDifficulty: number, mode: GameMode) => {
    setGameState(GameState.LOADING);
    setMessage("Đang khởi tạo hệ thống...");
    setHint(null); 
    victoryScheduledRef.current = false; 
    setIsPaused(false);
    
    audioService.init();

    const data = await generateLevel(currentDifficulty, mode);
    const regex = new RegExp(data.regex);
    
    // Khởi tạo items
    const items: CandidateString[] = data.candidates.map((text, index) => {
      const x = Math.floor(Math.random() * 70) + 15;
      const gap = Math.max(15, 40 - currentDifficulty * 2); 
      const startY = -20 - (index * gap);
      const baseSpeed = 0.05 + (currentDifficulty * 0.02);
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

    setLevelData({ regex: data.regex, items });
    setGameState(GameState.PLAYING);
    setMessage("");
  }, []);

  const startGame = () => {
    audioService.init(); 
    audioService.playBGM(); 
    setScore(0);
    setLives(3);
    setDifficulty(1);
    startNewLevel(1, gameMode);
  };

  const goHome = () => {
      setGameState(GameState.START);
      setLevelData(null);
      setScore(0);
      setLives(3);
      setIsPaused(false);
      audioService.stopBGM();
      // Reset hints
      setHint(null);
  };

  const toggleMute = () => {
      const muted = audioService.toggleMute();
      setIsMuted(muted);
  };

  const togglePause = () => {
      if (gameState === GameState.PLAYING) {
          setIsPaused(prev => !prev);
      }
  };

  // --- GAME LOOP ---
  const animate = (time: number) => {
    // Nếu game không chơi hoặc đang PAUSE thì skip logic update
    if (gameStateRef.current !== GameState.PLAYING || isPausedRef.current || !levelDataRef.current) {
        lastTimeRef.current = time; // Cập nhật time để tránh jump frame khi resume
        requestRef.current = requestAnimationFrame(animate);
        return;
    }

    if (lastTimeRef.current !== undefined) {
      // Calculate delta if needed for smoother physics, currently per frame
      
      setLevelData(prev => {
        if (!prev) return null;

        let livesLost = 0;
        let gameOverTriggered = false;

        const newItems = prev.items.map(item => {
            if (item.status !== 'idle') return item; 

            const newY = item.y + item.speed;

            if (newY > 95) {
                if (item.isMatch) {
                    audioService.playSFX('miss');
                    livesLost++;
                    return { ...item, y: newY, status: 'missed' as const };
                } else {
                    return { ...item, y: newY, status: 'gone' as const };
                }
            }
            return { ...item, y: newY };
        });

        if (livesLost > 0) {
            setLives(prevLives => {
                const newLives = prevLives - livesLost;
                if (newLives <= 0 && !gameOverTriggered) {
                    gameOverTriggered = true;
                    // Move logic outside setState to avoid side effects during render, but setTimeout 0 is ok here
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

  // Check Level Complete
  useEffect(() => {
      if (gameState === GameState.PLAYING && levelData && !isPaused) {
          const remainingMatches = levelData.items.filter(i => i.isMatch && i.status === 'idle');
          if (remainingMatches.length === 0 && levelData.items.length > 0 && !victoryScheduledRef.current) {
              victoryScheduledRef.current = true; 
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
  }, [levelData, gameState, isPaused]);


  const handleGetHint = async () => {
    if (!levelData || isHintLoading || hint || isPaused) return;
    setIsHintLoading(true);
    const hintText = await getRegexHint(levelData.regex);
    setHint(hintText);
    setIsHintLoading(false);
  };

  const handleItemClick = (id: string) => {
    if (gameState !== GameState.PLAYING || isPaused || !levelData) return;

    audioService.init();

    setLevelData(prev => {
      if (!prev) return null;
      const clickedItem = prev.items.find(i => i.id === id);
      if (!clickedItem || clickedItem.status !== 'idle') return prev;

      const isCorrect = clickedItem.isMatch;
      
      if (isCorrect) {
        audioService.playSFX('correct'); 
        setScore(s => s + 10 + (difficulty * 2)); 
      } else {
        audioService.playSFX('wrong'); 
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
    audioService.playSFX('levelup'); 
    setGameState(GameState.VICTORY);
    setMessage("Level Cleared! Tăng tốc độ...");
    setTimeout(() => {
      // Nếu người chơi thoát ra menu trong lúc đang wait victory, ko làm gì cả
      if (gameStateRef.current !== GameState.VICTORY) return;

      const nextDiff = difficulty + 1;
      setDifficulty(nextDiff);
      startNewLevel(nextDiff, gameMode);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center overflow-hidden">
      
      {/* MODALS */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <LeaderboardModal 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
      />
      <UsernameModal 
        isOpen={isUsernameOpen} 
        onClose={() => setIsUsernameOpen(false)} 
        currentName={username}
        onNameUpdate={setUsername}
      />

      <Header 
        gameState={gameState}
        score={score}
        lives={lives}
        difficulty={difficulty}
        isMuted={isMuted}
        username={username}
        isPaused={isPaused}
        onToggleMute={toggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsUsernameOpen(true)}
        onGoHome={goHome}
        onTogglePause={togglePause}
      />

      {/* Main Game Area */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center relative px-2 md:px-4 pb-4">
        
        {/* START SCREEN */}
        {gameState === GameState.START && (
          <StartScreen 
            gameMode={gameMode} 
            setGameMode={setGameMode} 
            onStart={startGame}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
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
          <div className="w-full h-full flex flex-col items-center">
            
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

                <PauseOverlay 
                    isPaused={isPaused} 
                    onResume={() => setIsPaused(false)}
                    onGoHome={goHome}
                />

                <GameOverlays 
                    gameState={gameState}
                    message={message}
                    score={score}
                    onRestart={startGame}
                    onGoHome={goHome}
                />
            </div>
          </div>
        )}
      </main>

      <footer className="py-2 md:py-4 text-slate-600 text-[10px] text-center w-full bg-slate-900/90 border-t border-slate-800/50 z-10">
        <p> Game này được tạo bởi github.com/dangminhtai</p>
      </footer>
    </div>
  );
}
