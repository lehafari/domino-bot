export type Tile = {
  top: number;
  bottom: number;
};

export type Play = {
  tile: Tile;
  side: 'top' | 'bottom';
  index: number;
};

export type Hand = Tile[];

export type BoardState = {
  plays: Play[];
  passed: number[];
};

export interface Strategy {
  makeMove(hand: Hand, boardState: BoardState, playerId: number): Play | null;

  findAvailableSides(board: Play[]): {
    topNumber: number;
    bottomNumber: number;
  };
  findHighestTile(hand: Hand): Tile;
  canPlayTile(tile: Tile, number: number): boolean;
  calculateTileScore(tile: Tile, playedNumbers: Record<number, number>): number;
  shouldPreferTop(currentBest: Play | null, newPlay: Play): boolean;
  countPlayedNumbers(board: Play[]): Record<number, number>;
  handleEndgame(
    hand: Hand,
    topNumber: number,
    bottomNumber: number,
    currentBestPlay: Play | null,
    index: number
  ): Play | null;
}
