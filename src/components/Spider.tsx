import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Card, Rank } from '../types';

const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface GameState {
  deck: Card[];
  tableaus: Card[][];
  completedSets: number;
}

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (let s = 0; s < 8; s++) {
    RANKS.forEach(rank => {
      deck.push({
        id: `spades-${rank}-${s}-${Math.random()}`,
        suit: 'spades',
        rank,
        isFaceUp: false,
        color: 'black',
      });
    });
  }
  return deck;
};

const shuffle = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getRankValue = (rank: Rank): number => {
  const values: Record<Rank, number> = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
  };
  return values[rank];
};

const CardComponent = ({ card, isSelected, onClick, className = "", style = {} }: { card: Card, isSelected?: boolean, onClick?: (e: React.MouseEvent) => void, className?: string, style?: React.CSSProperties, key?: string | number }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
    style={style}
    className={`
      relative w-20 h-32 rounded-xl border-2 flex items-center justify-center select-none cursor-pointer transition-all duration-200
      ${card.isFaceUp ? 'bg-white shadow-lg border-slate-200 hover:border-blue-400' : 'bg-slate-800 shadow-inner border-white/20'}
      ${isSelected ? 'ring-4 ring-yellow-400 -translate-y-2 z-[100] shadow-2xl scale-105' : ''}
      ${className}
    `}
  >
    {card.isFaceUp ? (
      <div className="w-full h-full p-2 flex flex-col justify-between text-slate-900">
        <div className="text-sm font-black leading-none">{card.rank}</div>
        <div className="self-center text-3xl font-normal">♠</div>
        <div className="text-sm font-black leading-none self-end rotate-180">{card.rank}</div>
      </div>
    ) : (
      <div className="w-full h-full rounded-lg flex items-center justify-center bg-slate-900 text-white/10">
        <div className="w-12 h-12 border-4 border-current rounded-full" />
      </div>
    )}
  </div>
);

