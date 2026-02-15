

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
    <div className="flex flex-col h-full bg-[#eee] view-transition overflow-hidden">
      {/* 顶部导航栏 - 参考图样式 */}
      <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
           <button onClick={onCancel} className="text-gray-800 text-xl mr-2">
             <i className="fas fa-chevron-left"></i>
           </button>
           {/* Logo 显示逻辑 */}
           <div className="flex flex-col items-center scale-75 -mx-4">
             <div className="border-[1.5px] border-[#e60012] rounded-[2px] px-2 py-0.5">
               <span className="text-[#e60012] text-xs font-black italic italic leading-none">LOTO</span>
               <div className="bg-[#e60012] text-white text-[8px] px-1 ml-1 inline-block rounded-sm">{game.id === 'loto7' ? '7' : '6'}</div>
             </div>
             <span className="text-[8px] font-bold text-[#005bac] tracking-tighter">ロトセブン</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <button className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-inner">
             <i className="fas fa-chevron-left"></i>
           </button>
           <span className="text-base font-bold text-gray-700">{selectionId}</span>
           <button className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-inner">
             <i className="fas fa-chevron-right"></i>
           </button>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#eee] p-2 pb-24">
        {/* 号码选择主容器 */}
        <div className="bg-white rounded-md border border-gray-300 p-2 shadow-sm">
          {/* 号码球阵列 */}
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {Array.from({ length: game.maxNumber }, (_, i) => i + 1).map(num => {
              const isSelected = selected.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  className={`h-11 rounded-[4px] text-sm font-black transition-all flex items-center justify-center border ${
                    isSelected 
                      ? 'bg-[#0092d6] text-white border-[#0092d6] shadow-inner' 
                      : 'bg-gradient-to-b from-white to-[#f0f0f0] border-gray-300 text-gray-800 active:from-gray-100'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* 状态指示与重置 */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#0092d6] rounded-sm"></div>
                  <span className="text-[10px] font-bold text-gray-600">自分で選択</span>
                  <div className="w-3 h-3 bg-[#76a301] rounded-sm ml-2"></div>
                  <span className="text-[10px] font-bold text-gray-600">ランダム選択</span>
                  <i className="fas fa-question-circle text-gray-400 text-[10px] ml-1"></i>
               </div>
               <div className="text-[14px] font-black text-gray-800 mt-2">
                 あと <span className="text-red-600 text-lg">{totalSlots - selected.length}</span> 個
               </div>
            </div>
            <button 
              onClick={() => setSelected([])} 
              className="bg-gradient-to-b from-white to-[#d0d0d0] border border-gray-400 px-6 py-2 rounded-md text-xs font-black shadow-sm active:from-gray-200"
            >
              リセット
            </button>
          </div>

          {/* 功能按钮区 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button 
              onClick={generateRandom}
              className="bg-[#76a301] text-white py-3 rounded-md text-[11px] font-black shadow-md active:opacity-90"
            >
              ランダム選択
            </button>
            <button 
              onClick={generateRandom}
              className="bg-[#e47600] text-white py-3 rounded-md text-[11px] font-black shadow-md active:opacity-90"
            >
              クイックピック
            </button>
            <button 
              className="bg-[#e10000] text-white py-3 rounded-md text-[10px] font-black shadow-md leading-tight"
            >
              お気に入り数字<br/>から選択
            </button>
          </div>

          {/* AI 预测按钮 - 特色功能集成 */}
          <button 
            onClick={handleAiPredict}
            disabled={isAiLoading}
            className={`w-full mb-6 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white py-2.5 rounded-md font-black text-xs shadow-md flex items-center justify-center gap-2 ${isAiLoading ? 'opacity-50' : ''}`}
          >
            {isAiLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-robot"></i>}
            AI 予想で一括選択 (Gemini)
          </button>

          {/* 选项区 - 口数与时间 */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex gap-6 mb-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-gray-800 mb-1">購入口数</span>
                <div className="flex items-center gap-2">
                   <select className="border border-gray-300 rounded p-1 text-sm font-bold bg-white">
                     <option>1</option>
                     <option>2</option>
                     <option>5</option>
                   </select>
                   <span className="text-xs font-bold text-gray-500">口</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-gray-800 mb-1">継続回数</span>
                <div className="flex items-center gap-2">
                   <select className="border border-gray-300 rounded p-1 text-sm font-bold bg-white">
                     <option>1</option>
                     <option>2</option>
                     <option>5</option>
                   </select>
                   <span className="text-xs font-bold text-gray-500">回</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              ※ 購入口数と継続回数を指定した場合は、全て同じ申込数字での購入になります。
            </p>
          </div>

          {/* 最终完成按钮 */}
          <button 
            onClick={() => onComplete(selected)}
            disabled={selected.length !== totalSlots}
            className={`w-full py-4 rounded-md font-black text-lg text-white shadow-xl transition-all active:scale-[0.98] ${
              selected.length === totalSlots 
                ? 'bg-[#e10000] opacity-100' 
                : 'bg-gray-300 text-gray-400'
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
