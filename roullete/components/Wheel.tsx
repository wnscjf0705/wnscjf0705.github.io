import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3-shape';
import { MenuItem } from '../types';

interface WheelProps {
  items: MenuItem[];
  isSpinning: boolean;
  rotation: number;
  onTransitionEnd: () => void;
}

const Wheel: React.FC<WheelProps> = ({ items, isSpinning, rotation, onTransitionEnd }) => {
  const [radius, setRadius] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateRadius = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setRadius(Math.min(width, height) / 2 - 20); // Padding
      }
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // Prepare D3 Pie generator
  const pie = d3.pie<MenuItem>()
    .value(() => 1) // All slices equal size
    .sort(null);

  const arcGenerator = d3.arc<d3.PieArcDatum<MenuItem>>()
    .innerRadius(20) // Small hole in center
    .outerRadius(radius);

  const arcs = pie(items);

  // Calculate text transformation
  const getTextTransform = (d: d3.PieArcDatum<MenuItem>) => {
    const [x, y] = arcGenerator.centroid(d);
    const rotate = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI);
    return `translate(${x}, ${y}) rotate(${rotate - 90})`; // -90 to align text radially
  };

  if (items.length === 0) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl bg-slate-100 rounded-full border-4 border-dashed border-slate-300">
        메뉴를 추가해주세요
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 pointer-events-none drop-shadow-lg">
             <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 40L37.3205 10H2.67949L20 40Z" fill="#1e293b"/>
             </svg>
        </div>

      <div
        ref={containerRef}
        className="w-full h-full"
      >
        <div
            style={{
                width: '100%',
                height: '100%',
                transition: isSpinning ? 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                transform: `rotate(${rotation}deg)`,
            }}
            onTransitionEnd={onTransitionEnd}
        >
            <svg
            width="100%"
            height="100%"
            viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
            className="overflow-visible"
            >
            <g>
                {arcs.map((d, i) => (
                <g key={items[i].id}>
                    <path
                    d={arcGenerator(d) || undefined}
                    fill={items[i].color}
                    stroke="white"
                    strokeWidth="2"
                    />
                    <text
                    transform={getTextTransform(d)}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="white"
                    fontSize={Math.max(10, radius / 8)}
                    fontWeight="bold"
                    style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                    >
                    {items[i].label.length > 8 ? items[i].label.substring(0, 8) + '...' : items[i].label}
                    </text>
                </g>
                ))}
            </g>
            </svg>
        </div>
      </div>
    </div>
  );
};

export default Wheel;