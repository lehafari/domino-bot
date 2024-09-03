import { basicStrategy } from '../strategies';
import { Hand, BoardState, Play, Tile } from '../types';

describe('basicStrategy', () => {
  // Función auxiliar para crear una ficha
  const createTile = (top: number, bottom: number): Tile => ({ top, bottom });

  // Función auxiliar para crear una jugada
  const createPlay = (
    top: number,
    bottom: number,
    side: 'top' | 'bottom',
    index: number
  ): Play => ({
    tile: createTile(top, bottom),
    side,
    index,
  });

  test('test', () => {
    const hand: Hand = [createTile(1, 1), createTile(2, 2), createTile(3, 4)];
    const boardState: BoardState = {
      plays: [
        createPlay(6, 4, 'top', 2),
        createPlay(6, 6, 'top', 0),
        createPlay(6, 5, 'bottom', 1),
      ],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);
    expect(result).toBeDefined();
  });

  test('should play highest tile when board is empty', () => {
    const hand: Hand = [createTile(6, 6), createTile(4, 5), createTile(3, 2)];
    const boardState: BoardState = { plays: [], passed: [] };
    const result = basicStrategy.makeMove(hand, boardState, 0);
    expect(result).toEqual({
      tile: { top: 6, bottom: 6 },
      side: 'top',
      index: 0,
    });
  });

  test('should play matching tile on non-empty board', () => {
    const hand: Hand = [createTile(6, 5), createTile(4, 3), createTile(2, 1)];
    const boardState: BoardState = {
      plays: [createPlay(6, 6, 'top', 0)],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);

    expect(result).toEqual({
      tile: { top: 6, bottom: 5 },
      side: 'top',
      index: 1,
    });
  });

  test('should prefer doubles', () => {
    const hand: Hand = [createTile(5, 5), createTile(6, 4), createTile(3, 3)];
    const boardState: BoardState = {
      plays: [createPlay(6, 6, 'top', 0), createPlay(6, 5, 'top', 1)],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);

    expect(result).toEqual({
      tile: { top: 5, bottom: 5 },
      side: 'top',
      index: 2,
    });
  });

  test('should play on top side in case of tie', () => {
    const hand: Hand = [createTile(4, 3), createTile(2, 1)];
    const boardState: BoardState = {
      plays: [createPlay(4, 4, 'top', 0), createPlay(4, 5, 'bottom', 1)],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);
    expect(result).toEqual({
      tile: { top: 4, bottom: 3 },
      side: 'top',
      index: 2,
    });
  });

  test('should handle endgame scenario', () => {
    const hand: Hand = [createTile(1, 1), createTile(2, 2), createTile(3, 3)];
    const boardState: BoardState = {
      plays: [
        createPlay(6, 6, 'top', 0),
        createPlay(6, 5, 'top', 1),
        createPlay(5, 4, 'top', 2),
        createPlay(4, 3, 'top', 3),
      ],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);

    expect(result).toEqual({
      tile: { top: 3, bottom: 3 },
      side: 'top',
      index: 4,
    });
  });

  test('should return null when no move is possible', () => {
    const hand: Hand = [createTile(1, 1), createTile(2, 2)];
    const boardState: BoardState = {
      plays: [createPlay(6, 6, 'top', 0), createPlay(6, 5, 'bottom', 1)],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);
    expect(result).toBeNull();
  });

  test('should consider played numbers', () => {
    const hand: Hand = [createTile(4, 3), createTile(3, 2), createTile(1, 1)];
    const boardState: BoardState = {
      plays: [
        createPlay(6, 6, 'top', 0),
        createPlay(6, 5, 'top', 1),
        createPlay(5, 5, 'top', 2),
        createPlay(5, 4, 'top', 3),
      ],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);

    expect(result).toEqual({
      tile: { top: 4, bottom: 3 },
      side: 'top',
      index: 4,
    });
  });
});
