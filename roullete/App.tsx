import React, { useState, useCallback } from 'react';
import Wheel from './components/Wheel';
import Controls from './components/Controls';
import { MenuItem, WHEEL_COLORS } from './types';

// Utility to generate random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [items, setItems] = useState<MenuItem[]>([
    { id: '1', label: '떡볶이', color: WHEEL_COLORS[0] },
    { id: '2', label: '치킨', color: WHEEL_COLORS[1] },
    { id: '3', label: '피자', color: WHEEL_COLORS[2] },
  ]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<MenuItem | null>(null);

  // Helper to get next color
  const getNextColor = (index: number) => WHEEL_COLORS[index % WHEEL_COLORS.length];

  const handleAddItem = (label: string) => {
    setItems((prev) => [
      ...prev,
      { id: generateId(), label, color: getNextColor(prev.length) },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClear = () => {
      setItems([]);
  }

  const spinWheel = useCallback(() => {
    if (isSpinning || items.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    const newRotation = rotation + 1800 + Math.random() * 360 * 3; // Minimum 5 spins + random
    setRotation(newRotation);
    
    // We calculate the winner when the spin *ends*, but we need to know it logically.
    // The pointer is at the top (0 degrees visually, but 360-degree system).
    // The CSS rotates the wheel clockwise.
    // So if we rotate +90 degrees, the item at -90 (or 270) is at the top.
    
    // Wait for animation (matched with CSS transition duration) is handled in onTransitionEnd
  }, [isSpinning, items.length, rotation]);

  const handleTransitionEnd = () => {
    setIsSpinning(false);
    
    // Normalize rotation to 0-360
    const finalRotation = rotation % 360;
    
    // The wheel rotated clockwise. The pointer is stationary at top.
    // The "winning" angle on the wheel relative to the start is effectively:
    // (360 - finalRotation) % 360.
    // However, D3 starts 0 at 12 o'clock if we configure it right, 
    // but usually it starts at 3 o'clock (0 rad).
    // In our SVG:
    // We didn't rotate the container, we rotated the group inside.
    // D3 Arc 0 is at 12 o'clock because we subtracted 90deg in transform? 
    // No, standard D3 arc starts at 12 o'clock if we consider 0 to be -y.
    // Let's rely on slice index logic.
    
    const sliceAngle = 360 / items.length;
    // The pointer is at the TOP.
    // As wheel spins CW, indices pass the top in reverse order?
    // Let's simplify: 
    // Visual angle at top = 0.
    // Effective angle of wheel = finalRotation.
    // The slice at the top is the one that covers the angle (360 - (finalRotation % 360)) % 360.
    
    const effectiveAngle = (360 - finalRotation) % 360;
    const winningIndex = Math.floor(effectiveAngle / sliceAngle);
    
    // Clamp index just in case of float errors
    const safeIndex = Math.min(Math.max(winningIndex, 0), items.length - 1);
    
    setWinner(items[safeIndex]);
  };

  const closeModal = () => {
      setWinner(null);
  };

  return (
    <div className="relative h-screen w-full flex flex-col md:flex-row bg-slate-50">
      
      {/* Top Section (Mobile) / Left Section (Desktop): The Wheel */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[50vh] md:h-full relative overflow-hidden">
        <div className="relative w-full max-w-md aspect-square">
            <Wheel 
                items={items} 
                isSpinning={isSpinning} 
                rotation={rotation} 
                onTransitionEnd={handleTransitionEnd}
            />
        </div>
        
        {/* Spin Button - Floating on mobile or below wheel */}
        <div className="mt-8 z-10">
            <button
                onClick={spinWheel}
                disabled={isSpinning || items.length < 2}
                className="
                    group relative px-8 py-4 bg-slate-900 text-white font-black text-2xl rounded-2xl shadow-xl 
                    transform transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed
                    hover:bg-slate-800
                "
            >
                <span className="relative z-10">{isSpinning ? '가즈아...!' : '룰렛 돌리기!'}</span>
                {/* Decorative shadow layer */}
                <div className="absolute inset-0 rounded-2xl bg-slate-900 opacity-0 group-hover:opacity-100 blur transition-opacity duration-200"></div>
            </button>
            {items.length < 2 && (
                <p className="text-center text-slate-400 mt-2 text-sm">메뉴를 2개 이상 추가해주세요</p>
            )}
        </div>
      </div>

      {/* Bottom Section (Mobile) / Right Section (Desktop): Controls */}
      <div className="h-[45vh] md:h-full md:w-[400px] lg:w-[450px] w-full z-10">
        <Controls
            items={items}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onClear={handleClear}
            disabled={isSpinning}
        />
      </div>

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all animate-bounce-in text-center relative overflow-hidden">
            {/* Confetti decoration (CSS simple version) */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"></div>
            
            <h3 className="text-slate-500 font-bold mb-2 uppercase tracking-wide">오늘의 메뉴는</h3>
            <div className="text-4xl md:text-5xl font-black text-slate-800 mb-6 py-4 border-y-4 border-slate-100" style={{color: winner.color}}>
              {winner.label}
            </div>
            
            <button
              onClick={closeModal}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              좋아요!
            </button>
          </div>
        </div>
      )}

      {/* CSS for custom animations usually in globals.css, but adding inline styles/utility extraction for this format */}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
        @keyframes bounce-in {
            0% { opacity: 0; transform: scale(0.95) translateY(10px); }
            50% { transform: scale(1.02); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-bounce-in {
            animation: bounce-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

export default App;