export enum TileState {
  Empty,
  Wall,
  Floor,
}
export enum TileRegion {
  Cave,
  Intermediate,
  Open,
}
export class Tile {
  public stateColor: string;
  public regionColor: string;
  public state: TileState;
  public region: TileRegion;

  constructor(
    stateColor: string,
    regionColor: string,
    state: TileState,
    region: TileRegion
  ) {
    this.stateColor = stateColor;
    this.regionColor = regionColor;
    this.state = state;
    this.region = region;
  }
}
