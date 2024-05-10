import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
  selectedViewType: string = 'list';
  @Output() viewTypeChange = new EventEmitter<string>();

  constructor() {}

  onViewTypeChange() {
    this.viewTypeChange.emit(this.selectedViewType);
  }
}
