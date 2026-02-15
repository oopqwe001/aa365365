
import React, { useState } from 'react';
import { LotteryGame } from '../types';
import { geminiService } from '../services/geminiService';

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

  const generateRandom = () => {
    const nums: number[] = [];
    while (nums.length < totalSlots) {
      const r = Math.floor(Math.random() * game.maxNumber) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    setSelected(nums.sort((a, b) => a - b));
  };

  const handleAiPredict = async () => {
    setIsAiLoading(true);
    const nums = await geminiService.predictLuckyNumbers(game.fullName, game.pickCount, game.maxNumber);
    if (nums.length === game.pickCount) {
      setSelected(nums);
    } else {
      generateRandom();
    }
    setIsAiLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f4f4] view-transition overflow-hidden font-sans">
      {/* 官方风格头部导航 */}
      <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center justify-between sticky top-0 z-10 shadow-sm h-14">
        <div className="flex items-center gap-2">
          {/* 彩种 Logo - 极致还原 */}
          <div className="flex flex-col items-center">
            <div className="border-[1px] border-[#e60012] rounded-[2px] px-1 py-0.5 leading-none bg-white">
              <span className="text-[#e60012] text-[10px] font-black italic">LOTO</span>
              <div className="bg-[#e60012] text-white text-[8px] px-1 ml-0.5 inline-block rounded-sm">{game.id === 'loto7' ? '7' : '6'}</div>
            </div>
            <span className="text-[7px] font-bold text-[#005bac] tracking-tighter mt-0.5">ロトセブン</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-7 h-7 rounded-full bg-[#e10000] text-white flex items-center justify-center text-[10px] shadow-sm active:scale-90">
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="text-sm font-bold text-gray-700 w-4 text-center">{selectionId}</span>
          <button className="w-7 h-7 rounded-full bg-[#e10000] text-white flex items-center justify-center text-[10px] shadow-sm active:scale-90">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div className="w-10 flex justify-end">
           <button onClick={onCancel} className="text-gray-400">
             <i className="fas fa-times text-lg"></i>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 bg-[#f4f4f4]">
        {/* 号码选择区域容器 */}
        <div className="bg-[#fcfcfc] rounded-md border border-gray-300 p-2 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          {/* 数字网格 - 严格5列 */}
          <div className="grid grid-cols-5 gap-1 mb-4">
            {Array.from({ length: game.maxNumber }, (_, i) => i + 1).map(num => {
              const isSelected = selected.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  className={`h-10 rounded-[3px] text-sm font-black transition-all flex items-center justify-center border ${
                    isSelected 
                      ? 'bg-[#0092d6] text-white border-[#0092d6] shadow-inner' 
                      : 'bg-gradient-to-b from-[#fefefe] to-[#e8e8e8] border-gray-300 text-gray-800 active:from-gray-100 shadow-sm'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* 状态与重置 */}
          <div className="flex items-end justify-between mb-4 px-1">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#0092d6] rounded-sm"></div>
                  <span className="text-[9px] font-bold text-gray-500">自分で選択</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#76a301] rounded-sm"></div>
                  <span className="text-[9px] font-bold text-gray-500">ランダム選択</span>
                </div>
                {/* 整合 AI 入口 */}
                <button 
                  onClick={handleAiPredict}
                  disabled={isAiLoading}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-purple-200 bg-purple-50 transition-all active:scale-95 ${isAiLoading ? 'animate-pulse opacity-50' : ''}`}
                >
                  <i className={`fas fa-robot text-[8px] text-purple-500`}></i>
                  <span className="text-[8px] font-black text-purple-600">AI</span>
                </button>
              </div>
              <div className="text-[12px] font-bold text-gray-800">
                あと <span className="text-[#e10000] text-xl font-black italic">{totalSlots - selected.length}</span> 個
              </div>
            </div>
            
            <button 
              onClick={() => setSelected([])} 
              className="bg-gradient-to-b from-[#fefefe] to-[#d8d8d8] border border-gray-400 w-24 py-2 rounded-md text-[11px] font-black text-gray-700 shadow-sm active:from-gray-200"
            >
              リセット
            </button>
          </div>

          {/* 官方配色功能按键 - 带有底部实色阴影效果 */}
          <div className="grid grid-cols-3 gap-1.5 mb-5">
            <button 
              onClick={generateRandom}
              className="bg-[#76a301] text-white py-3 rounded-md text-[10px] font-black shadow-[0_2px_0_#5a7a01] active:translate-y-[1px] active:shadow-none"
            >
              ランダム選択
            </button>
            <button 
              onClick={generateRandom}
              className="bg-[#e47600] text-white py-3 rounded-md text-[10px] font-black shadow-[0_2px_0_#b35c00] active:translate-y-[1px] active:shadow-none"
            >
              クイックピック
            </button>
            <button 
              className="bg-[#e10000] text-white py-3 rounded-md text-[9px] font-black shadow-[0_2px_0_#a10000] leading-tight active:translate-y-[1px] active:shadow-none"
            >
              お気に入り数字<br/>から選択
            </button>
          </div>

          {/* 购买参数 */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-800 mb-1">購入口数</span>
                <div className="flex items-center gap-1.5">
                   <select className="border border-gray-300 rounded-sm px-2 py-1 text-xs font-bold bg-white outline-none">
                     <option>1</option><option>2</option><option>5</option>
                   </select>
                   <span className="text-[10px] font-bold text-gray-500">口</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-800 mb-1">継続回数</span>
                <div className="flex items-center gap-1.5">
                   <select className="border border-gray-300 rounded-sm px-2 py-1 text-xs font-bold bg-white outline-none">
                     <option>1</option><option>2</option><option>5</option>
                   </select>
                   <span className="text-[10px] font-bold text-gray-500">回</span>
                </div>
              </div>
            </div>
            <p className="text-[8px] text-gray-400 font-medium leading-tight mb-6 italic">
              ※ 購入口数と継続回数を指定した場合は、全て同じ申込数字での購入になります。
            </p>
          </div>

          {/* 红色完成按钮 */}
          <button 
            onClick={() => onComplete(selected)}
            disabled={selected.length !== totalSlots}
            className={`w-full py-3.5 rounded-md font-black text-base text-white shadow-lg transition-all active:scale-[0.98] ${
              selected.length === totalSlots 
                ? 'bg-[#e10000] shadow-[#e1000022]' 
                : 'bg-gray-300 text-gray-100 cursor-not-allowed'
            }`}
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPicker;

