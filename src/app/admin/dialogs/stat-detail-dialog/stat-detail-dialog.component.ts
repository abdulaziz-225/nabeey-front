import { Component, Inject, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { ChatService } from 'src/app/core/core/services/chat.service';
import { ChatConversationSummary } from 'src/app/core/core/models/chat';
import { ActivityEvent, AdminUser, CertificateOwner, DashboardStats, OwnedCertificate, ROLE_OPTIONS, UserRole } from '../../models/admin';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColumnPoint } from '../../charts/column-chart/column-chart.component';
import { environment } from 'src/app/environments/environment';
import { UserActivityDialogComponent } from '../user-activity-dialog/user-activity-dialog.component';

export type StatKind = 'users' | 'active' | 'quiz' | 'views' | 'certificates' | 'ai' | 'chats' | 'content';

interface KindMeta {
  title: string;
  icon: string;
  tone: string;
  subtitle: string;
  link?: { label: string; url: string };
}

const META: Record<StatKind, KindMeta> = {
  users: { title: 'Jami foydalanuvchilar', icon: 'group', tone: 'blue', subtitle: "Ro'yxatdan o'tish dinamikasi va yangi a'zolar", link: { label: 'Barcha foydalanuvchilar', url: '/admin/users' } },
  active: { title: 'Faol foydalanuvchilar', icon: 'bolt', tone: 'green', subtitle: "So'nggi 7 kunda test, kitob yoki AI'dan foydalanganlar", link: { label: 'Foydalanuvchilar', url: '/admin/users' } },
  quiz: { title: 'Test urinishlari', icon: 'fact_check', tone: 'violet', subtitle: 'Testlar kesimida natijalar va oxirgi urinishlar' },
  views: { title: 'Kitobga qiziqish', icon: 'visibility', tone: 'orange', subtitle: 'Kim qaysi kitobni ochgani', link: { label: 'Kitoblar tahlili', url: '/admin/books' } },
  certificates: { title: 'Sertifikatlar', icon: 'workspace_premium', tone: 'amber', subtitle: 'Berilgan sertifikatlar va ularning egalari' },
  ai: { title: 'AI yordamchi', icon: 'smart_toy', tone: 'teal', subtitle: "AI'ga berilgan savollar dinamikasi va faol foydalanuvchilar" },
  chats: { title: 'Suhbatlar', icon: 'forum', tone: 'rose', subtitle: "Qo'llab-quvvatlash suhbatlari holati", link: { label: "Suhbatlarga o'tish", url: '/support' } },
  content: { title: 'Kontent', icon: 'library_books', tone: 'slate', subtitle: "Platformadagi kontent tarkibi va bo'limlar bo'yicha taqsimot", link: { label: 'Kitoblarni boshqarish', url: '/books' } },
};

@Component({
  selector: 'app-stat-detail-dialog',
  templateUrl: './stat-detail-dialog.component.html',
  styleUrls: ['../dialog.scss', '../../admin.scss', './stat-detail-dialog.component.scss']
})
export class StatDetailDialogComponent implements OnInit {
  readonly meta: KindMeta;
  readonly s: DashboardStats;
  loading = false;

  users: AdminUser[] = [];
  events: ActivityEvent[] = [];
  conversations: ChatConversationSummary[] = [];
  chart: ColumnPoint[] = [];
  groups: { name: string; count: number; extra: number }[] = [];
  owners: CertificateOwner[] = [];
  candidates: AdminUser[] = [];
  preview: CertificateOwner | null = null;
  granting: number | null = null;

