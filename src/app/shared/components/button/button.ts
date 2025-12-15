import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'continue' | 'ghost';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {

  @Input() label = 'Continuar';
  @Input() variant: ButtonVariant = 'continue';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() clicked = new EventEmitter<MouseEvent>();

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  onClick(event: MouseEvent): void {
    if (this.isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.clicked.emit(event);
  }
}