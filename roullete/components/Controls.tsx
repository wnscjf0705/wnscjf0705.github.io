import React, { useState } from 'react';
import { MenuItem } from '../types';

interface ControlsProps {
  items: MenuItem[];
  onAddItem: (label: string) => void;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
  disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ items, onAddItem, onRemoveItem, onClear, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onAddItem(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-t-3xl md:rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      
      {/* Header / Input Area */}
      <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800">메뉴 리스트 <span className="text-sm font-normal text-slate-500">({items.length})</span></h2>
            <button
                onClick={onClear}
                disabled={disabled || items.length === 0}
                className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded transition-colors disabled:opacity-50"
            >
                전체 삭제
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메뉴 이름 (예: 짜장면)"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            disabled={disabled}
            maxLength={20}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || disabled}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            추가
          </button>
        </form>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <p className="mb-2 text-3xl">🍽️</p>
            <p>먹고 싶은 메뉴를<br/>직접 추가해주세요!</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div 
                    className="w-4 h-4 rounded-full shadow-sm ring-1 ring-slate-100" 
                    style={{ backgroundColor: item.color }} 
                />
                <span className="font-medium text-slate-700">{item.label}</span>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                disabled={disabled}
                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Controls;