  // Sertifikat fayllari backend'ning statik papkasidan beriladi
  private readonly fileOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { kind: StatKind; stats: DashboardStats },
    private dialogRef: MatDialogRef<StatDetailDialogComponent>,
    private dialog: MatDialog,
    private adminService: AdminService,
    private chatService: ChatService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.meta = META[data.kind];
    this.s = data.stats;
  }

  get kind(): StatKind {
    return this.data.kind;
  }

  ngOnInit(): void {
    const label = (d: string) => formatDate(d, 'dd.MM', 'en-US');

    switch (this.kind) {
      case 'users':
        this.chart = this.s.registrations.map(r => ({ label: label(r.date), value: r.count }));
        this.loadUsers('newest', users => users.slice(0, 8));
        break;
      case 'active': {
        const since = Date.now() - 7 * 24 * 3600 * 1000;
        this.loadUsers('activity', users => users.filter(u => u.lastActivityAt && new Date(u.lastActivityAt).getTime() >= since));
        break;
      }
      case 'ai':
        this.chart = this.s.activity.map(a => ({ label: label(a.date), value: a.aiQuestions }));
        this.loadUsers('activity', users => users.filter(u => u.aiQuestionCount > 0).sort((a, b) => b.aiQuestionCount - a.aiQuestionCount));
        break;
      case 'quiz':
        this.chart = this.s.activity.map(a => ({ label: label(a.date), value: a.quizAttempts }));
        this.loadEvents('quiz', events => this.groupBy(events, e => e.scorePercent ?? 0));
        break;
      case 'views':
        this.chart = this.s.activity.map(a => ({ label: label(a.date), value: a.bookViews }));
        this.loadEvents('book-view', events => this.groupBy(events));
        break;
      case 'certificates':
        this.loadCertificates();
        break;
      case 'chats':
        this.loading = true;
        this.chatService.getAllConversations().subscribe({
          next: list => {
            this.conversations = [...list].sort((a, b) => Number(b.status === 'Open') - Number(a.status === 'Open') || b.unreadCount - a.unreadCount);
            this.loading = false;
          },
          error: () => (this.loading = false),
        });
        break;
    }
  }

  get heroValue(): number {
    const s = this.s;
    switch (this.kind) {
      case 'users': return s.totalUsers;
      case 'active': return s.activeUsersLast7Days;
      case 'quiz': return s.totalQuizAttempts;
      case 'views': return s.totalBookViews;
      case 'certificates': return s.totalCertificates;
      case 'ai': return s.aiQuestionsTotal;
      case 'chats': return s.openConversations;
      case 'content': return s.totalBooks + s.totalArticles + s.totalVideos + s.totalAudios;
    }
  }

  get certificateCount(): number {
    return this.owners.reduce((sum, o) => sum + o.certificates.length, 0);
  }

  get uniqueUsers(): number {
    return new Set(this.events.map(e => e.userId)).size;
  }

  get maxGroup(): number {
    return Math.max(1, ...this.groups.map(g => g.count));
  }

  get maxCategory(): number {
    return Math.max(1, ...this.s.categories.map(c => c.bookCount + c.quizCount));
  }

  get activeShare(): number {
    return this.s.totalUsers ? Math.round((this.s.activeUsersLast7Days / this.s.totalUsers) * 100) : 0;
  }

  get openChats(): ChatConversationSummary[] {
    return this.conversations.filter(c => c.status === 'Open');
  }

  get contentItems() {
    return [
      { label: 'Kitoblar', value: this.s.totalBooks, icon: 'menu_book', url: '/books' },
      { label: 'Xabarlar', value: this.s.totalArticles, icon: 'article', url: '/article' },
      { label: 'Videolar', value: this.s.totalVideos, icon: 'smart_display', url: '/categories' },
      { label: 'Audiolar', value: this.s.totalAudios, icon: 'headphones', url: '/categories' },
      { label: 'Testlar', value: this.s.totalQuizzes, icon: 'quiz', url: '/quiz' },
      { label: 'Savollar', value: this.s.totalQuestions, icon: 'help', url: '/questions' },
      { label: "Bo'limlar", value: this.s.totalCategories, icon: 'category', url: '/categories' },
    ];
  }

  roleName(role: UserRole): string {
    return ROLE_OPTIONS.find(r => r.value === role)?.label ?? String(role);
  }

  roleCount(role: UserRole): number {
    return this.s.usersByRole[UserRole[role]] ?? 0;
  }

  get roleOptions() {
    return [...ROLE_OPTIONS].reverse();
  }

  fileUrl(c: OwnedCertificate): string | null {
    return c.filePath ? this.fileOrigin + c.filePath : null;
  }

  certificateLink(c: OwnedCertificate): string | null {
    return c.code ? `/certificate/${c.code}` : this.fileUrl(c);
  }

  kindIcon(c: OwnedCertificate): string {
    return c.kind === 'top-reader' ? 'military_tech' : c.kind === 'ball100' ? 'workspace_premium' : 'quiz';
  }

  openPreview(owner: CertificateOwner, event?: MouseEvent): void {
    event?.stopPropagation();
    this.preview = owner;
  }

  hasTopReader(userId: number): boolean {
    return !!this.owners.find(o => o.userId === userId)?.certificates.some(c => c.kind === 'top-reader');
  }

  // Super Admin "Eng faol kitobxon" sertifikatini beradi
  grantTopReader(userId: number, fullName: string, event?: MouseEvent): void {
    event?.stopPropagation();
    const data: ConfirmDialogData = {
      title: '"Eng faol kitobxon" sertifikati',
      message: `<b>${fullName}</b>ga "Eng faol kitobxon" sertifikati beriladi. Sertifikat unga darhol ko'rinadi va QR kod orqali tekshiriladi.`,
      confirmLabel: 'Sertifikat berish',
      icon: 'military_tech',
      tone: 'primary',
    };
    this.dialog.open(ConfirmDialogComponent, { width: '440px', data }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.granting = userId;
      this.adminService.grantTopReader(userId).subscribe({
        next: () => {
          this.granting = null;
          this.snackBar.open(`${fullName}ga sertifikat berildi`, 'Yopish', { duration: 3000, panelClass: ['success-snackbar'] });
          this.loadCertificates();
        },
        error: err => {
          this.granting = null;
          this.snackBar.open(err.error?.message || "Sertifikat berib bo'lmadi", 'Yopish', { duration: 3500, panelClass: ['error-snackbar'] });
        },
      });
    });
  }

  openUser(userId: number): void {
    this.dialog.open(UserActivityDialogComponent, { width: '760px', maxWidth: '95vw', data: { userId } });
  }

  go(url: string): void {
    this.dialogRef.close();
    this.router.navigateByUrl(url);
  }

  private loadUsers(sortBy: string, pick: (users: AdminUser[]) => AdminUser[]): void {
    this.loading = true;
    this.adminService.getUsers({ pageIndex: 1, pageSize: 100, sortBy }).subscribe({
      next: page => {
        this.users = pick(page.items);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private loadEvents(type: 'quiz' | 'book-view' | 'certificate', after: (events: ActivityEvent[]) => void): void {
    this.loading = true;
    this.adminService.getRecentActivity(200, type).subscribe({
      next: events => {
        this.events = events;
        after(events);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private loadCertificates(): void {
    this.loading = true;
    this.adminService.getCertificateOwners().subscribe({
      next: owners => {
        this.owners = owners;
        this.loading = false;
        if (this.preview) this.preview = owners.find(o => o.userId === this.preview?.userId) ?? null;
      },
      error: () => (this.loading = false),
    });
    // Tavsiya: eng ko'p ball to'plagan va faol kitobxonlar
    this.adminService.getUsers({ pageIndex: 1, pageSize: 100, sortBy: 'ball' }).subscribe(page => {
      this.candidates = page.items
        .filter(u => u.totalBall > 0 || u.bookViewCount > 0 || u.quizCount > 0)
        .sort((a, b) => (b.totalBall + b.bookViewCount + b.quizCount * 2) - (a.totalBall + a.bookViewCount + a.quizCount * 2))
        .slice(0, 6);
    });
  }

  // Mavzu (kitob/test nomi) bo'yicha guruhlash; extra — ixtiyoriy o'rtacha qiymat
  private groupBy(events: ActivityEvent[], value?: (e: ActivityEvent) => number): void {
    const map = new Map<string, { count: number; sum: number }>();
    for (const e of events) {
      const key = e.subject || "Noma'lum";
      const g = map.get(key) ?? { count: 0, sum: 0 };
      g.count++;
      g.sum += value ? value(e) : 0;
      map.set(key, g);
    }
    this.groups = [...map.entries()]
      .map(([name, g]) => ({ name, count: g.count, extra: Math.round((g.sum / g.count) * 10) / 10 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }
}
