
import React from 'react';
import { Heart, Trophy, ShieldCheck, Settings, Volume2, VolumeX, User } from 'lucide-react';
import { GameState } from '../types';
import GameLogo from './icons/GameLogo';

interface Props {
    gameState: GameState;
    score: number;
    lives: number;
    difficulty: number;
    isMuted: boolean;
    username: string;
    onToggleMute: () => void;
    onOpenSettings: () => void;
    onOpenProfile: () => void;
}

const Header: React.FC<Props> = ({ 
    gameState, score, lives, difficulty, isMuted, username, 
    onToggleMute, onOpenSettings, onOpenProfile 
}) => {
    return (
        <header className="w-full max-w-4xl flex justify-between items-center mb-4 border-b border-slate-700 pb-4 z-50 bg-slate-900/80 backdrop-blur-md sticky top-0 px-4 pt-4">
            <div className="flex items-center gap-2 md:gap-4">
                <GameLogo />
                <div className="hidden md:block">
                    <h1 className="text-xl font-bold tracking-tighter leading-none">
                        REGEX <span className="text-emerald-400">HUNTER</span>
                    </h1>
                </div>

                {/* User Profile Badge (Small) */}
                <button 
                    onClick={onOpenProfile}
                    className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-full px-3 py-1 transition-all ml-2"
                >
                    <User size={14} className="text-emerald-400"/>
                    <span className="text-xs font-mono text-slate-300 truncate max-w-[100px]">{username}</span>
                </button>
            </div>

            <div className="flex items-center gap-4">
                 {/* Stats */}
                 {gameState !== GameState.START && (
                    <div className="flex gap-2 md:gap-6 font-mono text-sm md:text-base mr-1 md:mr-4">
                        <div className={`flex items-center gap-1 transition-all ${lives === 1 ? 'text-red-500 animate-pulse font-bold scale-110' : 'text-red-400'}`}>
                            <Heart className="fill-current w-4 h-4 md:w-5 md:h-5" />
                            <span>{lives}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Trophy className="fill-current w-4 h-4 md:w-5 md:h-5" />
                            <span>{score}</span>
                        </div>
                         {/* Hide level on mobile to save space */}
                        <div className="flex items-center gap-1 text-blue-400 hidden sm:flex">
                            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                            <span>LV {difficulty}</span>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-1 md:gap-2">
                    <button 
                        onClick={onToggleMute} 
                        className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all active:scale-95"
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button 
                        onClick={onOpenSettings}
                        className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all active:scale-95"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
