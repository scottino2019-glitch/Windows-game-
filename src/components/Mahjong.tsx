import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';

interface Tile {
  id: string;
  type: string;
  value: string;
  x: number; // grid x (half-tile units)
  y: number; // grid y (half-tile units)
  z: number; // layer
  isMatched: boolean;
}

const TILE_TYPES = ['Bamboo', 'Characters', 'Dots', 'Dragons', 'Winds', 'Flowers', 'Seasons'];
const VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Red', 'Green', 'White', 'East', 'South', 'West', 'North'];

// Simplified Turtle layout coordinates (144 tiles)
// Based on traditional Mahjong Solitaire layout
const getTurtleLayout = () => {
  const layout: { x: number, y: number, z: number }[] = [];
  
  // Bottom Layer (Layer 0) - 82 tiles
  // Main body
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 12; x++) {
      if ((y === 0 || y === 7) && (x < 3 || x > 8)) continue;
      layout.push({ x, y, z: 0 });
    }
  }
  // Side wings
  layout.push({ x: -1, y: 3.5, z: 0 });
  layout.push({ x: 12, y: 3.5, z: 0 });
  layout.push({ x: 13, y: 3.5, z: 0 });

  // Layer 1 - 36 tiles
  for (let y = 1; y < 7; y++) {
    for (let x = 2; x < 8; x++) {
      layout.push({ x: x + 0.5, y: y + 0.5, z: 1 });
    }
  }

  // Layer 2 - 16 tiles
  for (let y = 2; y < 6; y++) {
    for (let x = 3; x < 7; x++) {
      layout.push({ x: x + 1, y: y + 1, z: 2 });
    }
  }

  // Layer 3 - 4 tiles
  for (let y = 3; y < 5; y++) {
    for (let x = 4; x < 6; x++) {
      layout.push({ x: x + 1.5, y: y + 1.5, z: 3 });
    }
  }

  // Top Tile (Layer 4)
  layout.push({ x: 6, y: 4.5, z: 4 });

  return layout.slice(0, 144); // Keep exactly 144 for 72 pairs
};

const TILE_SYMBOLS: { [key: string]: string } = {
  '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨',
  'Red': '中', 'Green': '發', 'White': '白',
  'East': '東', 'South': '南', 'West': '西', 'North': '北',
  'Flower': '🌸', 'Season': '🌦️'
};

