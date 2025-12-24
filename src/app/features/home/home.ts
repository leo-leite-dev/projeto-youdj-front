import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/buttons/button';
import { LoginModalComponent } from '../../core/auth/login-modal/login-modal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    LoginModalComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent {

  private readonly router = inject(Router);

  showLoginModal = false;

  openLoginModal(): void {
    this.showLoginModal = true;
  }

  onLoginSuccess(): void {
    this.showLoginModal = false;
    this.router.navigate(['/app']);
  }

  onContinue(): void {
    this.router.navigate(['/music']);
  }
}