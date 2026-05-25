import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

export type ConfirmSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  standalone: true,
  imports: [DialogModule, ButtonModule],
})
export class ConfirmDialogComponent {
  visible       = model<boolean>(false);
  header        = input<string>('Confirmar acción');
  message       = input<string>('¿Estás seguro de continuar?');
  icon          = input<string>('pi pi-exclamation-triangle');
  confirmLabel  = input<string>('Confirmar');
  rejectLabel   = input<string>('Cancelar');
  confirmSeverity = input<ConfirmSeverity>('danger');

  readonly confirmed = output<void>();
  readonly rejected  = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
    this.visible.set(false);
  }

  onReject(): void {
    this.rejected.emit();
    this.visible.set(false);
  }
}
