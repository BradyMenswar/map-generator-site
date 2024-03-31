import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Tile, TileState } from '../tile';
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

  private canvasContext!: CanvasRenderingContext2D;
  private walkerCount = 10;
  private walkerSteps = 1000;
  private cleanIterations = 5;

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
        map[row].push(new Tile('transparent', TileState.Empty));
      }
    }
    return map;
  }

  regenerateMap() {
    this.canvasContext.reset();
    const currentMap = this.initializeMap(this.mapSize);
    this.walk(this.walkerCount, this.walkerSteps, this.mapSize, currentMap);
    this.cleanInside(this.cleanIterations, currentMap);
    this.calculateWalls(currentMap);
    this.drawGrid(this.tileSize, currentMap);
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
        mapArray[currentLocation.x][currentLocation.y].color = '#ccc';
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
              mapArray[row][col].color = '#ccc';
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
              mapArray[newRow][newCol].color = '#000';
            }
          });
          if (
            row === mapArray.length - 1 ||
            col === mapArray.length - 1 ||
            row === 0 ||
            col === 0
          ) {
            mapArray[row][col].state = TileState.Wall;
            mapArray[row][col].color = '#000';
          }
        }
      }
    }
  }

  chooseDirection() {
    const range = 4;
    return Math.floor(Math.random() * range);
  }

  drawGrid(tileSize: number, mapArray: Tile[][]) {
    for (let row = 0; row < mapArray.length; row++) {
      for (let col = 0; col < mapArray[row].length; col++) {
        this.canvasContext.fillStyle = mapArray[row][col].color;
        this.canvasContext.fillRect(
          col * tileSize,
          row * tileSize,
          tileSize,
          tileSize
        );
      }
    }
  }

  onControlsUpdate(controls: Controls) {
    this.walkerCount = controls.walkerCount;
    this.walkerSteps = controls.walkerSteps;
    this.cleanIterations = controls.cleanIterations;
    this.mapSize = controls.mapSize;
    this.tileSize = controls.tileSize;

    this.regenerateMap();
  }
}
