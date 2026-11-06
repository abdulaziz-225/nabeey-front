import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';
import { AdminUser, ROLE_OPTIONS } from '../../models/admin';

const MIN_PASSWORD = 6;

// Parol ixtiyoriy: kiritilsa tasdiq bilan mos bo'lishi va kamida 6 belgi bo'lishi kerak
function passwordRules(group: AbstractControl): ValidationErrors | null {
  const password: string = group.get('password')?.value ?? '';
  const confirm: string = group.get('confirm')?.value ?? '';
  if (!password && !confirm) return null;
  if (password.length < MIN_PASSWORD) return { tooShort: true };
  return password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-user-edit-dialog',
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['../dialog.scss', './user-edit-dialog.component.scss']
})
export class UserEditDialogComponent {
  readonly minPassword = MIN_PASSWORD;
  hide = true;
  saving = false;
  errorMessage = '';

  form = new FormGroup({
    firstName: new FormControl(this.data.user.firstName ?? '', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl(this.data.user.lastName ?? '', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl(this.data.user.email ?? '', { nonNullable: true, validators: [Validators.email] }),
    phone: new FormControl(this.data.user.phone ?? '', { nonNullable: true, validators: [Validators.required] }),
    passwords: new FormGroup({
      password: new FormControl('', { nonNullable: true }),
      confirm: new FormControl('', { nonNullable: true }),
    }, { validators: passwordRules }),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: AdminUser },
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
  ) {}

  get u(): AdminUser {
    return this.data.user;
  }

  get roleLabel(): string {
    return ROLE_OPTIONS.find(r => r.value === this.u.userRole)?.label ?? '';
  }

  get passwords(): FormGroup {
    return this.form.controls.passwords;
  }

  generatePassword(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const values = crypto.getRandomValues(new Uint32Array(10));
    const password = Array.from(values, v => chars[v % chars.length]).join('');
    this.passwords.setValue({ password, confirm: password });
    this.hide = false;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving = true;
    this.errorMessage = '';

    this.adminService.updateUser(this.u.id, {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone,
      newPassword: v.passwords.password || null,
    }).subscribe({
      next: updated => {
        const message = v.passwords.password ? "Ma'lumotlar va parol yangilandi" : "Ma'lumotlar yangilandi";
        this.snackBar.open(message, 'Yopish', { duration: 3000, panelClass: ['success-snackbar'] });
        this.dialogRef.close(updated);
      },
      error: err => {
        this.saving = false;
        this.errorMessage = err.error?.message || err.error?.Message || "Saqlab bo'lmadi";
      }
    });
  }
}
