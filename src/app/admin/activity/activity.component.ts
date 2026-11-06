import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from '../services/admin.service';
import { ActivityEvent, ActivityType } from '../models/admin';
import { UserActivityDialogComponent } from '../dialogs/user-activity-dialog/user-activity-dialog.component';

const TYPE_META: Record<ActivityType, { label: string; icon: string; verb: string }> = {
  'registration': { label: "Ro'yxatdan o'tish", icon: 'person_add', verb: "ro'yxatdan o'tdi" },
  'book-view': { label: 'Kitob ochish', icon: 'menu_book', verb: 'kitobni ochdi' },
  'quiz': { label: 'Test', icon: 'fact_check', verb: 'testni topshirdi' },
  'certificate': { label: 'Sertifikat', icon: 'workspace_premium', verb: 'sertifikat oldi' },
};

@Component({
  selector: 'app-admin-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['../admin.scss', './activity.component.scss']
})
export class ActivityComponent implements OnInit {
  events: ActivityEvent[] = [];
  loading = true;
  filter: ActivityType | 'all' = 'all';
  take = 50;

  readonly types = Object.entries(TYPE_META).map(([value, meta]) => ({ value: value as ActivityType, ...meta }));

  constructor(private adminService: AdminService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.adminService.getRecentActivity(this.take).subscribe({
      next: events => {
        this.events = events;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  loadMore(): void {
    this.take = Math.min(this.take + 50, 200);
    this.load();
  }

  get visible(): ActivityEvent[] {
    return this.filter === 'all' ? this.events : this.events.filter(e => e.type === this.filter);
  }

  meta(type: ActivityType) {
    return TYPE_META[type];
  }

  openUser(event: ActivityEvent): void {
    this.dialog.open(UserActivityDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: { userId: event.userId },
    });
  }
}
