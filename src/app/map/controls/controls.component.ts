import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface Controls {
  walkerCount: number;
  walkerSteps: number;
  cleanIterations: number;
  mapSize: number;
  tileSize: number;
  shadeRegions: boolean;
}

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.scss',
})
export class ControlsComponent {
  @Output() controlsUpdate = new EventEmitter<Controls>();
  @Output() shadeUpdate = new EventEmitter<boolean>();
  defaultControls = {
    walkerCount: 20,
    walkerSteps: 2000,
    cleanIterations: 5,
    mapSize: 200,
    tileSize: 4,
    shadeRegions: false,
  };
  controlsForm = new FormGroup({
    walkerCount: new FormControl(this.defaultControls.walkerCount, [
      Validators.required,
      Validators.min(0),
    ]),
    walkerSteps: new FormControl(this.defaultControls.walkerSteps, [
      Validators.required,
      Validators.min(0),
    ]),
    cleanIterations: new FormControl(this.defaultControls.cleanIterations, [
      Validators.required,
      Validators.min(0),
    ]),
    mapSize: new FormControl(this.defaultControls.mapSize, [
      Validators.required,
      Validators.min(0),
    ]),
    tileSize: new FormControl(this.defaultControls.tileSize, [
      Validators.required,
      Validators.min(0),
    ]),
    shadeRegions: new FormControl(this.defaultControls.shadeRegions, [
      Validators.required,
    ]),
  });

  emitControlUpdate() {
    const currentControls = {
      walkerCount: this.controlsForm.value.walkerCount ?? 5,
      walkerSteps: this.controlsForm.value.walkerSteps ?? 100,
      cleanIterations: this.controlsForm.value.cleanIterations ?? 5,
      mapSize: this.controlsForm.value.mapSize ?? 100,
      tileSize: this.controlsForm.value.tileSize ?? 4,
      shadeRegions: this.controlsForm.value.shadeRegions ?? false,
    };

    this.controlsUpdate.emit(currentControls);
  }

  emitShadeRegion() {
    this.shadeUpdate.emit(this.controlsForm.value.shadeRegions ?? false);
  }
}
