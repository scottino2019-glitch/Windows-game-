/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, 
  Gamepad2, 
  Layers, 
  Search, 
  Volume2, 
  Wifi, 
  Battery, 
  Menu,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { Window } from './components/Window';
import { Minesweeper } from './components/Minesweeper';
import { Solitaire } from './components/Solitaire';
import { FreeCell } from './components/FreeCell';
import { Spider } from './components/Spider';
import { Mahjong } from './components/Mahjong';
import { Hearts } from './components/Hearts';
import { Chess } from './components/Chess';
import { Pinball } from './components/Pinball';
import { Checkers } from './components/Checkers';
import { GameType, WindowState } from './types';

export default function App() {
  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'minesweeper', title: 'Prato Fiorito', isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'solitaire', title: 'Solitario', isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'freecell', title: 'FreeCell', isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'spider', title: 'Spider Solitaire', isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'hearts', title: 'Hearts', isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'mahjong', title: 'Mahjong Titans', isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'chess', title: 'Chess Titans', isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'pinball', title: 'Space Pinball', isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'checkers', title: 'Dama', isOpen: false, isMinimized: false, zIndex: 10 },
  ]);
  const [activeWindow, setActiveWindow] = useState<GameType | 'none'>('none');
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const openWindow = (id: GameType) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isOpen: true, isMinimized: false, zIndex: getMaxZIndex() + 1 };
      }
      return w;
    }));
    setActiveWindow(id);
  };

  const closeWindow = (id: GameType) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
    if (activeWindow === id) setActiveWindow('none');
  };

  const minimizeWindow = (id: GameType) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    setActiveWindow('none');
  };

  const getMaxZIndex = () => {
    return Math.max(...windows.map(w => w.zIndex), 0);
  };

  const focusWindow = (id: GameType) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: getMaxZIndex() + 1, isMinimized: false } : w));
    setActiveWindow(id);
  };

  const anyWindowOpen = windows.some(w => w.isOpen && !w.isMinimized);

  const ComingSoon = ({ title }: { title: string }) => (
    <div className="p-12 text-center bg-slate-100 rounded-3xl min-w-[400px]">
      <h3 className="text-3xl font-black text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Disponibile Prossimamente</p>
      <div className="mt-8 flex justify-center opacity-20">
         <Monitor size={120} />
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#eef1f6] flex flex-col font-sans select-none relative">
      <div className="flex flex-col h-full p-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <svg width="40" height="40" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="42" height="42" fill="#f35325" />
              <rect x="46" width="42" height="42" fill="#81bc06" />
              <rect y="46" width="42" height="42" fill="#05a6f0" />
              <rect x="46" y="46" width="42" height="42" fill="#ffba08" />
            </svg>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Area Giochi</h1>
              <p className="text-sm font-semibold text-slate-500">I classici, riscoperti.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
               <Clock className="text-blue-500" size={20} />
               <span className="text-xl font-black text-slate-800">{time}</span>
            </div>
          </div>
        </header>

        {/* Home Bento Grid */}
        <main className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 overflow-y-auto pr-2 pb-24 scrollbar-hide">
          {/* Solitario - Large Card */}
          <div 
            onClick={() => openWindow('solitaire')}
            className="md:col-span-2 md:row-span-2 game-card solitaire-gradient rounded-[2.5rem] p-10 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden group"
          >
            <div className="z-10">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest mb-6 inline-block backdrop-blur-md">IL PIÙ GIOCATO</span>
              <h2 className="text-6xl font-black mb-4 leading-none">Solitario</h2>
              <p className="text-blue-500/10 text-9xl absolute -bottom-4 right-0 font-black pointer-events-none group-hover:scale-110 transition-transform">K</p>
              <p className="text-blue-100 max-w-xs text-xl font-medium">L'eterno classico delle carte.</p>
            </div>
            <div className="z-10 flex gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); openWindow('solitaire'); }}
                className="bg-white text-blue-800 px-10 py-4 rounded-2xl font-black shadow-2xl hover:bg-blue-50 transition-all active:scale-95"
              >
                GIOCA ORA
              </button>
            </div>
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
               <Layers size={300} strokeWidth={0.5} />
            </div>
          </div>

          {/* Prato Fiorito - Medium Card */}
          <div 
            onClick={() => openWindow('minesweeper')}
            className="md:col-span-1 md:row-span-1 game-card mines-gradient rounded-[2.5rem] p-8 flex flex-col justify-between text-white shadow-xl overflow-hidden relative group"
          >
            <div className="z-10">
              <h3 className="text-2xl font-black">Prato Fiorito</h3>
              <p className="text-xs font-bold text-slate-300">Rischio e intuito</p>
            </div>
            <div className="z-10 flex justify-between items-end">
              <button 
                onClick={(e) => { e.stopPropagation(); openWindow('minesweeper'); }}
                className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all group-hover:bg-white group-hover:text-slate-800"
              >
                <Gamepad2 size={28} />
              </button>
            </div>
          </div>

          {/* Spider - Ready */}
          <div 
            onClick={() => openWindow('spider')}
            className="md:col-span-1 md:row-span-2 game-card spider-gradient rounded-[2.5rem] p-8 flex flex-col justify-between text-white shadow-xl relative overflow-hidden group"
          >
            <div>
              <h3 className="text-2xl font-black">Spider</h3>
              <p className="text-sm font-bold text-green-100 opacity-80">Sfida massima</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-full bg-white rounded-full"></div>
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white transition-colors">GIOCA ORA</p>
            </div>
          </div>

          {/* Hearts - Small Card */}
          <div 
             onClick={() => openWindow('hearts')}
             className="md:col-span-1 md:row-span-1 game-card hearts-gradient rounded-[2.5rem] p-8 flex flex-col justify-between text-white shadow-xl group"
          >
            <div>
              <h3 className="text-2xl font-black">Hearts</h3>
              <p className="text-xs font-bold text-red-100 opacity-80 italic">Multiplayer</p>
            </div>
            <div className="flex -space-x-3 items-center">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-4 border-red-900 bg-red-400 group-hover:translate-x-2 transition-transform" style={{ transitionDelay: `${i*100}ms` }} />
               ))}
            </div>
          </div>

          {/* FreeCell - Important staple */}
          <div 
            onClick={() => openWindow('freecell')}
            className="md:col-span-1 md:row-span-1 game-card glass bg-white/60 rounded-[2.5rem] p-8 flex flex-col justify-between border border-slate-200 shadow-xl group hover:bg-white"
          >
            <div>
               <h3 className="text-2xl font-black text-slate-800">FreeCell</h3>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Puzzle Game</p>
            </div>
            <div className="flex gap-2">
               <div className="w-8 h-10 bg-slate-200 rounded group-hover:bg-blue-400 transition-colors" />
               <div className="w-8 h-10 bg-slate-200 rounded group-hover:bg-red-400 transition-colors" />
            </div>
          </div>

          {/* Chess titans placeholder */}
          <div 
            onClick={() => openWindow('chess')}
            className="md:col-span-1 md:row-span-1 game-card chess-gradient rounded-[2.5rem] p-8 flex flex-col justify-between text-white shadow-xl overflow-hidden relative group"
          >
            <div>
              <h3 className="text-2xl font-black tracking-tight">Cavaliere</h3>
              <p className="text-xs font-bold text-amber-200 uppercase tracking-widest opacity-60">Chess</p>
            </div>
          </div>

          {/* Mahjong titans placeholder */}
          <div 
            onClick={() => openWindow('mahjong')}
            className="md:col-span-2 md:row-span-1 game-card mahjong-gradient rounded-[2.5rem] p-8 flex items-center justify-between text-white shadow-xl group"
          >
            <div>
              <h2 className="text-4xl font-black leading-none mb-1">Mahjong</h2>
              <p className="text-purple-100 font-medium opacity-80">Rilassamento totale.</p>
            </div>
            <div className="flex gap-4 group-hover:scale-110 transition-transform">
              <div className="w-14 h-20 bg-white rounded-2xl border-b-8 border-purple-300 flex items-center justify-center text-purple-900 text-3xl font-black shadow-2xl">竹</div>
              <div className="w-14 h-20 bg-white rounded-2xl border-b-8 border-purple-300 flex items-center justify-center text-purple-900 text-3xl font-black shadow-2xl">萬</div>
            </div>
          </div>

          {/* Space Pinball */}
          <div 
            onClick={() => openWindow('pinball')}
            className="md:col-span-1 md:row-span-1 game-card bg-slate-900 rounded-[2.5rem] p-8 flex flex-col justify-between text-white shadow-xl group border border-white/5"
          >
            <div>
              <h3 className="text-2xl font-black italic">Pinball</h3>
              <p className="text-xs font-bold text-blue-400 opacity-60">Arcade Classic</p>
            </div>
            <div className="relative h-12 flex items-center overflow-hidden">
               <div className="w-4 h-4 bg-white rounded-full group-hover:translate-x-20 transition-transform duration-1000" />
            </div>
          </div>

          {/* Checkers / Dama */}
          <div 
            onClick={() => openWindow('checkers')}
            className="md:col-span-1 md:row-span-1 game-card bg-[#d2b48c] rounded-[2.5rem] p-8 flex flex-col justify-between text-[#2a1a0a] shadow-xl group border border-[#3a2a1a]/10"
          >
            <div>
              <h3 className="text-2xl font-black">Dama</h3>
              <p className="text-xs font-black uppercase opacity-40">Classico</p>
            </div>
            <div className="flex gap-2">
               <div className="w-6 h-6 rounded-full bg-slate-900 shadow-lg" />
               <div className="w-6 h-6 rounded-full bg-white shadow-lg" />
            </div>
          </div>
        </main>
      </div>

      {/* Modern Floating Dock / Taskbar */}
      {anyWindowOpen && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 p-4 glass rounded-[2rem] shadow-2xl z-[10000] border border-white/50 backdrop-blur-2xl">
           {windows.filter(w => w.isOpen).map(win => (
             <button
               key={win.id}
               onClick={() => win.isMinimized ? focusWindow(win.id) : activeWindow === win.id ? minimizeWindow(win.id) : focusWindow(win.id)}
               className={`
                 w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-300 relative group
                 ${activeWindow === win.id && !win.isMinimized 
                   ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110' 
                   : 'bg-white/40 text-slate-700 hover:bg-white'}
               `}
             >
               {win.id === 'minesweeper' && <Gamepad2 size={32} />}
               {win.id === 'solitaire' && <Layers size={32} />}
               {win.id === 'freecell' && <Layers size={32} className="text-blue-600" />}
               {!['minesweeper', 'solitaire', 'freecell'].includes(win.id) && <Monitor size={32} />}
               
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {win.title}
               </div>
               
               {activeWindow === win.id && !win.isMinimized && (
                 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
               )}
             </button>
           ))}
        </div>
      )}

      {/* Full Management Layer */}
      <div className="absolute inset-0 pointer-events-none z-[5000] flex items-center justify-center">
        {windows.map(win => win.isOpen && (
          <div 
            key={win.id} 
            onMouseDown={() => focusWindow(win.id)}
            className={`${win.isMinimized ? 'hidden' : 'block pointer-events-auto'} absolute`}
            style={{ zIndex: win.zIndex }}
          >
            <Window
              title={win.title}
              isOpen={win.isOpen}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              zIndex={win.zIndex}
            >
              {win.id === 'minesweeper' && <Minesweeper />}
              {win.id === 'solitaire' && <Solitaire />}
              {win.id === 'freecell' && <FreeCell />}
              {win.id === 'spider' && <Spider />}
              {win.id === 'mahjong' && <Mahjong />}
              {win.id === 'hearts' && <Hearts />}
              {win.id === 'chess' && <Chess />}
              {win.id === 'pinball' && <Pinball />}
              {win.id === 'checkers' && <Checkers />}
              {!['minesweeper', 'solitaire', 'freecell', 'spider', 'mahjong', 'hearts', 'chess', 'pinball', 'checkers'].includes(win.id) && <ComingSoon title={win.title} />}
            </Window>
          </div>
        ))}
      </div>
    </div>
  );
}
