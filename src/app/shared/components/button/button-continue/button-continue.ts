import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonComponent } from '../button';

@Component({
  selector: 'app-button-continue',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './button-continue.html',
})
export class ButtonContinueComponent {

  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.clicked.emit(event);
  }
}