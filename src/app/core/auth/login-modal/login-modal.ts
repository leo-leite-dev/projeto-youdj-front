import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../shared/components/inputs/input/input';
import { FaIconComponent } from '../../../shared/components/icons/fa-icon.component';
import { FieldErrorsComponent } from '../../../shared/components/field-errors/field-errors.component';
import { SubmitButtonComponent } from '../../../shared/components/buttons/submit-button/submit-button';
import { LoginResponse } from '../contracts/login-response.model';
import { AuthService } from '../services/auth.service';
import { extractErrorMessage } from '../../../shared/utils/error.util';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    FaIconComponent,
    FieldErrorsComponent,
    SubmitButtonComponent
  ],
  templateUrl: './login-modal.html',
  styleUrls: ['./login-modal.scss']
})
export class LoginModalComponent {

  @Output() close = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<LoginResponse>();

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form = this.fb.group({
    identify: ['', Validators.required],
    password: ['', Validators.required],
  });

  loading = false;
  errorMessage: string | null = null;

  onSubmit(): void {
    if (this.form.invalid || this.loading)
       return;

    this.errorMessage = null;
    this.loading = true;
    this.form.disable();

    const payload = {
      identify: this.form.value.identify!,
      password: this.form.value.password!,
    };

    this.auth.loginDj(payload)
      .pipe(
        catchError(err => {
          this.errorMessage =
            extractErrorMessage(err) ?? 'Falha ao autenticar.';
          return of<LoginResponse | null>(null);
        }),
        finalize(() => {
          this.loading = false;
          this.form.enable();
        })
      )
      .subscribe(result => {
        if (!result || !result.djId) {
          this.errorMessage = 'Credenciais inválidas.';
          return;
        }

        this.loggedIn.emit(result);

        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigate([redirect ?? '/music-control-panel']);

        this.close.emit();
      });
  }

  navigateToRegister(event: Event): void {
    event.preventDefault();
    this.close.emit();
  }
}