import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent {

  constructor(private router: Router) { }

  onContinue(): void {
    console.log('Continue clicked');
    this.router.navigate(['/music']);
  }
}