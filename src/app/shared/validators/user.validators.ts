import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Rechaza strings que solo contienen espacios en blanco.
 * Útil en campos como first_name / last_name.
 *
 * @example
 * first_name: ['', [Validators.required, noWhitespaceValidator]]
 */
export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  return value.length > 0 && value.trim().length === 0
    ? { whitespace: true }
    : null;
}

/**
 * Rechaza dominios de correo gratuitos (Gmail, Hotmail, Yahoo, Outlook).
 * Se puede ampliar la lista según la política de la organización.
 *
 * @example
 * email: ['', [Validators.required, Validators.email, corporateEmailValidator]]
 */
export function corporateEmailValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = (control.value ?? '').toLowerCase();
  if (!value.includes('@')) return null; // el error de formato lo maneja Validators.email

  const FREE_MAIL_DOMAINS = new Set([
    'gmail.com', 'googlemail.com',
    'hotmail.com', 'hotmail.es',
    'outlook.com', 'outlook.es',
    'yahoo.com',  'yahoo.es',
    'live.com',   'live.es',
    'icloud.com',
  ]);

  const domain = value.split('@')[1];
  return FREE_MAIL_DOMAINS.has(domain)
    ? { corporateEmail: { domain } }
    : null;
}
