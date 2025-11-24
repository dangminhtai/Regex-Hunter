
import React from 'react';
import { Heart, Trophy, ShieldCheck, Settings, Volume2, VolumeX } from 'lucide-react';
import { GameState } from '../types';
import GameLogo from './icons/GameLogo';

interface Props {
    gameState: GameState;
    score: number;
    lives: number;
    difficulty: number;
    isMuted: boolean;
    onToggleMute: () => void;
    onOpenSettings: () => void;
}

const Header: React.FC<Props> = ({ gameState, score, lives, difficulty, isMuted, onToggleMute, onOpenSettings }) => {
    return (
        <header className="w-full max-w-4xl flex justify-between items-center mb-4 border-b border-slate-700 pb-4 z-50 bg-slate-900/80 backdrop-blur-md sticky top-0 px-4 pt-4">
            <div className="flex items-center gap-2">
                <GameLogo />
                <h1 className="text-xl md:text-2xl font-bold tracking-tighter hidden md:block">
                    REGEX <span className="text-emerald-400">HUNTER</span>
                </h1>
                <h1 className="text-xl font-bold md:hidden">RH</h1>
            </div>

            <div className="flex items-center gap-4">
                 {/* Stats - Only show when playing or game over */}
                 {gameState !== GameState.START && (
                    <div className="flex gap-3 md:gap-6 font-mono text-sm md:text-base mr-2 md:mr-4">
                        <div className={`flex items-center gap-1.5 transition-all ${lives === 1 ? 'text-red-500 animate-pulse font-bold scale-110' : 'text-red-400'}`}>
                            <Heart className="fill-current w-4 h-4 md:w-5 md:h-5" />
                            <span>{lives}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-yellow-400">
                            <Trophy className="fill-current w-4 h-4 md:w-5 md:h-5" />
                            <span>{score}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-400 hidden sm:flex">
                            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                            <span>LV {difficulty}</span>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-2">
                    <button 
                        onClick={onToggleMute} 
                        className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all active:scale-95"
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button 
                        onClick={onOpenSettings}
                        className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all active:scale-95"
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
