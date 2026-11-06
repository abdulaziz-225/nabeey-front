import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
  icon: string;
  tone: 'danger' | 'primary';
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="dlg">
      <div class="dlg-head">
        <div class="dlg-icon" [ngClass]="data.tone === 'danger' ? 'red' : 'blue'"><mat-icon>{{ data.icon }}</mat-icon></div>
        <div>
          <h2>{{ data.title }}</h2>
          <p class="muted" [innerHTML]="data.message"></p>
        </div>
      </div>
      <div class="dlg-actions">
        <button class="btn-secondary" [mat-dialog-close]="false">Bekor qilish</button>
        <button [ngClass]="data.tone === 'danger' ? 'btn-danger' : 'btn-primary'" [mat-dialog-close]="true" cdkFocusInitial>
          {{ data.confirmLabel }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['../dialog.scss']
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}
}
