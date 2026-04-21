import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Chess as ChessGame } from 'chess.js';

type Color = 'w' | 'b';

export const Chess: React.FC = () => {
  const [game, setGame] = useState(new ChessGame());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [status, setStatus] = useState("Il tuo turno (Bianco)");
  const aiTimeout = useRef<NodeJS.Timeout | null>(null);

  const initGame = useCallback(() => {
    const newGame = new ChessGame();
    setGame(newGame);
    setSelectedSquare(null);
    setMoveHistory([]);
    setStatus("Tocca a te! Fai la tua mossa.");
    if (aiTimeout.current) clearTimeout(aiTimeout.current);
  }, []);

  useEffect(() => {
    return () => {
      if (aiTimeout.current) clearTimeout(aiTimeout.current);
    };
  }, []);

  const makeMove = (move: any) => {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new ChessGame(game.fen()));
        setMoveHistory(h => [...h, result.san]);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  const onSquareClick = (square: string) => {
    if (game.turn() === 'b' || game.isGameOver()) return;

    if (selectedSquare) {
      const move = makeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });

      if (!move) {
        const piece = game.get(square as any);
        if (piece && piece.color === 'w') {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      } else {
        setSelectedSquare(null);
        setStatus("Il Computer sta riflettendo...");
        aiTimeout.current = setTimeout(makeAIMove, 1500);
      }
    } else {
      const piece = game.get(square as any);
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
      }
    }
  };

  const makeAIMove = () => {
    if (game.isGameOver()) return;

    const moves = game.moves();
    if (moves.length === 0) return;

    // Simple Greedy AI
    const prioritizedMoves = moves.sort((a, b) => {
       if (a.includes('#')) return -1;
       if (a.includes('x')) return -1;
       if (a.includes('+')) return -1;
       return 0;
    });

    const move = prioritizedMoves[Math.floor(Math.random() * Math.min(3, prioritizedMoves.length))];
    game.move(move);
    setGame(new ChessGame(game.fen()));
    setMoveHistory(h => [...h, move]);
    
    if (game.isGameOver()) {
       if (game.isCheckmate()) setStatus("SCACCO MATTO! Hai perso.");
       else if (game.isDraw()) setStatus("PATTA!");
    } else {
       if (game.isCheck()) setStatus("SEI IN SCACCO! Attenzione.");
       else setStatus("Tocca a te! Difendi il Re.");
    }
  };

  const board = game.board();
  
  const getPieceIcon = (type: string, color: string) => {
    const icons: any = {
      p: color === 'w' ? '♙' : '♟',
      r: color === 'w' ? '♖' : '♜',
      n: color === 'w' ? '♘' : '♞',
      b: color === 'w' ? '♗' : '♝',
      q: color === 'w' ? '♕' : '♛',
      k: color === 'w' ? '♔' : '♚',
    };
    return icons[type] || '';
  };

  return (
    <div className="bg-[#1e293b] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-4 md:p-12 flex flex-col items-center gap-10 min-h-[750px] w-full select-none overflow-auto">
      <div className="flex flex-col lg:flex-row items-start justify-center gap-12 w-full max-w-6xl">
        {/* Board Section */}
        <div className="flex flex-col items-center">
            <div className={`mb-8 px-10 py-3 rounded-full flex items-center gap-4 border-2 transition-all duration-500 ${game.turn() === 'w' ? 'bg-white/10 border-white/20' : 'bg-slate-900/40 border-slate-700/50'}`}>
                <div className={`w-3 h-3 rounded-full ${game.turn() === 'w' ? 'bg-white shadow-[0_0_15px_white] animate-pulse' : 'bg-slate-800'}`} />
                <span className="text-white font-black uppercase text-xs tracking-[0.4em]">{game.turn() === 'w' ? 'TUO TURNO' : 'TURNO CPU'}</span>
            </div>

            <div className="grid grid-cols-8 border-[16px] border-[#334155] shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden scale-90 md:scale-100">
                {board.map((row, r) => (
                    row.map((cell, c) => {
                        const square = `${String.fromCharCode(97 + c)}${8 - r}`;
                        const isDark = (r + c) % 2 === 1;
                        const isSelected = selectedSquare === square;
                        const validMoves = selectedSquare ? game.moves({ square: selectedSquare as any, verbose: true }) : [];
                        const isPossibleMove = validMoves.some(m => m.to === square);

                        return (
                            <div
                                key={square}
                                onClick={() => onSquareClick(square)}
                                className={`
                                    w-11 h-11 md:w-16 md:h-16 flex items-center justify-center text-4xl md:text-5xl cursor-pointer transition-all relative
                                    ${isDark ? 'bg-slate-700' : 'bg-slate-300'}
                                    ${isSelected ? 'bg-emerald-500/60' : ''}
                                `}
                            >
                                {isPossibleMove && (
                                    <div className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-black/10 z-0 ring-2 ring-black/5" />
                                )}
                                {cell && (
                                    <span className={`${cell.color === 'w' ? 'text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]' : 'text-slate-900'} z-10 transition-transform ${isSelected ? 'scale-110 -translate-y-1' : 'hover:scale-105'}`}>
                                        {getPieceIcon(cell.type, cell.color)}
                                    </span>
                                )}
                                <div className={`absolute bottom-0.5 right-0.5 text-[7px] font-bold opacity-30 ${isDark ? 'text-white' : 'text-black'}`}>
                                    {square}
                                </div>
                            </div>
                        );
                    })
                ))}
            </div>
            
            <div className="mt-10 px-8 py-3 bg-white/5 rounded-2xl border border-white/5 text-white/80 font-black text-sm tracking-widest uppercase animate-bounce-slow">
              {status}
            </div>
        </div>

        {/* Info & History Panel */}
        <div className="flex flex-col w-full lg:w-72 h-[600px] bg-slate-900/60 rounded-[2.5rem] p-8 border border-white/10 backdrop-blur-2xl shadow-2xl shrink-0">
           <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
              <RefreshCcw size={14} className="text-white/40" />
              <h3 className="text-white/40 font-black uppercase text-[10px] tracking-[0.3em]">Cronologia</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                 <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-white/5 group hover:bg-white/5 px-2 rounded-lg transition-colors">
                    <span className="text-white/20 font-mono w-6">{i + 1}.</span>
                    <span className="text-white font-black w-full text-center">{moveHistory[i * 2]}</span>
                    <span className="text-white/60 w-full text-center">{moveHistory[i * 2 + 1] || '...'}</span>
                 </div>
              ))}
           </div>
           
           <button 
             onClick={initGame} 
             className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-xs tracking-widest shadow-lg active:scale-95"
           >
             <RefreshCcw size={16} />
             NUOVA PARTITA
           </button>
        </div>
      </div>
    </div>
  );
};
