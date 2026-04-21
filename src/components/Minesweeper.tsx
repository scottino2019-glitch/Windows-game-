import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Bomb, RefreshCw } from 'lucide-react';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

export const Minesweeper: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [mineCount, setMineCount] = useState(10);
  const [flagsUsed, setFlagsUsed] = useState(0);
  const size = 10;

  const initGrid = useCallback(() => {
    const newGrid: Cell[][] = Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborCount: 0,
      }))
    );

    // Place mines
    let placedMines = 0;
    while (placedMines < mineCount) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        placedMines++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborCount = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setWin(false);
    setFlagsUsed(0);
  }, [mineCount]);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  const revealCell = (r: number, c: number) => {
    if (gameOver || win || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    const newGrid = [...grid.map(row => [...row])];
    
    if (newGrid[r][c].isMine) {
      setGameOver(true);
      revealAllMines(newGrid);
      return;
    }

    const floodFill = (grid: Cell[][], r: number, c: number) => {
      if (r < 0 || r >= size || c < 0 || c >= size || grid[r][c].isRevealed || grid[r][c].isFlagged) return;
      
      grid[r][c].isRevealed = true;
      
      if (grid[r][c].neighborCount === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            floodFill(grid, r + dr, c + dc);
          }
        }
      }
    };

    floodFill(newGrid, r, c);
    setGrid(newGrid);
    checkWin(newGrid);
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || win || grid[r][c].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    const cell = newGrid[r][c];
    
    if (!cell.isFlagged && flagsUsed >= mineCount) return;

    cell.isFlagged = !cell.isFlagged;
    setFlagsUsed(prev => cell.isFlagged ? prev + 1 : prev - 1);
    setGrid(newGrid);
  };

  const revealAllMines = (grid: Cell[][]) => {
    grid.forEach(row => row.forEach(cell => {
      if (cell.isMine) cell.isRevealed = true;
    }));
    setGrid(grid);
  };

  const checkWin = (grid: Cell[][]) => {
    const allRevealed = grid.every(row => 
      row.every(cell => cell.isMine || cell.isRevealed)
    );
    if (allRevealed) {
      setWin(true);
    }
  };

  const getColor = (count: number) => {
    const colors = ['', 'text-blue-600', 'text-green-600', 'text-red-600', 'text-purple-600', 'text-maroon-600', 'text-turquoise-600', 'text-black', 'text-gray-500'];
    return colors[count] || 'text-black';
  };

  return (
    <div className="flex flex-col items-center bg-[#c0c0c0] p-2 border-2 border-[#808080] shadow-[inset_1px_1px_#dfdfdf,1px_1px_#0a0a0a]">
      {/* HUD */}
      <div className="w-full flex items-center justify-between mb-2 bg-[#c0c0c0] p-1 border-2 border-[#808080] shadow-[inset_1px_1px_#0a0a0a,1px_1px_#dfdfdf]">
        <div className="bg-black px-2 py-1 flex items-center gap-1 font-mono text-red-500 text-xl border-2 border-[#808080]">
          {String(mineCount - flagsUsed).padStart(3, '0')}
        </div>
        
        <button 
          onClick={initGrid}
          className="bg-[#c0c0c0] w-10 h-10 border-2 border-[#808080] shadow-[inset_2px_2px_#dfdfdf,2px_2px_#0a0a0a] active:shadow-[inset_2px_2px_#0a0a0a,2px_2px_#dfdfdf] flex items-center justify-center"
        >
          {gameOver ? '😵' : win ? '😎' : '🙂'}
        </button>

        <div className="bg-black px-2 py-1 font-mono text-red-500 text-xl border-2 border-[#808080]">
          000
        </div>
      </div>

      {/* Grid */}
    <div className="grid grid-cols-10 border-4 border-[#808080] shadow-[inset_2px_2px_#0a0a0a,2px_2px_#dfdfdf] bg-[#c0c0c0]">
        {grid.map((row, r) => (
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => revealCell(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
              className={`
                w-12 h-12 flex items-center justify-center cursor-pointer select-none text-xl font-black
                ${cell.isRevealed 
                  ? 'bg-[#d0d0d0] border border-[#a0a0a0]' 
                  : 'bg-[#c0c0c0] border-4 border-[#808080] shadow-[inset_3px_3px_#dfdfdf,3px_3px_#0a0a0a] active:shadow-[inset_3px_3px_#0a0a0a,3px_3px_#dfdfdf]'
                }
                ${cell.isMine && cell.isRevealed ? 'bg-red-500' : ''}
              `}
            >
              {cell.isRevealed ? (
                cell.isMine ? <Bomb size={24} fill="black" /> : 
                cell.neighborCount > 0 ? <span className={getColor(cell.neighborCount)}>{cell.neighborCount}</span> : null
              ) : (
                cell.isFlagged ? <Flag size={20} className="text-red-600" fill="currentColor" /> : null
              )}
            </div>
          ))
        ))}
      </div>
    </div>
  );
};
