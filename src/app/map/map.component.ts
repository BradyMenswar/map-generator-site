import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Tile, TileRegion, TileState } from '../tile';
import { Location } from '../location';
import { Controls, ControlsComponent } from './controls/controls.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [ControlsComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map') mapCanvas!: ElementRef<HTMLCanvasElement>;
  tileSize = 2;
  mapSize = 500;
  currentMap: Tile[][] = [];

  private canvasContext!: CanvasRenderingContext2D;
  private walkerCount = 10;
  private walkerSteps = 1000;
  private cleanIterations = 5;
  private shadeRegions = false;

  ngAfterViewInit(): void {
    const context = this.mapCanvas.nativeElement.getContext('2d');
    if (context) {
      this.canvasContext = context;
    }
  }

  initializeMap(mapSize: number) {
    const map: Tile[][] = [];
    for (let row = 0; row < mapSize; row++) {
      map.push([]);
      for (let col = 0; col < mapSize; col++) {
        map[row].push(
          new Tile(
            'transparent',
            'transparent',
            TileState.Empty,
            TileRegion.Open
          )
        );
      }
    }
    return map;
  }

  regenerateMap() {
    this.canvasContext.reset();
    this.currentMap = this.initializeMap(this.mapSize);
    this.walk(
      this.walkerCount,
      this.walkerSteps,
      this.mapSize,
      this.currentMap
    );
    this.cleanInside(this.cleanIterations, this.currentMap);
    this.calculateWalls(this.currentMap);
    this.floodFill(this.currentMap, '#FF0000', TileRegion.Cave, 0);
    this.floodFill(this.currentMap, '#0000FF', TileRegion.Intermediate, 4);
    this.floodFill(this.currentMap, '#00FF00', TileRegion.Open, 20);
    this.drawGrid(this.tileSize, this.currentMap, this.shadeRegions);
  }

  walk(
    walkerCount: number,
    walkerSteps: number,
    mapSize: number,
    mapArray: Tile[][]
  ) {
    for (let iteration = 0; iteration < walkerCount; iteration++) {
      const currentLocation = new Location(mapSize / 2, mapSize / 2);
      let direction;
      for (let step = 0; step < walkerSteps; step++) {
        direction = this.chooseDirection();
        switch (direction) {
          case 0:
            if (currentLocation.x < mapSize - 1) currentLocation.x += 1;
            break;
          case 1:
            if (currentLocation.y < mapSize - 1) currentLocation.y += 1;
            break;
          case 2:
            if (currentLocation.x > 0) currentLocation.x -= 1;
            break;
          case 3:
            if (currentLocation.y > 0) currentLocation.y -= 1;
            break;
          default:
            console.error('Invalid direction.');
            break;
        }
        mapArray[currentLocation.x][currentLocation.y].stateColor = '#ccc';
        mapArray[currentLocation.x][currentLocation.y].state = TileState.Floor;
      }
    }
  }

  cleanInside(cleanIterations: number, mapArray: Tile[][]) {
    for (let iteration = 0; iteration < cleanIterations; iteration++) {
      for (let row = 0; row < mapArray.length; row++) {
        for (let col = 0; col < mapArray[row].length; col++) {
          let surroundedByFloor = true;
          if (mapArray[row][col].state === TileState.Empty) {
            const directions = [
              [1, 0],
              [-1, 0],
              [0, 1],
              [0, -1],
            ];
            directions.forEach(([directionX, directionY]) => {
              const newRow = row + directionX;
              const newCol = col + directionY;
              if (
                newRow < 0 ||
                newRow >= mapArray.length ||
                newCol < 0 ||
                newCol >= mapArray.length ||
                mapArray[newRow][newCol].state !== TileState.Floor
              ) {
                surroundedByFloor = false;
              }
            });
            if (surroundedByFloor) {
              mapArray[row][col].state = TileState.Floor;
              mapArray[row][col].stateColor = '#ccc';
            }
          }
        }
      }
    }
  }

  calculateWalls(mapArray: Tile[][]) {
    for (let row = 0; row < mapArray.length; row++) {
      for (let col = 0; col < mapArray[row].length; col++) {
        if (mapArray[row][col].state === TileState.Floor) {
          const directions = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ];
          directions.forEach(([directionX, directionY]) => {
            const newRow = row + directionX;
            const newCol = col + directionY;
            if (
              newRow >= 0 &&
              newRow < mapArray.length &&
              newCol >= 0 &&
              newCol < mapArray.length &&
              mapArray[newRow][newCol].state === TileState.Empty
            ) {
              mapArray[newRow][newCol].state = TileState.Wall;
              mapArray[newRow][newCol].stateColor = '#000';
              mapArray[newRow][newCol].regionColor = '#000';
            }
          });
          if (
            row === mapArray.length - 1 ||
            col === mapArray.length - 1 ||
            row === 0 ||
            col === 0
          ) {
            mapArray[row][col].state = TileState.Wall;
            mapArray[row][col].stateColor = '#000';
            mapArray[row][col].regionColor = '#000';
          }
        }
      }
    }
  }

  chooseDirection() {
    const range = 4;
    return Math.floor(Math.random() * range);
  }

  drawGrid(tileSize: number, mapArray: Tile[][], shadeRegions: boolean) {
    for (let row = 0; row < mapArray.length; row++) {
      for (let col = 0; col < mapArray[row].length; col++) {
        if (shadeRegions)
          this.canvasContext.fillStyle = mapArray[row][col].regionColor;
        else this.canvasContext.fillStyle = mapArray[row][col].stateColor;
        this.canvasContext.fillRect(
          col * tileSize,
          row * tileSize,
          tileSize,
          tileSize
        );
      }
    }
  }

  floodFill(
    mapArray: Tile[][],
    newColor: string,
    newRegion: TileRegion,
    tolerance: number
  ) {
    const startLocation = new Location(
      mapArray.length / 2,
      mapArray.length / 2
    );

    const currentColor = mapArray[startLocation.x][startLocation.y].regionColor;
    if (currentColor === newColor) return;

    const rows = mapArray.length;
    const cols = mapArray[0].length;
    const queue: Location[] = [startLocation];

    while (queue.length > 0) {
      const currentLocation = queue.shift()!;

      if (
        currentLocation.x >= 0 &&
        currentLocation.x < rows &&
        currentLocation.y >= 0 &&
        currentLocation.y < cols &&
        mapArray[currentLocation.x][currentLocation.y].regionColor ===
          currentColor &&
        mapArray[currentLocation.x][currentLocation.y].state ===
          TileState.Floor &&
        this.getDistanceToWall(mapArray, currentLocation) > tolerance
      ) {
        mapArray[currentLocation.x][currentLocation.y].regionColor = newColor;
        mapArray[currentLocation.x][currentLocation.y].region = newRegion;
        queue.push(new Location(currentLocation.x - 1, currentLocation.y));
        queue.push(new Location(currentLocation.x + 1, currentLocation.y));
        queue.push(new Location(currentLocation.x, currentLocation.y - 1));
        queue.push(new Location(currentLocation.x, currentLocation.y + 1));
      }
    }
  }

  getDistanceToWall(mapArray: Tile[][], startLocation: Location) {
    if (mapArray[startLocation.x][startLocation.y].state !== TileState.Floor)
      return 0;

    const queue: Location[] = [startLocation];
    let offset = 1;
    let counter = 0;
    while (queue.length > 0) {
      const currentLocation = queue.shift()!;
      counter += 1;
      if (counter % 4 === 0) offset += 1;
      if (
        mapArray[currentLocation.x][currentLocation.y].state === TileState.Wall
      ) {
        break;
      }

      queue.push(new Location(currentLocation.x, currentLocation.y - offset));
      queue.push(new Location(currentLocation.x + offset, currentLocation.y));
      queue.push(new Location(currentLocation.x, currentLocation.y + offset));
      queue.push(new Location(currentLocation.x - offset, currentLocation.y));
    }

    return offset;
  }

  onControlsUpdate(controls: Controls) {
    this.walkerCount = controls.walkerCount;
    this.walkerSteps = controls.walkerSteps;
    this.cleanIterations = controls.cleanIterations;
    this.mapSize = controls.mapSize;
    this.tileSize = controls.tileSize;
    this.shadeRegions = controls.shadeRegions;

    this.regenerateMap();
  }

  onShadeUpdate(shadeRegions: boolean) {
    this.shadeRegions = shadeRegions;
    this.drawGrid(this.tileSize, this.currentMap, shadeRegions);
  }
}
