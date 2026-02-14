
import React from 'react';
import { LotteryGame, Selection } from '../types';

interface Props {
  game: LotteryGame;
  selections: Selection[];
  onBack: () => void;
  onSelect: (id: string) => void;
  onQuickPick: (id: string) => void;
  onDelete: (id: string) => void;
  onFinalize: () => void;
}

const SummaryView: React.FC<Props> = ({ game, selections, onBack, onSelect, onQuickPick, onDelete, onFinalize }) => {
  const validCount = selections.filter(s => s.numbers.length > 0).length;
  const totalCost = validCount * game.price;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex border-b h-10">
        <button className="flex-1 text-[11px] font-bold border-b-2 border-red-600 text-red-600 bg-white">通常購入</button>
        <button className="flex-1 text-[11px] font-bold text-gray-400 bg-gray-50">定期購入</button>
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-sm font-black">{game.fullName}</h1>
            <p className="text-[9px] text-gray-400">抽せん時間：毎日 08:00 JST</p>
          </div>
          <button onClick={onBack} className="text-[10px] text-blue-600 font-bold">戻る</button>
        </div>

        <div className="space-y-2.5">
          {selections.map((sel) => (
            <div key={sel.id} className="relative">
              <div className={`flex items-center gap-2 border rounded-md p-1.5 ${sel.numbers.length > 0 ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className="bg-gray-200 text-black text-[9px] font-black w-5 h-full flex items-center justify-center self-stretch rounded-sm">
                  {sel.id}
                </div>
                
                <div className="flex-1 py-1 min-h-[45px]">
                  {sel.numbers.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {sel.numbers.map((n, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold shadow-sm">{n}</div>
                        ))}
                      </div>
                      <div className="flex gap-3 text-[9px] text-gray-400 font-bold">
                        <span>数量 1口</span>
                        <span>金額 ¥{game.price}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => onSelect(sel.id)} className="flex-1 bg-red-600 text-white text-[10px] font-bold py-2 rounded shadow-sm">自分で選択</button>
                      <button onClick={() => onQuickPick(sel.id)} className="flex-1 bg-[#f57c00] text-white text-[10px] font-bold py-2 rounded shadow-sm">クイックピック</button>
                    </div>
                  )}
                </div>

                {sel.numbers.length > 0 && (
                   <button onClick={() => onDelete(sel.id)} className="p-1 text-gray-300">
                     <i className="fas fa-times-circle text-lg"></i>
                   </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-gray-50 border-t">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-[11px] font-bold text-gray-600">合計金額</span>
          <span className="text-lg font-black text-red-600 tracking-tight">¥ {totalCost.toLocaleString()}</span>
        </div>
        <button 
          onClick={onFinalize}
          disabled={validCount === 0}
          className="w-full bg-red-600 text-white py-3.5 rounded-lg font-black text-sm shadow-md disabled:opacity-30 active:scale-[0.98] transition-all"
        >
          購入を確定する
        </button>
      </div>
    </div>
  );
};

export default SummaryView;
