import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-fa-icon',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './fa-icon.component.html',
})
export class FaIconComponent {
  @Input({ required: true }) icon!: IconDefinition;
  @Input() className = '';
  @Input() spin = false;
  @Input() size?: 'xs' | 'sm' | 'lg' | '1x' | '2x' | '3x';
}
