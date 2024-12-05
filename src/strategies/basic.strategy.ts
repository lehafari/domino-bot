import type { BoardState, DominoStrategy, Hand, Play, Tile } from '../types';

type NumberCount = Record<number, number>;

export const basicStrategy: DominoStrategy = {
  makeMove(hand: Hand, boardState: BoardState, playerId: number): Play | null {
    const board = boardState.plays;

    if (board.length === 0) {
      return this.playFirstTile(hand);
    }

    const { headNumber, backNumber } = this.findAvailableSides(board);
    console.log('Available sides:', { headNumber, backNumber });

    const playedNumbers = this.countPlayedNumbers(board);

    // En endgame, priorizar dobles y coincidencias directas
    if (hand.length <= 3) {
      const endgamePlay = this.handleEndgame(
        hand,
        headNumber,
        backNumber,
        null,
        board.length
      );
      if (endgamePlay) return endgamePlay;
    }

    // Buscar dobles que coincidan directamente
    const matchingDoubles = hand.filter(
      (tile) =>
        tile.top === tile.bottom &&
        (tile.top === headNumber || tile.top === backNumber)
    );

    console.log(matchingDoubles);

    if (matchingDoubles.length > 0) {
      const bestDouble = matchingDoubles.reduce((a, b) =>
        a.top > b.top ? a : b
      );
      return {
        tile: bestDouble,
        side: 'TOP',
        index: board.length,
      };
    }

    // Si no hay dobles coincidentes, buscar la mejor jugada
    return this.findBestPlay(
      hand,
      headNumber,
      backNumber,
      playedNumbers,
      board.length
    );
  },

  playFirstTile(hand: Hand): Play {
    const highestTile = this.findHighestTile(hand);
    return { tile: highestTile, side: 'CENTER', index: 0 };
  },
  findAvailableSides(board: Play[]): {
    headNumber: number;
    backNumber: number;
  } {
    const firstPlay = board[0];
    const lastPlay = board[board.length - 1];

    // Para el primer extremo (firstPlay):
    const headNumber =
      firstPlay.side === 'BOTTOM' ? firstPlay.tile.top : firstPlay.tile.bottom;

    // Para el último extremo (lastPlay):
    const backNumber =
      lastPlay.side === 'TOP' ? lastPlay.tile.bottom : lastPlay.tile.top;

    return { headNumber, backNumber };
  },

  findHighestTile(hand: Hand): Tile {
    return hand.reduce((highest, current) =>
      current.top + current.bottom > highest.top + highest.bottom
        ? current
        : highest
    );
  },

  canPlayTile(tile: Tile, number: number): boolean {
    return (
      tile.top === number ||
      tile.bottom === number ||
      tile.top === 0 ||
      tile.bottom === 0
    );
  },

  calculateTileScore(tile: Tile, playedNumbers: NumberCount): number {
    let score = tile.top + tile.bottom;

    if (tile.top === tile.bottom) {
      score += 100000;
    }

    const topPlayed = playedNumbers[tile.top] || 0;
    const bottomPlayed = playedNumbers[tile.bottom] || 0;
    score -= topPlayed + bottomPlayed;

    return score;
  },

  shouldPreferTop(currentBest: Play | null, newPlay: Play): boolean {
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
    let bestPlay: Play | null = null;
    let bestScore = -Infinity;

    hand.forEach((tile) => {
      const score = this.calculateTileScore(tile, playedNumbers);

      if (tile.top === headNumber || tile.bottom === headNumber) {
        const topPlay = {
          tile,
          side: tile.top === headNumber ? 'TOP' : 'BOTTOM',
          index: boardLength,
        } as const;
        if (score >= bestScore) {
          bestPlay = topPlay;
          bestScore = score;
        }
      }

      if (tile.top === backNumber || tile.bottom === backNumber) {
        const bottomPlay = {
          tile,
          side: tile.top === backNumber ? 'TOP' : 'BOTTOM',
          index: boardLength,
        } as const;
        if (score > bestScore) {
          bestPlay = bottomPlay;
          bestScore = score;
        }
      }
    });

    return bestPlay;
  },

  createPlay(tile: Tile, number: number, index: number): Play | null {
    if (!this.canPlayTile(tile, number)) {
      return null;
    }

    // El side indica el lado por el que conectamos con el número disponible
    return {
      tile,
      side: tile.top === number ? 'TOP' : 'BOTTOM',
      index,
    };
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
    headNumber: number,
    backNumber: number,
    currentBestPlay: Play | null,
    index: number
  ): Play | null {
    // Primero, intentar jugar un doble que coincida
    const matchingDouble = hand.find(
      (tile) =>
        tile.top === tile.bottom &&
        (tile.top === headNumber || tile.top === backNumber)
    );

    if (matchingDouble) {
      return {
        tile: matchingDouble,
        // Para un doble no importa el lado ya que ambos números son iguales
        side: 'TOP',
        index,
      };
    }

    // Si no hay dobles, buscar coincidencia directa con los números disponibles
    const playableTiles = hand.filter(
      (tile) =>
        tile.top === headNumber ||
        tile.bottom === headNumber ||
        tile.top === backNumber ||
        tile.bottom === backNumber
    );

    if (playableTiles.length > 0) {
      // Ordenar por valor total descendente
      const bestTile = playableTiles.reduce((a, b) =>
        a.top + a.bottom > b.top + b.bottom ? a : b
      );

      // Preferir jugar por el headNumber si es posible
      if (bestTile.top === headNumber || bestTile.bottom === headNumber) {
        return {
          tile: bestTile,
          side: bestTile.top === headNumber ? 'TOP' : 'BOTTOM',
          index,
        };
      } else {
        return {
          tile: bestTile,
          side: bestTile.top === backNumber ? 'TOP' : 'BOTTOM',
          index,
        };
      }
    }

    return null;
  },
};
