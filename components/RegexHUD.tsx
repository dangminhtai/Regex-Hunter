
import React from 'react';
import { Search, ArrowRightFromLine, Maximize2, Loader2, Lightbulb } from 'lucide-react';
import { GameMode } from '../types';

interface Props {
    regex: string;
    gameMode: GameMode;
    hint: string | null;
    isHintLoading: boolean;
    onGetHint: () => void;
}

const RegexHUD: React.FC<Props> = ({ regex, gameMode, hint, isHintLoading, onGetHint }) => {
    return (
        <div className="relative z-30 mb-4 shrink-0 px-4 w-full max-w-3xl">
            <div className="bg-slate-900/90 border border-slate-600 rounded-xl p-4 md:p-6 text-center relative overflow-hidden shadow-2xl backdrop-blur-sm">
                {/* Decoration Lines */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-20"></div>

                <div className="flex justify-center items-center gap-2 text-slate-500 text-[10px] md:text-xs mb-2 uppercase tracking-widest font-bold">
                    <span>MỤC TIÊU:</span>
                    {gameMode === 'search' && <span className="text-emerald-400 flex items-center gap-1 bg-emerald-900/30 px-2 py-0.5 rounded"><Search size={10}/> Search</span>}
                    {gameMode === 'match' && <span className="text-blue-400 flex items-center gap-1 bg-blue-900/30 px-2 py-0.5 rounded"><ArrowRightFromLine size={10}/> Match Start</span>}
                    {gameMode === 'fullmatch' && <span className="text-purple-400 flex items-center gap-1 bg-purple-900/30 px-2 py-0.5 rounded"><Maximize2 size={10}/> Full Match</span>}
                </div>
                
                <code className="block text-2xl md:text-4xl font-mono text-emerald-400 neon-text break-words leading-tight">
                    /{regex}/
                </code>
            </div>

            {/* Hint Section */}
            <div className="flex flex-col items-center mt-3 h-12 justify-start">
                {!hint ? (
                    <button 
                        onClick={onGetHint}
                        disabled={isHintLoading}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            isHintLoading 
                            ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-wait' 
                            : 'bg-slate-800 text-yellow-500 border-yellow-600/30 hover:bg-yellow-900/20 hover:border-yellow-500 hover:text-yellow-400 shadow-lg shadow-yellow-900/10'
                        }`}
                    >
                        {isHintLoading ? <Loader2 size={12} className="animate-spin"/> : <Lightbulb size={12} />}
                        {isHintLoading ? "Đang phân tích..." : "Gợi ý (AI)"}
                    </button>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-2 bg-yellow-950/40 border border-yellow-500/20 text-yellow-200 px-4 py-2 rounded-lg text-xs md:text-sm max-w-xl text-center backdrop-blur-sm shadow-lg">
                        <span className="font-bold text-yellow-500 mr-2">[GEMINI]:</span>
                        {hint}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegexHUD;
