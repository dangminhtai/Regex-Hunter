
import React, { useEffect, useState } from 'react';
import { Trophy, X, Medal } from 'lucide-react';
import { storageService } from '../services/storageService';
import { HighScore } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const LeaderboardModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [scores, setScores] = useState<HighScore[]>([]);

    useEffect(() => {
        if (isOpen) {
            setScores(storageService.getHighScores());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getRankColor = (index: number) => {
        if (index === 0) return "text-yellow-400"; // Gold
        if (index === 1) return "text-slate-300";  // Silver
        if (index === 2) return "text-amber-600";  // Bronze
        return "text-slate-500";
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
            
            <div className="relative bg-slate-900 border border-yellow-500/30 w-full max-w-md p-6 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                    <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                        <Trophy className="w-6 h-6 fill-current"/> Bảng Xếp Hạng
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {scores.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 italic">
                            Chưa có dữ liệu. Hãy là người đầu tiên!
                        </div>
                    ) : (
                        scores.map((s, index) => (
                            <div 
                                key={s.id} 
                                className={`flex justify-between items-center p-3 rounded-lg border border-slate-800 ${
                                    index < 3 ? 'bg-slate-800/50' : 'bg-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold w-6 text-center ${getRankColor(index)}`}>
                                        {index < 3 ? <Medal size={20} className="mx-auto"/> : `#${index + 1}`}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className={`font-bold font-mono ${index === 0 ? 'text-yellow-200' : 'text-slate-200'}`}>
                                            {s.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(s.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-emerald-400 text-lg">
                                    {s.score}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardModal;
