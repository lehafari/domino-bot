import { basicStrategy } from '../strategies';
import { Hand, BoardState, Play, Tile } from '../types';

describe('basicStrategy', () => {
  const createTile = (top: number, bottom: number): Tile => ({ top, bottom });

  const createPlay = (
    top: number,
    bottom: number,
    side: 'TOP' | 'BOTTOM',
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
        createPlay(6, 4, 'TOP', 2),
        createPlay(6, 6, 'TOP', 0),
        createPlay(6, 5, 'BOTTOM', 1),
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
      side: 'TOP',
      index: 0,
    });
  });

  test('should play matching tile on non-empty board', () => {
    const hand: Hand = [createTile(6, 5), createTile(4, 3), createTile(2, 1)];
    const boardState: BoardState = {
      plays: [createPlay(6, 6, 'TOP', 0)],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);

    expect(result).toEqual({
      tile: { top: 6, bottom: 5 },
      side: 'TOP',
      index: 1,
    });
  });

  test('should prefer doubles', () => {
    const hand: Hand = [createTile(5, 5), createTile(6, 4), createTile(3, 3)];
    const boardState: BoardState = {
      plays: [createPlay(6, 6, 'TOP', 0), createPlay(6, 5, 'TOP', 1)],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);

    expect(result).toEqual({
      tile: { top: 5, bottom: 5 },
      side: 'TOP',
      index: 2,
    });
  });

  test('should play on top side in case of tie', () => {
    const hand: Hand = [createTile(4, 3), createTile(2, 1)];
    const boardState: BoardState = {
      plays: [createPlay(4, 4, 'TOP', 0), createPlay(4, 5, 'BOTTOM', 1)],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);
    expect(result).toEqual({
      tile: { top: 4, bottom: 3 },
      side: 'TOP',
      index: 2,
    });
  });

  test('should handle endgame scenario', () => {
    const hand: Hand = [createTile(1, 1), createTile(2, 2), createTile(3, 3)];
    const boardState: BoardState = {
      plays: [
        createPlay(6, 1, 'TOP', 0),
        createPlay(6, 6, 'TOP', 1),
        createPlay(6, 5, 'TOP', 2),
        createPlay(5, 4, 'TOP', 3),
        createPlay(4, 3, 'TOP', 4),
      ],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);

    expect(result).toEqual({
      tile: { top: 3, bottom: 3 },
      side: 'TOP',
      index: 5,
    });
  });

  test('should return null when no move is possible', () => {
    const hand: Hand = [createTile(1, 1), createTile(2, 2)];
    const boardState: BoardState = {
      plays: [createPlay(6, 6, 'TOP', 0), createPlay(6, 5, 'BOTTOM', 1)],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);
    expect(result).toBeNull();
  });

  test('should consider played numbers', () => {
    const hand: Hand = [createTile(4, 3), createTile(3, 2), createTile(1, 1)];
    const boardState: BoardState = {
      plays: [
        createPlay(6, 6, 'TOP', 0),
        createPlay(6, 5, 'TOP', 1),
        createPlay(5, 5, 'TOP', 2),
        createPlay(5, 4, 'TOP', 3),
      ],
      passed: [],
    };
    const result = basicStrategy.makeMove(hand, boardState, 0);

    expect(result).toEqual({
      tile: { top: 4, bottom: 3 },
      side: 'TOP',
      index: 4,
    });
  });
});
