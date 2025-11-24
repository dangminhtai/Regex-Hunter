
import React, { useState, useEffect } from 'react';
import { X, Volume2, Music, Check } from 'lucide-react';
import { audioService } from '../services/audioService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [musicVol, setMusicVol] = useState(0.5);
    const [sfxVol, setSfxVol] = useState(0.8);

    // Sync state with service on open
    useEffect(() => {
        if (isOpen) {
            const settings = audioService.getSettings();
            setMusicVol(settings.musicVolume);
            setSfxVol(settings.sfxVolume);
        }
    }, [isOpen]);

    const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setMusicVol(val);
        audioService.setMusicVolume(val);
    };

    const handleSFXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setSfxVol(val);
        audioService.setSFXVolume(val);
    };

    const testSFX = () => {
        audioService.playSFX('correct');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
            
            {/* Modal Content */}
            <div className="relative bg-slate-900 border border-slate-600 w-full max-w-md p-6 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-2">
                    <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                        <Volume2 className="w-5 h-5"/> Settings
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Music Volume */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-300">
                            <span className="flex items-center gap-2"><Music size={16}/> Nhạc nền (BGM)</span>
                            <span>{Math.round(musicVol * 100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="1" step="0.05"
                            value={musicVol}
                            onChange={handleMusicChange}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                        />
                    </div>

                    {/* SFX Volume */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-300">
                            <span className="flex items-center gap-2"><Volume2 size={16}/> Hiệu ứng (SFX)</span>
                            <span>{Math.round(sfxVol * 100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="1" step="0.05"
                            value={sfxVol}
                            onChange={handleSFXChange}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                        />
                    </div>
                    
                    <button 
                        onClick={testSFX}
                        className="w-full py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2"
                    >
                        <Volume2 size={14}/> Test Âm Thanh
                    </button>
                </div>

                <div className="mt-8">
                     <button 
                        onClick={onClose}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                    >
                        <Check size={20}/> Xong
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
