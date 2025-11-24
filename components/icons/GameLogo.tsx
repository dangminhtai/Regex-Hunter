
import React from 'react';
import { Terminal } from 'lucide-react';

interface Props {
  size?: 'sm' | 'lg';
  className?: string;
}

const GameLogo: React.FC<Props> = ({ size = 'sm', className = '' }) => {
  // Phiên bản Lớn (Dùng cho Start Screen)
  if (size === 'lg') {
    return (
      <div className={`relative group cursor-default ${className}`}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full group-hover:bg-emerald-500/30 transition-all duration-500"></div>
        
        {/* Main Box */}
        <div className="relative w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform duration-300">
            <Terminal size={48} className="text-emerald-400" />
        </div>
      </div>
    );
  }

  // Phiên bản Nhỏ (Dùng cho Header)
  return (
    <div className={`bg-slate-800 p-1.5 rounded-lg border border-slate-700 flex items-center justify-center shadow-lg shadow-emerald-900/10 ${className}`}>
        <Terminal className="text-emerald-400 w-5 h-5 md:w-6 md:h-6" />
    </div>
  );
};

export default GameLogo;
