'use client';

import { useState } from 'react';

interface NPCProps {
  x: number;
  y: number;
  gnomeIndex: number; // 0: Gardener, 1: Warrior, 2: Chef, 3: Wizard
}

const GNOME_DATA = [
  {
    name: 'Eldergreen',
    title: 'Gardener',
    description: 'Tends to the village gardens and knows all about growth and nature.',
    greeting: "Welcome! Care to learn about cultivation?",
    color: 'from-green-400 to-emerald-500'
  },
  {
    name: 'Ironforge',
    title: 'Knight & Fisher',
    description: 'A brave explorer who protects the village and provides fresh catch.',
    greeting: "Hail, traveler! Looking for adventure?",
    color: 'from-blue-400 to-cyan-500'
  },
  {
    name: 'Bakestone',
    title: 'Chef',
    description: 'Prepares delicious meals that keep the village energized.',
    greeting: "Hello friend! Ready for a feast?",
    color: 'from-orange-400 to-red-500'
  },
  {
    name: 'Starwhisper',
    title: 'Wizard',
    description: 'Masters of arcane knowledge and village secrets.',
    greeting: "Greetings! Seeking ancient wisdom?",
    color: 'from-purple-400 to-indigo-500'
  }
];

export function NPC({ x, y, gnomeIndex }: NPCProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const gnome = GNOME_DATA[gnomeIndex];

  return (
    <div
      className="absolute group cursor-help"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Gnome Icon - Hidden */}
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gnome.color} shadow-lg flex items-center justify-center text-white font-bold text-sm transition-transform duration-300 hover:scale-110 hover:shadow-xl opacity-0 pointer-events-none`}>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-lg whitespace-nowrap text-sm shadow-xl border border-gray-700 z-20 animate-in fade-in duration-200">
          <div className="font-bold">{gnome.name}</div>
          <div className="text-xs opacity-75">{gnome.title}</div>
          <div className="text-xs mt-1 max-w-xs">{gnome.greeting}</div>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1 text-gray-900">
            ▼
          </div>
        </div>
      )}

      {/* Idle Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%);
          }
          50% {
            transform: translate(-50%, calc(-50% - 8px));
          }
        }
        
        .group:hover > div:first-child {
          animation: float 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
