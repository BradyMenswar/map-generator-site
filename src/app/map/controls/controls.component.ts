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

export interface Controls {
  walkerCount: number;
  walkerSteps: number;
  cleanIterations: number;
  mapSize: number;
  tileSize: number;
}

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.scss',
})
export class ControlsComponent {
  @Output() controlsUpdate = new EventEmitter<Controls>();
  defaultControls = {
    walkerCount: 10,
    walkerSteps: 1000,
    cleanIterations: 5,
    mapSize: 200,
    tileSize: 4,
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
  });

  emitControlUpdate() {
    const currentControls = {
      walkerCount: this.controlsForm.value.walkerCount || 5,
      walkerSteps: this.controlsForm.value.walkerSteps || 100,
      cleanIterations: this.controlsForm.value.cleanIterations || 5,
      mapSize: this.controlsForm.value.mapSize || 100,
      tileSize: this.controlsForm.value.tileSize || 4,
    };

    this.controlsUpdate.emit(currentControls);
  }
}
