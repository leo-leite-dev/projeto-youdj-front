import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

type MsgMap = Partial<Record<string, string>>;

@Component({
  selector: 'app-field-errors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-errors.component.html',
  styleUrls: ['./field-errors.component.scss']
})
export class FieldErrorsComponent {
  @Input() control: AbstractControl | null = null;
  @Input() label = 'Campo';

  @Input() messages: MsgMap = {
    required: 'Este campo é obrigatório.',
    email: 'Digite um e-mail válido.',
    minlength: 'Tamanho mínimo não atingido.',
    maxlength: 'Tamanho máximo excedido.',
    pattern: 'Formato inválido.',
    mustMatch: 'As senhas não conferem.',
    server: 'Erro vindo do servidor.'
  };

  get visible(): boolean {
    const c = this.control;
    return !!c && c.invalid && c.touched && !c.pending;
  }

  get errorList(): string[] {
    if (!this.control?.errors) return [];
    const errs: ValidationErrors = this.control.errors;
    const list: string[] = [];

    for (const key of Object.keys(errs)) {
      const err = errs[key];

      if (key === 'minlength' && err?.requiredLength) {
        list.push(`Mínimo de ${err.requiredLength} caracteres.`);
        continue;
      }
      if (key === 'maxlength' && err?.requiredLength) {
        list.push(`Máximo de ${err.requiredLength} caracteres.`);
        continue;
      }
      if (key === 'server' && typeof err === 'string') {
        list.push(err);
        continue;
      }

      if (key === 'passwordStrength' && err) {
        const missing: string[] = [];
        if (!err.hasMinLen)
          missing.push(`mínimo de ${err.minLen} caracteres`);

        if (!err.hasUpper)
          missing.push('letra maiúscula');

        if (!err.hasLower)
          missing.push('letra minúscula');

        if (!err.hasDigit)
          missing.push('número');

        if (!err.hasSpecial)
          missing.push('símbolo');

        if (missing.length)
          list.push(`A senha precisa de: ${missing.join(', ')}.`);
        else
          list.push(this.messages[key] ?? 'Senha fraca.');

        continue;
      }

      list.push(this.messages[key] ?? `${this.label} inválido.`);
    }
    return list;
  }
}