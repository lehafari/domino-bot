import type { BoardState, DominoStrategy, Hand, Play, Tile } from '../types';

type NumberCount = Record<number, number>;

export const basicStrategy: DominoStrategy = {
  makeMove(hand: Hand, boardState: BoardState, playerId: number): Play | null {
    const board = boardState.plays;

    // If the board is empty, play the highest tile
    if (board.length === 0) {
      return this.playFirstTile(hand);
    }

    const { headNumber, backNumber } = this.findAvailableSides(board);
    const playedNumbers = this.countPlayedNumbers(board);

    let bestPlay = this.findBestPlay(
      hand,
      headNumber,
      backNumber,
      playedNumbers,
      board.length
    );

    // Special handling for endgame scenarios
    if (hand.length <= 3) {
      bestPlay = this.handleEndgame(
        hand,
        headNumber,
        backNumber,
        bestPlay,
        board.length
      );
    }

    return bestPlay;
  },

  playFirstTile(hand: Hand): Play {
    const highestTile = this.findHighestTile(hand);
    // When playing the first tile, we always play it on the 'top' side
    return { tile: highestTile, side: 'TOP', index: 0 };
  },

  findAvailableSides(board: Play[]): {
    headNumber: number;
    backNumber: number;
  } {
    const firstPlay = board[0];
    const lastPlay = board[board.length - 1];

    // Determine the available numbers on both ends of the board
    return {
      headNumber:
        firstPlay.side === 'TOP' ? firstPlay.tile.bottom : firstPlay.tile.top,
      backNumber:
        lastPlay.side === 'BOTTOM' ? lastPlay.tile.top : lastPlay.tile.bottom,
    };
  },

  findHighestTile(hand: Hand): Tile {
    return hand.reduce((highest, current) =>
      current.top + current.bottom > highest.top + highest.bottom
        ? current
        : highest
    );
  },

  canPlayTile(tile: Tile, number: number): boolean {
    return tile.top === number || tile.bottom === number;
  },

  calculateTileScore(tile: Tile, playedNumbers: NumberCount): number {
    let score = tile.top + tile.bottom;
    // Prioritize doubles
    if (tile.top === tile.bottom) score += 10;
    // Adjust score based on how often the numbers have been played
    score -= (playedNumbers[tile.top] || 0) + (playedNumbers[tile.bottom] || 0);
    return score;
  },

  shouldPreferTop(currentBest: Play | null, newPlay: Play): boolean {
    // Prefer playing on the top side in case of a tie
    return currentBest === null || newPlay.side === 'TOP';
  },

  countPlayedNumbers(board: Play[]): NumberCount {
    return board.reduce((count, play) => {
      count[play.tile.top] = (count[play.tile.top] || 0) + 1;
      count[play.tile.bottom] = (count[play.tile.bottom] || 0) + 1;
      return count;
    }, {} as NumberCount);
  },

  findBestPlay(
    hand: Hand,
    headNumber: number,
    backNumber: number,
    playedNumbers: NumberCount,
    boardLength: number
  ): Play | null {
    return hand.reduce<{ bestPlay: Play | null; bestScore: number }>(
      (acc, tile) => {
        const score = this.calculateTileScore(tile, playedNumbers);
        // Try to play the tile on both ends of the board
        const topPlay = this.createPlay(tile, headNumber, boardLength);
        const bottomPlay = this.createPlay(tile, backNumber, boardLength);

        return this.updateBestPlay(acc, score, topPlay, bottomPlay);
      },
      { bestPlay: null, bestScore: -1 }
    ).bestPlay;
  },

  createPlay(tile: Tile, number: number, index: number): Play | null {
    // Check if the tile can be played
    if (!this.canPlayTile(tile, number)) {
      return null;
    }

    let tileSide: 'TOP' | 'BOTTOM';

    // Determine which side of the tile matches the board number
    if (tile.top === number) {
      tileSide = 'TOP';
    } else {
      tileSide = 'BOTTOM';
    }

    return { tile, side: tileSide, index };
  },

  updateBestPlay(
    acc: { bestPlay: Play | null; bestScore: number },
    score: number,
    topPlay: Play | null,
    bottomPlay: Play | null
  ): { bestPlay: Play | null; bestScore: number } {
    if (
      topPlay &&
      (score > acc.bestScore ||
        (score === acc.bestScore &&
          this.shouldPreferTop(acc.bestPlay, topPlay)))
    ) {
      return { bestPlay: topPlay, bestScore: score };
    }
    if (
      bottomPlay &&
      (score > acc.bestScore ||
        (score === acc.bestScore &&
          !this.shouldPreferTop(acc.bestPlay, bottomPlay)))
    ) {
      return { bestPlay: bottomPlay, bestScore: score };
    }
    return acc;
  },

  handleEndgame(
    hand: Hand,
    topNumber: number,
    bottomNumber: number,
    currentBestPlay: Play | null,
    index: number
  ): Play | null {
    // In the endgame, prioritize playing the highest value tile that can be played
    const highestPlayableTile = hand.reduce<{ tile: Tile | null; sum: number }>(
      (acc, tile) => {
        const sum = tile.top + tile.bottom;
        if (
          sum > acc.sum &&
          (this.canPlayTile(tile, topNumber) ||
            this.canPlayTile(tile, bottomNumber))
        ) {
          return { tile, sum };
        }
        return acc;
      },
      { tile: null, sum: -1 }
    ).tile;

    if (highestPlayableTile) {
      // Prefer playing on the top if possible
      if (this.canPlayTile(highestPlayableTile, topNumber)) {
        return this.createPlay(highestPlayableTile, topNumber, index);
      } else {
        return this.createPlay(highestPlayableTile, bottomNumber, index);
      }
    }

    return currentBestPlay;
  },
};