export const Spider: React.FC = () => {
  const [state, setState] = useState<GameState>({
    deck: [],
    tableaus: [[], [], [], [], [], [], [], [], [], []],
    completedSets: 0
  });
  const [selected, setSelected] = useState<{ pileIdx: number, cardIdx: number } | null>(null);

  const initGame = useCallback(() => {
    const freshDeck = shuffle(createDeck());
    const newTableaus: Card[][] = [[], [], [], [], [], [], [], [], [], []];
    
    let deckIndex = 0;
    for (let i = 0; i < 54; i++) {
       const colIdx = i % 10;
       newTableaus[colIdx].push(freshDeck[deckIndex++]);
    }
    
    newTableaus.forEach(pile => {
      if (pile.length > 0) pile[pile.length - 1].isFaceUp = true;
    });

    setState({
      deck: freshDeck.slice(deckIndex),
      tableaus: newTableaus,
      completedSets: 0
    });
    setSelected(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const dealRound = () => {
    setState(prev => {
      if (prev.deck.length < 10) return prev;
      const newCards = prev.deck.slice(0, 10).map(c => ({ ...c, isFaceUp: true }));
      const nextTableaus = prev.tableaus.map((pile, i) => [...pile, newCards[i]]);
      return {
        ...prev,
        deck: prev.deck.slice(10),
        tableaus: nextTableaus
      };
    });
  };

  const handleCardClick = (pileIdx: number, cardIdx: number) => {
    if (selected) {
      const { pileIdx: fromIdx, cardIdx: fromCardIdx } = selected;
      
      if (fromIdx === pileIdx) {
        setSelected(null);
        return;
      }

      const sourcePile = state.tableaus[fromIdx];
      const targetPile = state.tableaus[pileIdx];
      const cardsToMove = sourcePile.slice(fromCardIdx).map(c => ({ ...c }));
      const cardToMove = cardsToMove[0];

      const canMove = targetPile.length === 0 || 
        getRankValue(targetPile[targetPile.length - 1].rank) === getRankValue(cardToMove.rank) + 1;

      if (canMove) {
        setState(prev => {
          let nextTableaus = [...prev.tableaus];
          nextTableaus[fromIdx] = sourcePile.slice(0, fromCardIdx);
          if (nextTableaus[fromIdx].length > 0) {
            const last = nextTableaus[fromIdx][nextTableaus[fromIdx].length - 1];
            nextTableaus[fromIdx][nextTableaus[fromIdx].length - 1] = { ...last, isFaceUp: true };
          }
          nextTableaus[pileIdx] = [...targetPile, ...cardsToMove];

          // Check completed set
          const currentTargetPile = nextTableaus[pileIdx];
          if (currentTargetPile.length >= 13) {
             for (let i = currentTargetPile.length - 13; i >= 0; i--) {
                if (!currentTargetPile[i].isFaceUp) continue;
                let isSeq = true;
                for (let j = 0; j < 12; j++) {
                   if (getRankValue(currentTargetPile[i+j].rank) !== getRankValue(currentTargetPile[i+j+1].rank) + 1) {
                      isSeq = false; break;
                   }
                }
                if (isSeq && currentTargetPile[i].rank === 'K') {
                    nextTableaus[pileIdx] = currentTargetPile.slice(0, i);
                    if (nextTableaus[pileIdx].length > 0) {
                        const last = nextTableaus[pileIdx][nextTableaus[pileIdx].length - 1];
                        nextTableaus[pileIdx][nextTableaus[pileIdx].length - 1] = { ...last, isFaceUp: true };
                    }
                    return { ...prev, tableaus: nextTableaus, completedSets: prev.completedSets + 1 };
                }
             }
          }

          return { ...prev, tableaus: nextTableaus };
        });
        setSelected(null);
      } else {
        setSelected(null);
      }
    } else {
      if (cardIdx === -1) return;
      const pile = state.tableaus[pileIdx];
      const card = pile[cardIdx];
      if (!card.isFaceUp) return;

      let isValidSequence = true;
      for (let i = cardIdx; i < pile.length - 1; i++) {
          if (getRankValue(pile[i].rank) !== getRankValue(pile[i + 1].rank) + 1) {
              isValidSequence = false;
              break;
          }
      }

      if (isValidSequence) setSelected({ pileIdx, cardIdx });
    }
  };

  return (
    <div className="bg-[#1e2a1e] p-8 min-w-[950px] min-h-[750px] flex flex-col gap-12 select-none h-full">
      <div className="flex justify-between items-center px-4">
         <div className="flex gap-6 items-center">
            <div onClick={dealRound} className={`w-20 h-32 rounded-xl border-4 border-white/10 flex items-center justify-center cursor-pointer hover:border-white/20 transition-all ${state.deck.length > 0 ? 'bg-slate-800 shadow-2xl' : 'opacity-10'}`}>
               {state.deck.length > 0 && <div className="w-full h-full bg-slate-950 rounded-lg border-2 border-white/10" />}
            </div>
            <div className="flex flex-col">
               <span className="text-white/40 text-[10px] uppercase font-black tracking-widest">Mazzi</span>
               <span className="text-white text-4xl font-black italic">{Math.floor(state.deck.length / 10)}</span>
            </div>
         </div>

         <div className="flex gap-4 items-center">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`w-12 h-16 rounded-lg flex items-center justify-center text-2xl border-2 ${i < state.completedSets ? 'bg-white/10 text-white border-white/30' : 'border-white/5 text-white/5'}`}>
                   {i < state.completedSets ? '♠' : '♠'}
                </div>
            ))}
         </div>
      </div>

      <div className="flex gap-4 justify-center">
        {state.tableaus.map((pile, i) => (
          <div 
            key={i} 
            className="w-20 min-h-[500px] flex flex-col items-center cursor-pointer"
            onClick={() => pile.length === 0 && handleCardClick(i, -1)}
          >
            <div className="relative w-full">
              {pile.length === 0 && (
                 <div className="w-20 h-32 rounded-xl border-2 border-dashed border-white/5" />
              )}
              {pile.map((card, j) => (
                <div key={card.id} className="absolute w-full" style={{ top: `${j * 25}px`, zIndex: j }}>
                  <CardComponent 
                    card={card} 
                    isSelected={selected?.pileIdx === i && selected?.cardIdx === j}
                    onClick={() => handleCardClick(i, j)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={initGame} className="fixed bottom-8 right-8 bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl shadow-2xl border border-white/10 transition-all">
        <RefreshCcw size={28} />
      </button>
    </div>
  );
};
