import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';
import { AdminUser, ROLE_OPTIONS, UserRole } from '../../models/admin';

@Component({
  selector: 'app-role-dialog',
  templateUrl: './role-dialog.component.html',
  styleUrls: ['../dialog.scss']
})
export class RoleDialogComponent {
  readonly roleOptions = ROLE_OPTIONS;
  selectedRole: UserRole;
  saving = false;
  errorMessage = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: AdminUser; isSelf: boolean },
    private dialogRef: MatDialogRef<RoleDialogComponent>,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
  ) {
    this.selectedRole = data.user.userRole;
  }

  get fullName(): string {
    return `${this.data.user.firstName} ${this.data.user.lastName}`.trim();
  }

  get currentRoleLabel(): string {
    return ROLE_OPTIONS.find(r => r.value === this.data.user.userRole)?.label ?? '';
  }

  get unchanged(): boolean {
    return this.selectedRole === this.data.user.userRole;
  }

  save(): void {
    if (this.unchanged) return;
    this.saving = true;
    this.errorMessage = '';

    this.adminService.changeRole(this.data.user.id, this.selectedRole).subscribe({
      next: updated => {
        this.snackBar.open(`${this.fullName} uchun rol o'zgartirildi`, 'Yopish', { duration: 3000, panelClass: ['success-snackbar'] });
        this.dialogRef.close(updated);
      },
      error: err => {
        this.saving = false;
        this.errorMessage = err.error?.message || err.error?.Message || "Rolni o'zgartirib bo'lmadi";
      }
    });
  }
}
