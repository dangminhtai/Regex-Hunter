
import React, { useState, useEffect } from 'react';
import { User, Check, X } from 'lucide-react';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    onNameUpdate: (name: string) => void;
}

const UsernameModal: React.FC<Props> = ({ isOpen, onClose, currentName, onNameUpdate }) => {
    const [inputValue, setInputValue] = useState(currentName);

    useEffect(() => {
        if (isOpen) {
            setInputValue(currentName);
        }
    }, [isOpen, currentName]);

    const handleSave = () => {
        if (!inputValue.trim()) return;
        storageService.setUsername(inputValue);
        onNameUpdate(inputValue);
        audioService.playSFX('correct'); // Sound feedback
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
            
            <div className="relative bg-slate-900 border border-emerald-500/50 w-full max-w-sm p-6 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-400"/> Hồ Sơ Hacker
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Codename</label>
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            maxLength={15}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                            placeholder="Nhập tên..."
                            autoFocus
                        />
                        <p className="text-xs text-slate-500 mt-2 text-right">{inputValue.length}/15 ký tự</p>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={!inputValue.trim()}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Check size={20}/> Lưu Thay Đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UsernameModal;
