import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, User } from 'lucide-react';
import { Card, Suit, Rank } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

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

const getSuitIcon = (suit: Suit) => {
  switch(suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
};

const CardComponent = ({ card, isSelected, onClick, className = "" }: { card: Card, isSelected?: boolean, onClick?: () => void, className?: string, key?: string | number }) => (
  <div 
    onClick={onClick}
    className={`
      w-12 h-16 md:w-20 md:h-28 rounded-lg border-2 bg-white flex flex-col justify-between p-1 md:p-2 select-none cursor-pointer transition-all
      ${card.color === 'red' ? 'text-red-500 border-red-100' : 'text-slate-900 border-slate-100'}
      ${isSelected ? 'ring-4 ring-yellow-400 -translate-y-2 scale-105 z-[50]' : 'hover:border-blue-400 shadow-sm shadow-black/20'}
      ${className}
    `}
  >
    <div className="text-[10px] md:text-xs font-black leading-none">{card.rank}</div>
    <div className="self-center text-lg md:text-2xl">{getSuitIcon(card.suit)}</div>
    <div className="text-[10px] md:text-xs font-black leading-none self-end rotate-180">{card.rank}</div>
  </div>
);

export const Hearts: React.FC = () => {
  const [hands, setHands] = useState<Card[][]>([[], [], [], []]);
  const [trick, setTrick] = useState<{ playerIdx: number, card: Card }[]>([]);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]);
  const [turn, setTurn] = useState<number>(0);
  const [message, setMessage] = useState("Il tuo turno. Gioca una carta.");
  const [gameActive, setGameActive] = useState(true);

  const initGame = useCallback(() => {
    const deck = shuffle(createDeck());
    const newHands: Card[][] = [[], [], [], []];
    deck.forEach((card, i) => {
      newHands[i % 4].push(card);
    });
    
    newHands.forEach(hand => {
      hand.sort((a, b) => {
        const suitOrder = { 'clubs': 0, 'diamonds': 1, 'spades': 2, 'hearts': 3 };
        if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
        return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
      });
    });

    setHands(newHands);
    setTrick([]);
    setScores([0, 0, 0, 0]);
    setTurn(0);
    setMessage("Partita iniziata. Tu inizi.");
    setGameActive(true);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Handle AI Turns
  useEffect(() => {
    if (turn !== 0 && gameActive && trick.length < 4) {
      const timer = setTimeout(() => {
        playAISingleTurn();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [turn, trick, gameActive]);

  const playAISingleTurn = () => {
    const aiIdx = turn;
    const aiHand = hands[aiIdx];
    if (!aiHand || aiHand.length === 0) return;

    let cardToPlay: Card;
    if (trick.length === 0) {
      cardToPlay = aiHand[0];
    } else {
      const leadSuit = trick[0].card.suit;
      const validCards = aiHand.filter(c => c.suit === leadSuit);
      cardToPlay = validCards.length > 0 ? validCards[0] : aiHand[0];
    }

    const newTrick = [...trick, { playerIdx: aiIdx, card: cardToPlay }];
    const newHands = [...hands];
    newHands[aiIdx] = aiHand.filter(c => c.id !== cardToPlay.id);

    setTrick(newTrick);
    setHands(newHands);

    if (newTrick.length === 4) {
      setTimeout(() => resolveTrick(newTrick), 1500);
    } else {
      setTurn((aiIdx + 1) % 4);
      setMessage(`Turno di Bot ${turn === 3 ? 0 : turn + 1}...`);
    }
  };

  const playCard = (card: Card) => {
    if (turn !== 0 || trick.length === 4 || !gameActive) return;
    
    if (trick.length > 0) {
       const leadSuit = trick[0].card.suit;
       const hasLeadSuit = hands[0].some(c => c.suit === leadSuit);
       if (hasLeadSuit && card.suit !== leadSuit) {
          setMessage(`Devi giocare ${getSuitIcon(leadSuit)}!`);
          return;
       }
    }

    const newTrick = [...trick, { playerIdx: 0, card }];
    const newHand = hands[0].filter(c => c.id !== card.id);
    const newHands = [newHand, ...hands.slice(1)];
    
    setTrick(newTrick);
    setHands(newHands);
    setMessage("Ottima mossa. Attendi...");

    if (newTrick.length === 4) {
      setTimeout(() => resolveTrick(newTrick), 1500);
    } else {
      setTurn(1);
    }
  };

  const resolveTrick = (finalTrick: { playerIdx: number, card: Card }[]) => {
    const leadSuit = finalTrick[0].card.suit;
    let winnerIdx = finalTrick[0].playerIdx;
    let highestRankValue = RANKS.indexOf(finalTrick[0].card.rank);

    finalTrick.forEach(({ playerIdx, card }) => {
        if (card.suit === leadSuit) {
           const val = RANKS.indexOf(card.rank);
           if (val > highestRankValue) {
              highestRankValue = val;
              winnerIdx = playerIdx;
           }
        }
    });

    let trickPoints = 0;
    finalTrick.forEach(({ card }) => {
       if (card.suit === 'hearts') trickPoints += 1;
       if (card.suit === 'spades' && card.rank === 'Q') trickPoints += 13;
    });

    setScores(prev => {
        const next = [...prev];
        next[winnerIdx] += trickPoints;
        return next;
    });

    setTimeout(() => {
      setTrick([]);
      if (hands[0].length === 0) {
        setGameActive(false);
        setMessage("Partita Terminata!");
      } else {
        setTurn(winnerIdx);
        setMessage(winnerIdx === 0 ? "Hai vinto la mano! Tocca a te." : `Bot ${winnerIdx} ha vinto la mano.`);
      }
    }, 1000);
  };

  const PlayerSlot = ({ idx, active }: { idx: number, active: boolean }) => (
    <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${active ? 'scale-110' : 'opacity-40'}`}>
       <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 ${active ? 'bg-yellow-400 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-pulse' : 'bg-slate-900 border-white/10'} text-[10px] md:text-sm font-black text-white relative`}>
          {idx === 0 ? <User size={24} /> : `B${idx}`}
          {active && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />}
       </div>
       {idx !== 0 && (
         <div className="flex gap-0.5">
           {hands[idx].map((_, i) => (
             <div key={i} className="w-1.5 md:w-2 h-2 md:h-3 bg-red-950/60 rounded-[1px] border border-white/5" />
           ))}
         </div>
       )}
    </div>
  );

  return (
    <div className="bg-[#450a0a] bg-gradient-to-br from-[#450a0a] to-[#2a0505] p-4 md:p-8 flex flex-col items-center justify-between select-none h-full relative overflow-hidden w-full max-w-[1200px] mx-auto min-h-[700px]">
      {/* Bot 2 (Top) */}
      <PlayerSlot idx={2} active={turn === 2} />

      <div className="flex w-full justify-between items-center px-4 md:px-24">
         {/* Bot 1 (Left) */}
         <div className="rotate-90 origin-center -translate-x-12">
            <PlayerSlot idx={1} active={turn === 1} />
         </div>

         {/* Trick Area */}
         <div className="w-60 h-60 md:w-96 md:h-96 bg-black/40 rounded-full flex items-center justify-center relative border-4 border-white/10 shadow-inner">
            {trick.map((play, i) => (
               <div 
                 key={i} 
                 className="absolute transition-all duration-700"
                 style={{
                   transform: `
                     rotate(${play.playerIdx * 90}deg) 
                     translateY(-70px)
                   `
                 }}
               >
                 <CardComponent card={play.card} className="shadow-2xl scale-90 md:scale-100" />
               </div>
            ))}
            {!trick.length && (
              <div className="text-white/5 text-4xl md:text-6xl font-black uppercase tracking-[0.5em] select-none text-center">
                HEARTS
              </div>
            )}
         </div>

         {/* Bot 3 (Right) */}
         <div className="-rotate-90 origin-center translate-x-12">
            <PlayerSlot idx={3} active={turn === 3} />
         </div>
      </div>

      {/* Human Area */}
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="bg-white/10 px-6 py-2 rounded-full text-white font-black text-xs uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-xl">
           {message}
        </div>
        <div className="flex flex-wrap justify-center gap-1 md:gap-2 max-w-5xl px-4">
          {hands[0].map((card, i) => (
            <CardComponent 
              key={card.id} 
              card={card} 
              onClick={() => playCard(card)}
              className="hover:-translate-y-8 transition-transform shadow-2xl"
            />
          ))}
        </div>
        <div className="mt-2">
           <PlayerSlot idx={0} active={turn === 0} />
        </div>
      </div>

      {/* Modern Scoreboard */}
      <div className="absolute top-4 right-4 bg-slate-900/80 p-5 rounded-2xl border border-white/10 text-white backdrop-blur-xl z-[100] shadow-2xl min-w-[140px]">
         <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Scoreboard</span>
         </div>
         <div className="space-y-3">
           {scores.map((s, i) => (
              <div key={i} className={`flex justify-between items-center gap-6 ${i === turn ? 'text-yellow-400' : 'text-white/80'}`}>
                 <span className={`text-xs font-bold ${i === 0 ? 'underline decoration-yellow-400 underline-offset-4' : ''}`}>
                   {i === 0 ? 'TU' : `BOT ${i}`}
                 </span>
                 <span className="font-mono text-sm font-black bg-white/5 px-2 py-0.5 rounded-md">{s}</span>
              </div>
           ))}
         </div>
      </div>

      <button onClick={initGame} className="fixed bottom-6 left-6 bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl backdrop-blur-md border border-white/10 transition-all z-[100] shadow-2xl group">
        <RefreshCcw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
      </button>
    </div>
  );
};
