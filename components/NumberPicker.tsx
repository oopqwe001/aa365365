
import React, { useState } from 'react';
import { LotteryGame } from '../types';
import { lotteryApi } from '../services/api';

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
    generateRandom();
    setIsAiLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f4f4] view-transition overflow-hidden font-sans">
      <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center justify-between sticky top-0 z-10 shadow-sm h-14">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="border-[1px] border-[#e60012] rounded-[2px] px-1 py-0.5 leading-none bg-white">
              <span className="text-[#e60012] text-[10px] font-black italic">LOTO</span>
              <div className="bg-[#e60012] text-white text-[8px] px-1 ml-0.5 inline-block rounded-sm">
                {game.id === 'loto7' ? '7' : '6'}
              </div>
            </div>
            <span className="text-[7px] font-bold text-[#005bac] tracking-tighter mt-0.5">
              ロトセブン
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700 w-4 text-center">
            {selectionId}
          </span>
        </div>

        <div className="w-10 flex justify-end">
          <button onClick={onCancel} className="text-gray-400">
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 bg-[#f4f4f4]">
        <div className="bg-[#fcfcfc] rounded-md border border-gray-300 p-2 shadow-sm">
          <div className="grid grid-cols-5 gap-1 mb-4">
            {Array.from({ length: game.maxNumber }, (_, i) => i + 1).map(num => {
              const isSelected = selected.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  className={`h-10 rounded text-sm font-bold border ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between mb-4">
            <button
              onClick={generateRandom}
              className="bg-green-600 text-white px-3 py-2 rounded"
            >
              ランダム
            </button>

            <button
              onClick={handleAiPredict}
              disabled={isAiLoading}
              className="bg-purple-600 text-white px-3 py-2 rounded"
            >
              AI
            </button>

            <button
              onClick={() => setSelected([])}
              className="bg-gray-400 text-white px-3 py-2 rounded"
            >
              リセット
            </button>
          </div>

          <button
            onClick={() => onComplete(selected)}
            disabled={selected.length !== totalSlots}
            className={`w-full py-3 rounded font-bold ${
              selected.length === totalSlots
                ? 'bg-red-600 text-white'
                : 'bg-gray-300 text-gray-100'
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


