import React, { useState } from 'react';
import { LotteryGame } from '../types';


interface Props {
  game: LotteryGame;
  selectionId: string;
  initialNumbers: number[];
  onCancel: () => void;
  onComplete: (numbers: number[]) => void;
}

const NumberPicker: React.FC<Props> = ({ game, selectionId, initialNumbers, onCancel, onComplete }) => {
  const [selected, setSelected] = useState<number[]>(initialNumbers);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const totalSlots = game.pickCount;

  const toggleNumber = (num: number) => {
    if (selected.includes(num)) {
      setSelected(selected.filter(n => n !== num));
    } else {
      if (selected.length < totalSlots) {
        setSelected([...selected, num].sort((a, b) => a - b));
      }
    }
  };

  const handleAiPredict = async () => {
    setIsAiLoading(true);
    const nums = await geminiService.predictLuckyNumbers(game.fullName, game.pickCount, game.maxNumber);
    if (nums.length === game.pickCount) {
      setSelected(nums);
    } else {
      // Fallback to random if AI fails
      const fallback: number[] = [];
      while (fallback.length < totalSlots) {
        const r = Math.floor(Math.random() * game.maxNumber) + 1;
        if (!fallback.includes(r)) fallback.push(r);
      }
      setSelected(fallback.sort((a, b) => a - b));
    }
    setIsAiLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white view-transition overflow-hidden">
      <div className="relative py-4 px-4 flex items-center justify-center bg-white border-b border-gray-50">
         <h4 className="text-[15px] font-[900] text-[#333] tracking-tighter">
           {game.fullName} - 枠 {selectionId}
         </h4>
         <button 
           onClick={onCancel} 
           className="absolute right-4 w-5 h-5 flex items-center justify-center text-gray-400 active:bg-gray-50 transition-colors"
         >
           <i className="fas fa-times text-[18px] font-light"></i>
         </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24">
        <div className="mb-6 flex justify-between items-center bg-[#ebf3ff] px-4 py-3 rounded-[6px]">
           <span className="text-[13px] font-[900] text-[#005bac]">
             あと {totalSlots - selected.length} 個選択
           </span>
           <button 
             onClick={() => setSelected([])} 
             className="text-[10px] font-[900] text-[#e60012] bg-white px-3.5 py-1.5 rounded-[4px] border border-gray-100 shadow-sm active:bg-gray-50"
           >
             リセット
           </button>
        </div>

        <div className="grid grid-cols-6 gap-2 mb-10">
          {Array.from({ length: game.maxNumber }, (_, i) => i + 1).map(num => {
            const isSelected = selected.includes(num);
            return (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className={`h-[44px] rounded-[6px] text-[15px] font-[900] transition-all flex items-center justify-center border ${
                  isSelected 
                    ? 'bg-[#005bac] text-white border-[#005bac] shadow-sm scale-95' 
                    : 'bg-white border-gray-200 text-[#444] active:bg-gray-50'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 px-1">
          <button 
            onClick={handleAiPredict}
            disabled={isAiLoading}
            className={`w-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white py-3.5 rounded-lg font-[900] text-[14px] shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 ${isAiLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
             {isAiLoading ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : (
               <i className="fas fa-robot"></i>
             )}
             AI 予想 (Gemini)
          </button>
          <button 
            onClick={() => onComplete(selected)}
            disabled={selected.length !== totalSlots}
            className={`w-full py-4 rounded-lg font-[900] text-[15px] text-white shadow-md transition-all active:scale-[0.98] ${
              selected.length === totalSlots 
                ? 'bg-[#e60012] opacity-100' 
                : 'bg-gray-200 text-gray-400 opacity-100'
            }`}
          >
            この内容で選択する
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPicker;