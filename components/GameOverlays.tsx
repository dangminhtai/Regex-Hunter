
import React from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { GameState } from '../types';

interface Props {
    gameState: GameState;
    message: string;
    score: number;
    onRestart: () => void;
    onGoHome: () => void;
}

const GameOverlays: React.FC<Props> = ({ gameState, message, score, onRestart, onGoHome }) => {
    if (gameState === GameState.VICTORY) {
        return (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in zoom-in duration-300 rounded-xl">
                <div className="text-center p-8 bg-slate-900 border border-emerald-500 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-900/30 mb-4 animate-bounce">
                        <CheckCircle2 size={48} className="text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">QUA MÀN!</h2>
                    <p className="text-emerald-300 font-mono mb-6">{message}</p>
                    
                    {/* Chỉ có nút Home ở Victory nếu muốn dừng chơi, hoặc chờ tự động qua màn */}
                    <button 
                        onClick={onGoHome}
                        className="text-slate-400 hover:text-white underline text-sm"
                    >
                        Thoát về Menu
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === GameState.GAME_OVER) {
        return (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-500 rounded-xl">
                <div className="text-center p-8 bg-slate-900 border border-red-600 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.3)] max-w-md w-full mx-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-900/30 mb-4">
                        <AlertTriangle size={48} className="text-red-500" />
                    </div>
                    <h2 className="text-4xl font-bold text-red-500 mb-2">GAME OVER</h2>
                    <p className="text-slate-400 mb-6">Hệ thống bị quá tải regex!</p>
                    
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-8">
                        <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Final Score</p>
                        <p className="text-4xl font-mono text-yellow-400 font-bold tracking-tight">{score}</p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onGoHome}
                            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Home size={20} /> MENU
                        </button>
                        <button 
                            onClick={onRestart}
                            className="flex-[2] py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95"
                        >
                            <RefreshCw size={20} /> CHƠI LẠI
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default GameOverlays;
