
import React from 'react';
import { Search, ArrowRightFromLine, Maximize2, Play, Trophy } from 'lucide-react';
import { GameMode } from '../types';
import GameLogo from './icons/GameLogo';

interface Props {
    gameMode: GameMode;
    setGameMode: (mode: GameMode) => void;
    onStart: () => void;
    onOpenLeaderboard: () => void;
}

const StartScreen: React.FC<Props> = ({ gameMode, setGameMode, onStart, onOpenLeaderboard }) => {
    return (
        <div className="text-center mt-4 md:mt-10 space-y-6 animate-fade-in w-full max-w-lg z-20 px-4">
            
            <GameLogo size="lg" />
            
            <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    Regex <span className="text-emerald-500">Hunter</span>
                </h2>
                <p className="text-slate-400 text-sm md:text-base max-w-sm mx-auto">
                    Mưa Regex đang trút xuống! Hãy bắn hạ các chuỗi khớp mẫu trước khi chúng chạm đất.
                </p>
            </div>

            {/* Mode Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 w-full">
                <button 
                    onClick={() => setGameMode('search')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all relative overflow-hidden group ${
                        gameMode === 'search' 
                        ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                >
                    <Search size={20} className={gameMode === 'search' ? 'scale-110' : ''}/>
                    <div className="flex flex-col">
                        <span className="font-bold text-xs md:text-sm">SEARCH</span>
                        <span className="text-[10px] opacity-70">Tìm chuỗi con</span>
                    </div>
                </button>

                <button 
                    onClick={() => setGameMode('match')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all relative overflow-hidden group ${
                        gameMode === 'match' 
                        ? 'bg-blue-900/20 border-blue-500 text-blue-400 ring-1 ring-blue-500/50' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                >
                    <ArrowRightFromLine size={20} className={gameMode === 'match' ? 'scale-110' : ''} />
                    <div className="flex flex-col">
                        <span className="font-bold text-xs md:text-sm">MATCH START</span>
                        <span className="text-[10px] opacity-70">Khớp đầu</span>
                    </div>
                </button>

                <button 
                    onClick={() => setGameMode('fullmatch')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all relative overflow-hidden group ${
                        gameMode === 'fullmatch' 
                        ? 'bg-purple-900/20 border-purple-500 text-purple-400 ring-1 ring-purple-500/50' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                >
                    <Maximize2 size={20} className={gameMode === 'fullmatch' ? 'scale-110' : ''} />
                    <div className="flex flex-col">
                        <span className="font-bold text-xs md:text-sm">FULL MATCH</span>
                        <span className="text-[10px] opacity-70">Khớp tất cả</span>
                    </div>
                </button>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={onOpenLeaderboard}
                    className="flex-1 py-4 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-yellow-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <Trophy size={20} /> TOP 10
                </button>

                <button 
                    onClick={onStart}
                    className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-[1.02] text-lg active:scale-95"
                >
                    <Play size={24} className="fill-current" /> BẮT ĐẦU
                </button>
            </div>
        </div>
    );
};

export default StartScreen;
