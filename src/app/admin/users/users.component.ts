import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { AdminService } from '../services/admin.service';
import { AdminUser, ROLE_OPTIONS, UserRole } from '../models/admin';
import { RoleDialogComponent } from '../dialogs/role-dialog/role-dialog.component';
import { UserEditDialogComponent } from '../dialogs/user-edit-dialog/user-edit-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserActivityDialogComponent } from '../dialogs/user-activity-dialog/user-activity-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.component.html',
  styleUrls: ['../admin.scss', './users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: AdminUser[] = [];
  totalCount = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;
  granting: number | null = null;

  searchControl = new FormControl('', { nonNullable: true });
  // Rol yoki 'deleted' (O'chirilganlar)
  roleFilter: UserRole | 'deleted' | null = null;
  sortBy = 'newest';

  readonly roleOptions = ROLE_OPTIONS;
  readonly sortOptions = [
    { value: 'newest', label: 'Yangi qo\'shilganlar' },
    { value: 'ball', label: 'Ball bo\'yicha' },
    { value: 'activity', label: 'Oxirgi faollik' },
    { value: 'name', label: 'Ism bo\'yicha' },
  ];

  readonly currentUserId: number | null;
  private searchSub?: Subscription;

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    const id = localStorage.getItem('userId');
    this.currentUserId = id ? Number(JSON.parse(id)) : null;
  }

  ngOnInit(): void {
    const sort = this.route.snapshot.queryParamMap.get('sort');
    if (sort && this.sortOptions.some(o => o.value === sort)) this.sortBy = sort;

    this.searchSub = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 1;
        this.load();
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  get showDeleted(): boolean {
    return this.roleFilter === 'deleted';
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  load(): void {
    this.loading = true;
    this.adminService.getUsers({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchControl.value,
      role: this.showDeleted ? null : (this.roleFilter as UserRole | null),
      deleted: this.showDeleted,
      sortBy: this.sortBy,
    }).subscribe({
      next: page => {
        this.users = page.items;
        this.totalCount = page.totalCount;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onFilterChange(): void {
    this.pageIndex = 1;
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageIndex = page;
    this.load();
  }

  initials(user: AdminUser): string {
    return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
  }

  roleName(role: UserRole): string {
    return ROLE_OPTIONS.find(r => r.value === role)?.label ?? String(role);
  }

  openRoleDialog(user: AdminUser): void {
    this.dialog.open(RoleDialogComponent, {
      width: '460px',
      data: { user, isSelf: user.id === this.currentUserId },
    }).afterClosed().subscribe(updated => {
      if (updated) this.load();
    });
  }

  openEditDialog(user: AdminUser): void {
    this.dialog.open(UserEditDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { user },
    }).afterClosed().subscribe(updated => {
      if (updated) this.load();
    });
  }

  grantTopReader(user: AdminUser): void {
    const name = `${user.firstName} ${user.lastName}`.trim();
    const data: ConfirmDialogData = {
      title: '"Eng faol kitobxon" sertifikati',
      message: `<b>${name}</b>ga "Eng faol kitobxon" sertifikati beriladi. U Rag'batlantirish sahifasida darhol ko'rinadi va QR kod orqali tekshiriladi.`,
      confirmLabel: 'Sertifikat berish',
      icon: 'military_tech',
      tone: 'primary',
    };
    this.dialog.open(ConfirmDialogComponent, { width: '440px', data }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.granting = user.id;
      this.adminService.grantTopReader(user.id).subscribe({
        next: () => {
          this.granting = null;
          this.snackBar.open(`${name}ga sertifikat berildi`, 'Yopish', { duration: 3000, panelClass: ['success-snackbar'] });
          this.load();
        },
        error: err => {
          this.granting = null;
          this.snackBar.open(err.error?.message || "Sertifikat berib bo'lmadi", 'Yopish', { duration: 3500, panelClass: ['error-snackbar'] });
        },
      });
    });
  }

  confirmDelete(user: AdminUser): void {
    const name = `${user.firstName} ${user.lastName}`.trim();
    const data: ConfirmDialogData = {
      title: "Foydalanuvchini o'chirish",
      message: `<b>${name}</b> (${user.phone}) o'chiriladi va tizimga kira olmaydi. Davom etasizmi?`,
      confirmLabel: "O'chirish",
      icon: 'delete',
      tone: 'danger',
    };

    this.dialog.open(ConfirmDialogComponent, { width: '420px', data }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`${name} o'chirildi`, 'Yopish', { duration: 3000, panelClass: ['success-snackbar'] });
          // Oxirgi sahifadagi yagona qator o'chsa, oldingi sahifaga qaytamiz
          if (this.users.length === 1 && this.pageIndex > 1) this.pageIndex--;
          this.load();
        },
        error: err => this.snackBar.open(err.error?.message || "O'chirib bo'lmadi", 'Yopish', { duration: 3500, panelClass: ['error-snackbar'] }),
      });
    });
  }

  confirmRestore(user: AdminUser): void {
    const name = `${user.firstName} ${user.lastName}`.trim();
    const data: ConfirmDialogData = {
      title: 'Foydalanuvchini tiklash',
      message: `<b>${name}</b> (${user.phone}) qayta faollashadi: tizimga kira oladi, ballari va sertifikatlari reytingga qaytadi.`,
      confirmLabel: 'Tiklash',
      icon: 'restore_from_trash',
      tone: 'primary',
    };

    this.dialog.open(ConfirmDialogComponent, { width: '420px', data }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.adminService.restoreUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`${name} tiklandi`, 'Yopish', { duration: 3000, panelClass: ['success-snackbar'] });
          if (this.users.length === 1 && this.pageIndex > 1) this.pageIndex--;
          this.load();
        },
        error: err => this.snackBar.open(err.error?.message || "Tiklab bo'lmadi", 'Yopish', { duration: 4000, panelClass: ['error-snackbar'] }),
      });
    });
  }

  openActivity(user: AdminUser): void {
    this.dialog.open(UserActivityDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: { userId: user.id },
    });
  }
}
