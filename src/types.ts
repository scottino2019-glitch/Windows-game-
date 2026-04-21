export type GameType = 'minesweeper' | 'solitaire' | 'freecell' | 'spider' | 'hearts' | 'chess' | 'mahjong' | 'pinball' | 'checkers' | 'none';

export interface WindowState {
  id: GameType;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
  color: 'red' | 'black';
}

export interface MinesweeperCell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}
