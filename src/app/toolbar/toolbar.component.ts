import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
  selectedViewType: string = 'grid'; //default value to keep button pressed on load
  @Output() viewTypeChange = new EventEmitter<string>();

  constructor() {}

  // emit the changed value when the button is clicked
  onViewTypeChange() {
    this.viewTypeChange.emit(this.selectedViewType);
  }
}
