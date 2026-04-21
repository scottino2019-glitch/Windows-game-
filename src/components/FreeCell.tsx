import React, { useState, useEffect, useCallback } from 'react';
import { Card, Suit, Rank } from '../types';
import { RefreshCcw } from 'lucide-react';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface GameState {
  cascades: Card[][];
  freeCells: (Card | null)[];
  foundations: Card[][];
}

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        id: `${rank}-${suit}-${Math.random()}`,
        suit,
        rank,
        isFaceUp: true,
        color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
      });
    });
  });
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

const getSuitIcon = (suit: Suit) => {
  switch(suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
};

const CardComponent = ({ card, isSelected, onClick, className = "", style = {} }: { card: Card, isSelected?: boolean, onClick?: (e: React.MouseEvent) => void, className?: string, style?: React.CSSProperties, key?: string | number }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
    style={style}
    className={`
      relative w-22 h-32 rounded-xl border-2 flex items-center justify-center select-none cursor-pointer transition-all duration-200 bg-white
      ${card.color === 'red' ? 'text-red-500 border-slate-100' : 'text-slate-900 border-slate-100'}
      ${isSelected ? 'ring-4 ring-yellow-400 -translate-y-2 z-[100] shadow-2xl scale-105' : 'shadow-md'}
      ${className}
    `}
  >
    <div className="w-full h-full p-2 flex flex-col justify-between">
      <div className="text-sm font-black leading-none">{card.rank}</div>
      <div className="self-center text-3xl">{getSuitIcon(card.suit)}</div>
      <div className="text-sm font-black leading-none self-end rotate-180">{card.rank}</div>
    </div>
  </div>
);

export const FreeCell: React.FC = () => {
  const [state, setState] = useState<GameState>({
    cascades: [[], [], [], [], [], [], [], []],
    freeCells: [null, null, null, null],
    foundations: [[], [], [], []]
  });
  const [selected, setSelected] = useState<{ type: string, pileIdx: number, cardIdx: number } | null>(null);

  const initGame = useCallback(() => {
    const deck = shuffle(createDeck());
    const newCascades: Card[][] = [[], [], [], [], [], [], [], []];
    deck.forEach((card, i) => {
      newCascades[i % 8].push(card);
    });
    setState({
      cascades: newCascades,
      freeCells: [null, null, null, null],
      foundations: [[], [], [], []]
    });
    setSelected(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (type: string, pileIdx: number, cardIdx: number) => {
    if (selected) {
      const { type: fromType, pileIdx: fromIdx, cardIdx: fromCardIdx } = selected;
      
      if (fromType === type && fromIdx === pileIdx && fromCardIdx === cardIdx) {
        setSelected(null);
        return;
      }

      const sourcePile = fromType === 'cascade' ? state.cascades[fromIdx] : (fromType === 'free' ? [state.freeCells[fromIdx]!] : []);
      const cardToMove = sourcePile[sourcePile.length - 1];

      let newState = { ...state };
      let moveExecuted = false;

      if (type === 'foundation') {
        const targetPile = state.foundations[pileIdx];
        const canMove = targetPile.length === 0 
          ? cardToMove.rank === 'A'
          : cardToMove.suit === targetPile[0].suit && 
            getRankValue(cardToMove.rank) === getRankValue(targetPile[targetPile.length - 1].rank) + 1;

        if (canMove) {
          newState.foundations = [...newState.foundations];
          newState.foundations[pileIdx] = [...targetPile, cardToMove];
          moveExecuted = true;
        }
      } else if (type === 'free' && state.freeCells[pileIdx] === null) {
        newState.freeCells = [...newState.freeCells];
        newState.freeCells[pileIdx] = cardToMove;
        moveExecuted = true;
      } else if (type === 'cascade') {
        const targetPile = state.cascades[pileIdx];
        const canMove = targetPile.length === 0 || (
          cardToMove.color !== targetPile[targetPile.length - 1].color &&
          getRankValue(cardToMove.rank) === getRankValue(targetPile[targetPile.length - 1].rank) - 1
        );

        if (canMove) {
          newState.cascades = [...newState.cascades];
          newState.cascades[pileIdx] = [...targetPile, cardToMove];
          moveExecuted = true;
        }
      }

      if (moveExecuted) {
        if (fromType === 'cascade') {
          newState.cascades = [...newState.cascades];
          newState.cascades[fromIdx] = state.cascades[fromIdx].slice(0, -1);
        } else if (fromType === 'free') {
          newState.freeCells = [...newState.freeCells];
          newState.freeCells[fromIdx] = null;
        }
        setState(newState);
        setSelected(null);
      } else {
        setSelected(null);
      }
    } else {
      if (type === 'foundation') return;
      if (type === 'free' && state.freeCells[pileIdx] === null) return;
      if (type === 'cascade' && state.cascades[pileIdx].length === 0) return;
      setSelected({ type, pileIdx, cardIdx });
    }
  };

  return (
    <div className="bg-slate-900 bg-gradient-to-br from-slate-900 to-slate-800 p-8 min-w-[950px] min-h-[750px] flex flex-col gap-12 select-none h-full">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          {state.freeCells.map((card, i) => (
            <div 
              key={i} 
              onClick={() => handleCardClick('free', i, 0)}
              className="w-22 h-32 rounded-xl border-4 border-white/5 bg-white/5 flex items-center justify-center hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="absolute opacity-10 text-white text-xs font-black uppercase">Free</div>
              {card && <CardComponent card={card} isSelected={selected?.type === 'free' && selected?.pileIdx === i} />}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          {state.foundations.map((pile, i) => (
            <div 
              key={i} 
              onClick={() => handleCardClick('foundation', i, pile.length - 1)}
              className="w-22 h-32 rounded-xl border-4 border-white/5 bg-white/5 flex items-center justify-center relative hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                 <span className="text-white text-5xl">{['♥','♦','♣','♠'][i]}</span>
              </div>
              {pile.length > 0 && <CardComponent card={pile[pile.length - 1]} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        {state.cascades.map((pile, i) => (
          <div 
            key={i} 
            className="w-22 min-h-[500px] flex flex-col items-center cursor-pointer"
            onClick={() => pile.length === 0 && handleCardClick('cascade', i, -1)}
          >
            <div className="relative w-full">
              {pile.length === 0 && (
                 <div className="w-22 h-32 rounded-xl border-2 border-dashed border-white/5" />
              )}
              {pile.map((card, j) => (
                <div key={card.id} className="absolute w-full" style={{ top: `${j * 35}px`, zIndex: j }}>
                  <CardComponent 
                    card={card} 
                    isSelected={selected?.type === 'cascade' && selected?.pileIdx === i && selected?.cardIdx === j}
                    onClick={() => handleCardClick('cascade', i, j)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={initGame} className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-2xl transition-all">
        <RefreshCcw size={28} />
      </button>
    </div>
  );
};
