import type { BoardState, Hand, Play, Strategy, Tile } from '../types';

export const basicStrategy: Strategy = {
  makeMove(hand: Hand, boardState: BoardState, playerId: number): Play | null {
    const board = boardState.plays;

    // Si el tablero está vacío, selecciona la ficha más alta para jugar primero
    if (board.length === 0) {
      const highestTile = this.findHighestTile(hand);
      return { tile: highestTile, side: 'top', index: 0 };
    }

    // Determinar los números disponibles en los extremos del tablero
    const { topNumber, bottomNumber } = this.findAvailableSides(board);

    let bestPlay: Play | null = null;
    let bestScore = -1;

    // Conteo básico de fichas jugadas
    const playedNumbers = this.countPlayedNumbers(board);

    // Iteración sobre la mano

    for (const tile of hand) {
      const score = this.calculateTileScore(tile, playedNumbers);

      if (tile.top === topNumber || tile.bottom === topNumber) {
        const side = tile.top === topNumber ? 'top' : 'bottom';
        const potentialPlay = { tile, side, index: board.length } as Play;
        if (
          score > bestScore ||
          (score === bestScore && this.shouldPreferTop(bestPlay, potentialPlay))
        ) {
          bestPlay = potentialPlay;
          bestScore = score;
        }
      }

      if (tile.top === bottomNumber || tile.bottom === bottomNumber) {
        const side = tile.top === bottomNumber ? 'top' : 'bottom';

        const potentialPlay = { tile, side, index: board.length } as Play;
        if (
          score > bestScore ||
          (score === bestScore &&
            !this.shouldPreferTop(bestPlay, potentialPlay))
        ) {
          bestPlay = potentialPlay;
          bestScore = score;
        }
      }
    }

    // Manejo de finales de juego
    if (hand.length <= 3) {
      bestPlay = this.handleEndgame(
        hand,
        topNumber,
        bottomNumber,
        bestPlay,
        board.length
      );
    }

    return bestPlay;
  },

  findAvailableSides(board: Play[]): {
    topNumber: number;
    bottomNumber: number;
  } {
    const firstPlay = board[0];
    const lastPlay = board[board.length - 1];

    return {
      topNumber:
        firstPlay.side === 'top' ? firstPlay.tile.bottom : firstPlay.tile.top,
      bottomNumber:
        lastPlay.side === 'bottom' ? lastPlay.tile.top : lastPlay.tile.bottom,
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

  calculateTileScore(
    tile: Tile,
    playedNumbers: Record<number, number>
  ): number {
    let score = tile.top + tile.bottom;

    // Priorizar fichas dobles
    if (tile.top === tile.bottom) {
      score += 10;
    }

    // Ajustar score basado en la frecuencia de los números jugados
    score -= (playedNumbers[tile.top] || 0) + (playedNumbers[tile.bottom] || 0);

    return score;
  },

  shouldPreferTop(currentBest: Play | null, newPlay: Play): boolean {
    // Preferir jugar en el extremo superior en caso de empate

    return currentBest === null || newPlay.side === 'top';
  },

  countPlayedNumbers(board: Play[]): Record<number, number> {
    const count: Record<number, number> = {};
    for (const play of board) {
      count[play.tile.top] = (count[play.tile.top] || 0) + 1;
      count[play.tile.bottom] = (count[play.tile.bottom] || 0) + 1;
    }
    return count;
  },

  handleEndgame(
    hand: Hand,
    topNumber: number,
    bottomNumber: number,
    currentBestPlay: Play | null,
    index: number
  ): Play | null {
    // En el final del juego, priorizar jugar la ficha más alta que sea posible
    let highestPlayableTile = null;
    let highestSum = -1;

    for (const tile of hand) {
      const sum = tile.top + tile.bottom;
      if (
        sum > highestSum &&
        (this.canPlayTile(tile, topNumber) ||
          this.canPlayTile(tile, bottomNumber))
      ) {
        highestPlayableTile = tile;
        highestSum = sum;
      }
    }

    if (
      highestPlayableTile &&
      this.canPlayTile(highestPlayableTile, topNumber)
    ) {
      const side = highestPlayableTile.top === topNumber ? 'top' : 'bottom';
      return { tile: highestPlayableTile, side, index };
    }

    return currentBestPlay;
  },
};
