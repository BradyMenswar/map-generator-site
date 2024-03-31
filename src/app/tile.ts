export enum TileState {
  Empty,
  Wall,
  Floor,
}
export class Tile {
  public color: string;
  public state: TileState;

  constructor(color: string, state: TileState) {
    this.color = color;
    this.state = state;
  }
}
