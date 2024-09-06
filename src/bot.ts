import { basicStrategy } from './strategies';
import type { Hand, DominoStrategy, BoardState, Play } from './types';

type Difficulty = 'basic' | 'intermediate' | 'advanced';

class DominoBot {
  private readonly playerId: number;
  private strategy: DominoStrategy;

  constructor(playerId: number, difficulty: Difficulty = 'basic') {
    this.playerId = playerId;
    this.strategy = this.getStrategy(difficulty);
  }

  public makeMove(hand: Hand, boardState: BoardState): Play | null {
    return this.strategy.makeMove(hand, boardState, this.playerId);
  }

  public setDifficulty(difficulty: Difficulty): void {
    this.strategy = this.getStrategy(difficulty);
  }

  private getStrategy(difficulty: Difficulty): DominoStrategy {
    switch (difficulty) {
      case 'basic':
        return basicStrategy;
      case 'intermediate':
        throw new Error('Intermediate strategy not implemented');
      case 'advanced':
        throw new Error('Advanced strategy not implemented');
      default:
        throw new Error(`Invalid difficulty level: ${difficulty}`);
    }
  }
}

export default DominoBot;
