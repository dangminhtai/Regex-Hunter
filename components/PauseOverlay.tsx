
import React from 'react';
import { Play, Home } from 'lucide-react';

interface Props {
    isPaused: boolean;
    onResume: () => void;
    onGoHome: () => void;
}

const PauseOverlay: React.FC<Props> = ({ isPaused, onResume, onGoHome }) => {
    if (!isPaused) return null;

    return (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40 backdrop-blur-sm animate-in fade-in duration-200 rounded-xl">
            <div className="text-center p-8 bg-slate-900/90 border border-yellow-500/50 rounded-2xl shadow-2xl min-w-[300px]">
                <h2 className="text-4xl font-bold text-yellow-500 tracking-widest mb-2 animate-pulse">PAUSED</h2>
                <p className="text-slate-400 text-sm mb-8">Trò chơi đang tạm dừng</p>
                
                <div className="space-y-3">
                    <button 
                        onClick={onResume}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95"
                    >
                        <Play size={20} className="fill-current"/> TIẾP TỤC
                    </button>
                    
                    <button 
                        onClick={onGoHome}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Home size={20} /> VỀ MENU CHÍNH
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PauseOverlay;
