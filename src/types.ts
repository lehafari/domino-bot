export type Tile = {
  top: number;
  bottom: number;
};

export type Play = {
  tile: Tile;
  index: number;
  side: 'TOP' | 'BOTTOM' | 'CENTER';
};

export type Hand = Tile[];

export type BoardState = {
  plays: Play[];
  passed: number[];
};

export type NumberCount = Record<number, number>;

export interface DominoStrategy {
  makeMove(hand: Hand, boardState: BoardState, playerId: number): Play | null;

  findAvailableSides(board: Play[]): {
    headNumber: number;
    backNumber: number;
  };

  findHighestTile(hand: Hand): Tile;

  canPlayTile(tile: Tile, number: number): boolean;

  calculateTileScore(tile: Tile, playedNumbers: NumberCount): number;

  countPlayedNumbers(board: Play[]): NumberCount;

  handleEndgame(
    hand: Hand,
    topNumber: number,
    bottomNumber: number,
    currentBestPlay: Play | null,
    index: number
  ): Play | null;

  playFirstTile(hand: Hand): Play;

  findBestPlay(
    hand: Hand,
    topNumber: number,
    bottomNumber: number,
    playedNumbers: NumberCount,
    boardLength: number
  ): Play | null;

  createPlay(tile: Tile, number: number, index: number): Play | null;

  updateBestPlay(
    acc: { bestPlay: Play | null; bestScore: number },
    score: number,
    topPlay: Play | null,
    bottomPlay: Play | null
  ): { bestPlay: Play | null; bestScore: number };

  shouldPreferTop(currentBest: Play | null, newPlay: Play): boolean;
}