export const Mahjong: React.FC = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const initGame = useCallback(() => {
    const layout = getTurtleLayout();
    const pool: { type: string, value: string }[] = [];
    const pairCount = layout.length / 2;
    
    for (let i = 0; i < pairCount; i++) {
        const type = TILE_TYPES[i % TILE_TYPES.length];
        const valSet = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Red', 'Green', 'White', 'East', 'South', 'West', 'North'];
        const value = valSet[i % valSet.length];
        pool.push({ type, value }, { type, value });
    }

    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const newTiles = layout.map((pos, i) => ({
      id: `t-${i}`,
      ...pool[i],
      ...pos,
      isMatched: false
    }));

    setTiles(newTiles);
    setSelected(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const isFree = (tile: Tile, allTiles: Tile[]) => {
    const activeTiles = allTiles.filter(t => !t.isMatched);
    
    // Check if any tile is directly on top (at a higher Z)
    const onTop = activeTiles.some(t => 
       t.z === tile.z + 1 && 
       Math.abs(t.x - tile.x) < 1 && 
       Math.abs(t.y - tile.y) < 1
    );
    if (onTop) return false;

    // Check if blocked on BOTH left and right
    const leftBlocked = activeTiles.some(t => 
      t.z === tile.z && Math.abs(t.y - tile.y) < 1 && t.x === tile.x - 1
    );
    const rightBlocked = activeTiles.some(t => 
      t.z === tile.z && Math.abs(t.y - tile.y) < 1 && t.x === tile.x + 1
    );

    return !leftBlocked || !rightBlocked;
  };

  const handleTileClick = (tile: Tile) => {
    if (tile.isMatched || !isFree(tile, tiles)) return;

    if (selected) {
      if (selected === tile.id) {
        setSelected(null);
        return;
      }

      const selectedTile = tiles.find(t => t.id === selected);
      if (selectedTile && selectedTile.type === tile.type && selectedTile.value === tile.value) {
        setTiles(prev => prev.map(t => (t.id === selected || t.id === tile.id) ? { ...t, isMatched: true } : t));
        setSelected(null);
      } else {
        setSelected(tile.id);
      }
    } else {
      setSelected(tile.id);
    }
  };

  return (
    <div className="bg-[#1a3a1a] bg-gradient-to-br from-[#0c2e0c] to-[#041104] min-h-full flex flex-col items-center select-none overflow-auto h-full w-full p-4 md:p-12 scrollbar-hide">
      <div className="mb-4 bg-white/5 px-8 py-2 rounded-full border border-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
        MAHJONG SOLITAIRE
      </div>
      
      <div className="relative w-full max-w-[1100px] h-[700px] mx-auto scale-90 md:scale-100">
        {tiles.filter(t => !t.isMatched).sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x).map(tile => {
          const free = isFree(tile, tiles);
          return (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              className={`
                absolute w-12 h-16 md:w-14 md:h-20 rounded-md border-b-[6px] border-r-[4px] transition-all cursor-pointer flex flex-col items-center justify-center
                ${selected === tile.id ? 'bg-emerald-50 border-emerald-400 -translate-y-4 scale-110 z-[5000] shadow-[0_30px_60px_rgba(0,0,0,0.6)]' : 'bg-[#fffcf0] border-[#dcd9c0] hover:brightness-105 shadow-[2px_2px_10px_rgba(0,0,0,0.3)]'}
                ${!free ? 'brightness-50 grayscale contrast-50 cursor-not-allowed opacity-80' : ''}
              `}
              style={{
                left: `${(tile.x + 2) * 52 + tile.z * 4}px`,
                top: `${(tile.y + 1) * 64 - tile.z * 4}px`,
                zIndex: tile.z * 100 + Math.floor(tile.y * 10) + Math.floor(tile.x),
              }}
            >
              <div className="text-[7px] md:text-[9px] font-black uppercase text-slate-400 mb-1 pointer-events-none opacity-60">{tile.type}</div>
              <div className={`text-2xl md:text-4xl font-black pointer-events-none drop-shadow-sm ${tile.value === 'Red' ? 'text-red-600' : tile.value === 'Green' ? 'text-green-600' : 'text-slate-900'}`}>
                {TILE_SYMBOLS[tile.value] || tile.value[0]}
              </div>
              <div className="absolute inset-0 rounded-md border border-white/40 pointer-events-none" />
            </div>
          );
        })}

        {tiles.length > 0 && tiles.every(t => t.isMatched) && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-3xl rounded-[4rem] z-[9999] border-2 border-white/10 p-12 text-center animate-in fade-in zoom-in duration-500">
             <div>
               <h2 className="text-5xl md:text-8xl font-black text-white mb-2 tracking-tighter shadow-xl">VITTORIA!</h2>
               <p className="text-emerald-400 font-bold mb-10 tracking-[0.3em] uppercase text-sm">Tutte le tessere rimosse</p>
               <button onClick={initGame} className="bg-emerald-500 hover:bg-emerald-400 text-white px-16 py-6 rounded-2xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs">Gioca Ancora</button>
             </div>
           </div>
        )}
      </div>

      <button onClick={initGame} className="fixed bottom-8 right-8 bg-emerald-600 hover:bg-emerald-500 text-white w-16 h-16 flex items-center justify-center rounded-2xl shadow-2xl transition-all group z-[9000] border border-white/10">
        <RefreshCcw size={28} className="group-hover:rotate-180 transition-transform duration-700" />
      </button>
    </div>
  );
};
