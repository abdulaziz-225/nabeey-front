import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { ROLE_OPTIONS, UserActivity, UserRole } from '../../models/admin';

@Component({
  selector: 'app-user-activity-dialog',
  templateUrl: './user-activity-dialog.component.html',
  styleUrls: ['../dialog.scss', '../../admin.scss', './user-activity-dialog.component.scss']
})
export class UserActivityDialogComponent implements OnInit {
  activity?: UserActivity;
  loading = true;
  error = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { userId: number },
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.adminService.getUserActivity(this.data.userId).subscribe({
      next: activity => {
        this.activity = activity;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  roleName(role: UserRole): string {
    return ROLE_OPTIONS.find(r => r.value === role)?.label ?? String(role);
  }
}
