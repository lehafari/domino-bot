import { basicStrategy } from './strategies';
import type { Hand, Strategy, BoardState, Play } from './types';

class DominoBot {
  private strategy!: Strategy;
  private playerId: number;

  constructor(
    playerId: number,
    difficulty: 'basic' | 'intermediate' | 'advanced' = 'basic'
  ) {
    this.playerId = playerId;
    this.setDifficulty(difficulty);
  }
  setDifficulty(difficulty: 'basic' | 'intermediate' | 'advanced') {
    switch (difficulty) {
      case 'basic':
        this.strategy = basicStrategy;
        break;
      case 'intermediate':
        //this.strategy = intermediateStrategy;
        break;
      case 'advanced':
        //  this.strategy = advancedStrategy;
        break;
      default:
        throw new Error('Invalid difficulty level');
    }
  }

  makeMove(hand: Hand, boardState: BoardState): Play | null {
    return this.strategy.makeMove(hand, boardState, this.playerId);
  }
}

export default DominoBot;
