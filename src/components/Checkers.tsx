import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';

type Piece = 'white' | 'black' | 'whiteKing' | 'blackKing' | null;

interface Move {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  isJump: boolean;
}

export const Checkers: React.FC = () => {
  const [board, setBoard] = useState<Piece[][]>([]);
  const [selected, setSelected] = useState<{ r: number, c: number } | null>(null);
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [message, setMessage] = useState("Il tuo turno. Devi mangiare se possibile!");
  const aiTimeout = useRef<NodeJS.Timeout | null>(null);

  const initGame = useCallback(() => {
    const newBoard: Piece[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) newBoard[r][c] = 'black';
          else if (r > 4) newBoard[r][c] = 'white';
        }
      }
    }
    setBoard(newBoard);
    setSelected(null);
    setTurn('white');
    setMessage("Il tuo turno. Mangia se puoi!");
    if (aiTimeout.current) clearTimeout(aiTimeout.current);
  }, []);

  useEffect(() => {
    initGame();
    return () => {
      if (aiTimeout.current) clearTimeout(aiTimeout.current);
    };
  }, [initGame]);

  const getValidMoves = (player: 'white' | 'black', currentBoard: Piece[][]) => {
    const moves: Move[] = [];
    const jumpMoves: Move[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.includes(player)) {
          const directions = [];
          if (piece === 'white' || piece.includes('King')) directions.push([-1, -1], [-1, 1]);
          if (piece === 'black' || piece.includes('King')) directions.push([1, -1], [1, 1]);

          directions.forEach(([dr, dc]) => {
            const jr = r + dr * 2;
            const jc = c + dc * 2;
            if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && currentBoard[jr][jc] === null) {
                const midPiece = currentBoard[r + dr][c + dc];
                if (midPiece && !midPiece.includes(player)) {
                  jumpMoves.push({ fromR: r, fromC: c, toR: jr, toC: jc, isJump: true });
                }
            }

            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && currentBoard[nr][nc] === null) {
              moves.push({ fromR: r, fromC: c, toR: nr, toC: nc, isJump: false });
            }
          });
        }
      }
    }
    return jumpMoves.length > 0 ? jumpMoves : moves;
  };

  const executeMove = (move: Move) => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      let piece = newBoard[move.fromR][move.fromC];
      
      if (piece === 'white' && move.toR === 0) piece = 'whiteKing';
      if (piece === 'black' && move.toR === 7) piece = 'blackKing';

      newBoard[move.toR][move.toC] = piece;
      newBoard[move.fromR][move.fromC] = null;
      if (move.isJump) {
        newBoard[(move.fromR + move.toR) / 2][(move.fromC + move.toC) / 2] = null;
      }
      return newBoard;
    });

    const nextTurn = turn === 'white' ? 'black' : 'white';
    setTurn(nextTurn);
    setMessage(nextTurn === 'white' ? "Tuo turno" : "Il computer sta pensando...");

    if (nextTurn === 'black') {
      aiTimeout.current = setTimeout(() => makeAIMove(), 1200);
    }
  };

  const makeAIMove = () => {
    setBoard(currentBoard => {
      const moves = getValidMoves('black', currentBoard);
      if (moves.length > 0) {
        const jumpMoves = moves.filter(m => m.isJump);
        const selectedMove = jumpMoves.length > 0 
          ? jumpMoves[Math.floor(Math.random() * jumpMoves.length)]
          : moves[Math.floor(Math.random() * moves.length)];
        
        const nextBoard = currentBoard.map(row => [...row]);
        let piece = nextBoard[selectedMove.fromR][selectedMove.fromC];
        if (piece === 'black' && selectedMove.toR === 7) piece = 'blackKing';
        nextBoard[selectedMove.toR][selectedMove.toC] = piece;
        nextBoard[selectedMove.fromR][selectedMove.fromC] = null;
        if (selectedMove.isJump) {
          nextBoard[(selectedMove.fromR + selectedMove.toR) / 2][(selectedMove.fromC + selectedMove.toC) / 2] = null;
        }
        
        setTurn('white');
        setMessage("Tocca a te!");
        return nextBoard;
      } else {
        setMessage("VITTORIA! Il nero è bloccato!");
        return currentBoard;
      }
    });
  };

  const handleCellClick = (r: number, c: number) => {
    if (turn !== 'white') return;
    const allValidMoves = getValidMoves('white', board);
    const piece = board[r][c];

    if (selected) {
      if (selected.r === r && selected.c === c) {
        setSelected(null);
        return;
      }
      const move = allValidMoves.find(m => m.fromR === selected.r && m.fromC === selected.c && m.toR === r && m.toC === c);
      if (move) {
        executeMove(move);
        setSelected(null);
      } else {
        const canMoveThis = allValidMoves.some(m => m.fromR === r && m.fromC === c);
        if (canMoveThis) setSelected({ r, c });
        else setSelected(null);
      }
    } else {
      if (allValidMoves.some(m => m.fromR === r && m.fromC === c)) {
        setSelected({ r, c });
      } else if (piece && piece.includes('white')) {
         if (allValidMoves.some(m => m.isJump)) setMessage("SALTO OBBLIGATORIO!");
      }
    }
  };

  return (
    <div className="bg-[#1a0f05] bg-gradient-to-br from-[#1a0f05] to-[#0a0502] p-4 md:p-12 min-h-full flex flex-col items-center select-none h-full w-full overflow-auto">
      <div className="mb-8 bg-white/5 px-10 py-3 rounded-full flex items-center gap-6 border border-white/5 backdrop-blur-3xl shadow-2xl">
         <div className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.3em] text-white">
            <div className={`w-3 h-3 rounded-full ${turn === 'white' ? 'bg-white shadow-[0_0_15px_white]' : 'bg-slate-800'}`} />
            {message}
         </div>
      </div>

      <div className="border-[16px] border-[#2a1a0a] shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((piece, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSelected = selected?.r === r && selected?.c === c;
                const validMoves = selected ? getValidMoves('white', board).filter(m => m.fromR === selected.r && m.fromC === selected.c) : [];
                const isPossibleMove = validMoves.some(m => m.toR === r && m.toC === c);
                
                return (
                  <div
                    key={c}
                    onClick={() => handleCellClick(r, c)}
                    className={`
                      w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transition-all relative
                      ${isDark ? 'bg-[#3a2510]' : 'bg-[#c19a6b]'}
                      ${isSelected ? 'bg-yellow-400/20 ring-inset ring-4 ring-yellow-400 z-10' : 'hover:brightness-110'}
                    `}
                  >
                    {isPossibleMove && <div className="absolute w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 border-2 border-white/40 z-0 animate-pulse" />}
                    {piece && (
                      <div className={`
                         w-9 h-9 md:w-12 md:h-12 rounded-full border-[6px] flex items-center justify-center shadow-2xl transform transition-transform z-10
                         ${piece.includes('white') ? 'bg-[#f0f0f0] border-[#dcdcdc]' : 'bg-[#1a1a1a] border-[#0a0a0a]'}
                         ${isSelected ? 'scale-110 -translate-y-2' : ''}
                      `}>
                         {piece.includes('King') && <div className="text-xl drop-shadow-md">👑</div>}
                         <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
      </div>

      <button onClick={initGame} className="mt-12 bg-white/5 hover:bg-white/10 text-white p-5 rounded-2xl border border-white/5 transition-all flex items-center gap-3 font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105">
        <RefreshCcw size={18} />
        REIMPOSTA PARTITA
      </button>
    </div>
  );
};
