import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Card, Suit, Rank } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface GameState {
  deck: Card[];
  waste: Card[];
  foundations: Card[][];
  tableaus: Card[][];
}

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        id: `${rank}-${suit}-${Math.random()}`,
        suit,
        rank,
        isFaceUp: false,
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
      relative w-24 h-36 rounded-xl border-2 flex items-center justify-center select-none cursor-pointer transition-all duration-200
      ${card.isFaceUp ? 'bg-white shadow-lg border-slate-200 hover:border-blue-400' : 'bg-blue-800 shadow-inner border-white/40'}
      ${isSelected ? 'ring-4 ring-yellow-400 -translate-y-2 z-[100] shadow-2xl scale-105' : ''}
      ${className}
    `}
  >
    {card.isFaceUp ? (
      <div className={`w-full h-full p-2 flex flex-col justify-between ${card.color === 'red' ? 'text-red-500' : 'text-slate-900'}`}>
        <div className="text-xl font-black leading-none">{card.rank}</div>
        <div className="self-center text-5xl">{getSuitIcon(card.suit)}</div>
        <div className="text-xl font-black leading-none self-end rotate-180">{card.rank}</div>
      </div>
    ) : (
      <div className="w-full h-full rounded-lg flex items-center justify-center bg-blue-900 text-white/20">
        <div className="w-16 h-16 border-8 border-current rounded-full flex items-center justify-center">
           <div className="w-4 h-4 bg-current rounded-full" />
        </div>
      </div>
    )}
  </div>
);

export const Solitaire: React.FC = () => {
  const [state, setState] = useState<GameState>({
    deck: [],
    waste: [],
    foundations: [[], [], [], []],
    tableaus: [[], [], [], [], [], [], []]
  });
  const [selected, setSelected] = useState<{ pileType: string, pileIndex: number, cardIndex: number } | null>(null);

  const initGame = useCallback(() => {
    const freshDeck = shuffle(createDeck());
    const newTableaus: Card[][] = [[], [], [], [], [], [], []];
    
    let deckIndex = 0;
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = freshDeck[deckIndex++];
        if (j === i) card.isFaceUp = true;
        newTableaus[i].push(card);
      }
    }

    setState({
      deck: freshDeck.slice(deckIndex),
      waste: [],
      foundations: [[], [], [], []],
      tableaus: newTableaus
    });
    setSelected(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const drawCard = () => {
    setState(prev => {
      if (prev.deck.length === 0) {
        if (prev.waste.length === 0) return prev;
        return {
          ...prev,
          deck: [...prev.waste].reverse().map(c => ({ ...c, isFaceUp: false })),
          waste: []
        };
      }
      const drawn = prev.deck[prev.deck.length - 1];
      return {
        ...prev,
        deck: prev.deck.slice(0, -1),
        waste: [...prev.waste, { ...drawn, isFaceUp: true }]
      };
    });
  };

  const handleCardClick = (pileType: string, pileIndex: number, cardIndex: number) => {
    if (selected) {
      const { pileType: fromType, pileIndex: fromIndex, cardIndex: fromCardIdx } = selected;
      
      if (fromType === pileType && fromIndex === pileIndex && fromCardIdx === cardIndex) {
        setSelected(null);
        return;
      }

      const sourcePile = fromType === 'waste' ? state.waste : (fromType === 'tableau' ? state.tableaus[fromIndex] : state.foundations[fromIndex]);
      const cardToMove = sourcePile[fromCardIdx];

      let newState = { ...state };
      let moveExecuted = false;

      if (pileType === 'tableau') {
        const targetPile = state.tableaus[pileIndex];
        const canMove = targetPile.length === 0 
          ? cardToMove.rank === 'K'
          : cardToMove.color !== targetPile[targetPile.length - 1].color && 
            getRankValue(cardToMove.rank) === getRankValue(targetPile[targetPile.length - 1].rank) - 1;

        if (canMove) {
          const cardsToMove = sourcePile.slice(fromCardIdx).map(c => ({ ...c }));
          
          // Update Target
          newState.tableaus = [...newState.tableaus];
          newState.tableaus[pileIndex] = [...targetPile, ...cardsToMove];

          // Update Source
          if (fromType === 'tableau') {
            newState.tableaus[fromIndex] = sourcePile.slice(0, fromCardIdx);
            if (newState.tableaus[fromIndex].length > 0) {
              const last = newState.tableaus[fromIndex][newState.tableaus[fromIndex].length - 1];
              newState.tableaus[fromIndex][newState.tableaus[fromIndex].length - 1] = { ...last, isFaceUp: true };
            }
          } else if (fromType === 'waste') {
            newState.waste = newState.waste.slice(0, -1);
          } else if (fromType === 'foundation') {
            newState.foundations = [...newState.foundations];
            newState.foundations[fromIndex] = sourcePile.slice(0, -1);
          }
          moveExecuted = true;
        }
      } else if (pileType === 'foundation') {
        if (fromCardIdx === sourcePile.length - 1) {
          const targetPile = state.foundations[pileIndex];
          const canMove = targetPile.length === 0 
            ? cardToMove.rank === 'A'
            : cardToMove.suit === targetPile[targetPile.length - 1].suit && 
              getRankValue(cardToMove.rank) === getRankValue(targetPile[targetPile.length - 1].rank) + 1;

          if (canMove) {
            newState.foundations = [...newState.foundations];
            newState.foundations[pileIndex] = [...targetPile, cardToMove];

            if (fromType === 'tableau') {
              newState.tableaus = [...newState.tableaus];
              newState.tableaus[fromIndex] = sourcePile.slice(0, -1);
              if (newState.tableaus[fromIndex].length > 0) {
                const last = newState.tableaus[fromIndex][newState.tableaus[fromIndex].length - 1];
                newState.tableaus[fromIndex][newState.tableaus[fromIndex].length - 1] = { ...last, isFaceUp: true };
              }
            } else if (fromType === 'waste') {
              newState.waste = newState.waste.slice(0, -1);
            } else if (fromType === 'foundation') {
              newState.foundations[fromIndex] = sourcePile.slice(0, -1);
            }
            moveExecuted = true;
          }
        }
      }

      if (moveExecuted) {
        setState(newState);
        setSelected(null);
      } else {
        setSelected(null);
      }
    } else {
      if (pileType === 'waste' && cardIndex !== state.waste.length - 1) return;
      if (pileType === 'tableau') {
         if (cardIndex === -1 || !state.tableaus[pileIndex][cardIndex].isFaceUp) return;
      }
      if (pileType === 'foundation' && cardIndex === -1) return;
      setSelected({ pileType, pileIndex, cardIndex });
    }
  };

  return (
    <div className="bg-[#1a4a1a] p-8 min-w-[1000px] min-h-[800px] flex flex-col gap-12 select-none">
      <div className="flex justify-between items-start">
        <div className="flex gap-8">
          <div onClick={drawCard} className={`w-24 h-36 rounded-xl border-4 border-white/20 flex items-center justify-center cursor-pointer transition-all hover:bg-white/5 ${state.deck.length > 0 ? 'bg-blue-950 shadow-2xl' : 'opacity-20'}`}>
            {state.deck.length > 0 && <div className="w-full h-full bg-blue-900 rounded-lg border-2 border-white/10" />}
            {state.deck.length === 0 && <RefreshCcw className="text-white" size={32} />}
          </div>
          <div className="w-24 h-36 relative">
             {state.waste.slice(-3).map((card, i) => (
                <CardComponent 
                  key={card.id} 
                  card={card} 
                  isSelected={selected?.pileType === 'waste' && selected?.cardIndex === (state.waste.length - (state.waste.slice(-3).length - i))}
                  onClick={() => handleCardClick('waste', 0, state.waste.length - (state.waste.slice(-3).length - i))}
                  className="absolute"
                  style={{ left: `${i * 30}px`, zIndex: i }}
                />
             ))}
          </div>
        </div>

        <div className="flex gap-6">
          {state.foundations.map((pile, i) => (
            <div 
              key={i} 
              onClick={() => handleCardClick('foundation', i, pile.length - 1)}
              className="w-24 h-36 rounded-xl border-4 border-white/5 bg-white/5 flex items-center justify-center relative transition-all hover:bg-white/10"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                 <span className="text-white text-6xl">{['♥','♦','♣','♠'][i]}</span>
              </div>
              {pile.length > 0 && <CardComponent card={pile[pile.length - 1]} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 justify-center mt-8">
        {state.tableaus.map((pile, i) => (
          <div 
            key={i} 
            className="w-24 min-h-[500px] flex flex-col items-center cursor-pointer"
            onClick={() => pile.length === 0 && handleCardClick('tableau', i, -1)}
          >
            <div className="relative w-full">
              {pile.length === 0 && (
                 <div className="w-24 h-36 rounded-xl border-2 border-dashed border-white/10" />
              )}
              {pile.map((card, j) => (
                <div key={card.id} className="absolute w-full" style={{ top: `${j * 35}px`, zIndex: j }}>
                  <CardComponent 
                    card={card} 
                    isSelected={selected?.pileType === 'tableau' && selected?.pileIndex === i && selected?.cardIndex === j}
                    onClick={() => handleCardClick('tableau', i, j)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={initGame} className="fixed bottom-8 right-8 bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl transition-all">
        <RefreshCcw size={28} />
      </button>
    </div>
  );
};
