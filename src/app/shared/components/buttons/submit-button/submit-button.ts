import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../button';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  selector: 'app-submit-button',
  templateUrl: './submit-button.html',
})
export class SubmitButtonComponent {
  @Input() label = 'Salvar';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() variant: 'primary' | 'secondary' = 'primary';
}