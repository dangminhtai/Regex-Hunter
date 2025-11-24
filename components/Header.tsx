
import React from 'react';
import { Heart, Trophy, ShieldCheck, Settings, Volume2, VolumeX, User, Home, Pause, Play } from 'lucide-react';
import { GameState } from '../types';
import GameLogo from './icons/GameLogo';

interface Props {
    gameState: GameState;
    score: number;
    lives: number;
    difficulty: number;
    isMuted: boolean;
    username: string;
    isPaused: boolean;
    onToggleMute: () => void;
    onOpenSettings: () => void;
    onOpenProfile: () => void;
    onGoHome: () => void;
    onTogglePause: () => void;
}

const Header: React.FC<Props> = ({ 
    gameState, score, lives, difficulty, isMuted, username, isPaused,
    onToggleMute, onOpenSettings, onOpenProfile, onGoHome, onTogglePause
}) => {
    const isPlaying = gameState === GameState.PLAYING;

    return (
        <header className="w-full max-w-4xl flex justify-between items-center mb-2 md:mb-4 border-b border-slate-700 pb-2 md:pb-4 z-50 bg-slate-900/80 backdrop-blur-md sticky top-0 px-2 md:px-4 pt-2 md:pt-4">
            <div className="flex items-center gap-2">
                {/* Logo */}
                <div onClick={isPlaying ? undefined : onGoHome} className={!isPlaying ? "cursor-pointer" : ""}>
                    <GameLogo />
                </div>
                
                {/* Title - Hide on small mobile if playing to save space */}
                <div className={`${isPlaying ? 'hidden sm:block' : 'block'}`}>
                    <h1 className="text-lg md:text-xl font-bold tracking-tighter leading-none">
                        REGEX <span className="text-emerald-400">HUNTER</span>
                    </h1>
                </div>

                {/* User Profile Badge */}
                <button 
                    onClick={onOpenProfile}
                    className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-full px-2 py-1 md:px-3 transition-all"
                >
                    <User size={12} className="text-emerald-400 md:w-[14px] md:h-[14px]"/>
                    <span className="text-[10px] md:text-xs font-mono text-slate-300 truncate max-w-[80px] md:max-w-[100px]">{username}</span>
                </button>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                 {/* Stats - Compact Mode on Mobile */}
                 {gameState !== GameState.START && (
                    <div className="flex gap-2 md:gap-6 font-mono text-xs md:text-base mr-0 md:mr-2">
                        <div className={`flex items-center gap-1 transition-all ${lives === 1 ? 'text-red-500 animate-pulse font-bold scale-110' : 'text-red-400'}`}>
                            <Heart className="fill-current w-3 h-3 md:w-5 md:h-5" />
                            <span>{lives}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Trophy className="fill-current w-3 h-3 md:w-5 md:h-5" />
                            <span>{score}</span>
                        </div>
                        {/* Level - Hide on very small screens */}
                        <div className="items-center gap-1 text-blue-400 hidden sm:flex">
                            <ShieldCheck className="w-3 h-3 md:w-5 md:h-5" />
                            <span className="hidden md:inline">LV</span>
                            <span>{difficulty}</span>
                        </div>
                    </div>
                )}

                {/* Controls Group */}
                <div className="flex gap-1 md:gap-2">
                    {/* In-Game Controls */}
                    {isPlaying && (
                        <>
                            <button
                                onClick={onTogglePause}
                                className={`p-1.5 md:p-2 rounded-lg border transition-all active:scale-95 ${
                                    isPaused 
                                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 animate-pulse' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                                }`}
                                title={isPaused ? "Tiếp tục" : "Tạm dừng"}
                            >
                                {isPaused ? <Play size={16} className="fill-current md:w-[18px] md:h-[18px]"/> : <Pause size={16} className="fill-current md:w-[18px] md:h-[18px]"/>}
                            </button>
                            
                            <button
                                onClick={onGoHome}
                                className="p-1.5 md:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all active:scale-95"
                                title="Thoát ra menu chính"
                            >
                                <Home size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                            
                            <div className="w-[1px] h-6 md:h-8 bg-slate-700 mx-0.5 md:mx-1"></div>
                        </>
                    )}

                    <button 
                        onClick={onToggleMute} 
                        className="p-1.5 md:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all active:scale-95"
                    >
                        {isMuted ? <VolumeX size={16} className="md:w-[18px] md:h-[18px]" /> : <Volume2 size={16} className="md:w-[18px] md:h-[18px]" />}
                    </button>
                    
                    <button 
                        onClick={onOpenSettings}
                        className="p-1.5 md:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all active:scale-95"
                    >
                        <Settings size={16} className="md:w-[18px] md:h-[18px]" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
