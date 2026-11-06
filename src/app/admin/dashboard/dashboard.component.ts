import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StatDetailDialogComponent, StatKind } from '../dialogs/stat-detail-dialog/stat-detail-dialog.component';
import { formatDate } from '@angular/common';
import { AdminService } from '../services/admin.service';
import { DashboardStats, ROLE_OPTIONS, UserRole } from '../models/admin';
import { ColumnPoint } from '../charts/column-chart/column-chart.component';
import { LineSeries } from '../charts/line-chart/line-chart.component';
import { AiSettingsDialogComponent } from '../dialogs/ai-settings-dialog/ai-settings-dialog.component';

// Tasdiqlangan kategorik palitra (yorug' rejim): 1-ko'k, 2-to'q sariq, 3-zangori
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a'];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['../admin.scss', './dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats?: DashboardStats;
  loading = true;
  error = false;

  registrations: ColumnPoint[] = [];
  activityLabels: string[] = [];
  activitySeries: LineSeries[] = [];
  roles: { label: string; count: number; percent: number }[] = [];

  readonly seriesColor = SERIES[0];

  constructor(private adminService: AdminService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.adminService.getDashboard().subscribe({
      next: stats => {
        this.stats = stats;
        this.buildCharts(stats);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  openDetail(kind: StatKind): void {
    if (!this.stats) return;
    this.dialog.open(StatDetailDialogComponent, {
      width: '820px',
      maxWidth: '95vw',
      panelClass: 'stat-detail-panel',
      data: { kind, stats: this.stats },
    });
  }

  openAiSettings(): void {
    this.dialog.open(AiSettingsDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'ai-settings-panel'
    });
  }

  get maxBookScore(): number {
    return Math.max(1, ...(this.stats?.topBooks ?? []).map(b => b.demandScore));
  }

  get maxCategoryActivity(): number {
    return Math.max(1, ...(this.stats?.categories ?? []).map(c => c.quizAttempts + c.bookViews));
  }

  get totalContent(): number {
    const s = this.stats;
    return s ? s.totalBooks + s.totalArticles + s.totalVideos + s.totalAudios : 0;
  }

  private buildCharts(stats: DashboardStats): void {
    const label = (d: string) => formatDate(d, 'dd.MM', 'en-US');

    this.registrations = stats.registrations.map(r => ({ label: label(r.date), value: r.count }));

    this.activityLabels = stats.activity.map(a => label(a.date));
    this.activitySeries = [
      { name: 'Test urinishlari', color: SERIES[0], values: stats.activity.map(a => a.quizAttempts) },
      { name: "Kitob ko'rishlar", color: SERIES[1], values: stats.activity.map(a => a.bookViews) },
      { name: 'AI savollar', color: SERIES[2], values: stats.activity.map(a => a.aiQuestions) },
    ];

    const total = Math.max(1, stats.totalUsers);
    this.roles = [...ROLE_OPTIONS].reverse().map(r => {
      const count = stats.usersByRole[UserRole[r.value]] ?? 0;
      return { label: r.label, count, percent: Math.round((count / total) * 100) };
    });
  }
}
