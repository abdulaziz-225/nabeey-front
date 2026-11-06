import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookComment, BookRatingSummary } from 'src/app/content-category/models/book-comment';
import { BookRatingService } from 'src/app/content-category/services/book-rating.service';
import { BookCommentService } from 'src/app/content-category/services/book-comment.service';
import { UserService } from '../../services/user.service';

export interface BookCommentsDialogResult {
  count: number;
  rating: BookRatingSummary | null;
}

// Instagram uslubidagi izohlar oynasi: ro'yxat aylanadi, yozish maydoni doim pastda.
// Javob ham shu maydon orqali yoziladi ("Ism'ga javob ✕").
@Component({
  selector: 'app-book-comments-dialog',
  templateUrl: './book-comments-dialog.component.html',
  styleUrls: ['./book-comments-dialog.component.scss']
})
export class BookCommentsDialogComponent implements OnInit {

  @ViewChild('input') input?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('list') list?: ElementRef<HTMLElement>;

  readonly maxLength = 500;
  // Shu chegaradan keyin hisoblagich ko'rinadi
  readonly warnFrom = 450;
  readonly defaultAvatar = 'assets/Default_pfp.svg.png';
  readonly ratingLabels = ['Yomon', "O'rtacha", 'Yaxshi', 'Juda yaxshi', "A'lo"];

  book: any;
  comments: BookComment[] = [];
  loading = true;
  currentUserId: number | null = null;
  isAdmin = false;
  currentUser: any = null;
  rating: BookRatingSummary | null = null;
  ratingSaving = false;

  // Pastdagi yagona yozish maydoni
  text = '';
  sending = false;
  // Javob yozilayotgan izoh va u qaysi asosiy izoh ostida
  replyingTo: BookComment | null = null;
  replyRoot: BookComment | null = null;

  // Javoblari ochilgan asosiy izohlar
  expandedRoots = new Set<number>();
  // Yangi qo'shilgan izoh: sirpanib kiradi va qisqa sariq fonda turadi
  newCommentId: number | null = null;
  // Layk bosilganda yurakcha bir marta "pop" qiladi
  likePopId: number | null = null;
  private likeBusy = new Set<number>();

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { book: any },
    private dialogRef: MatDialogRef<BookCommentsDialogComponent, BookCommentsDialogResult>,
    private bookCommentService: BookCommentService,
    private bookRatingService: BookRatingService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.book = data.book;
  }

  get length(): number {
    return this.text.trim().length;
  }

  get isOverLimit(): boolean {
    return this.length > this.maxLength;
  }

  get canSend(): boolean {
    return this.length > 0 && !this.isOverLimit && !this.sending;
  }

  // Izohlar + javoblar
  get totalCount(): number {
    return this.comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);
  }

  ngOnInit(): void {
    const id = localStorage.getItem('userId')?.replace(/"/g, '');
    const role = localStorage.getItem('role')?.replace(/"/g, '');
    this.currentUserId = id ? Number(id) : null;
    this.isAdmin = role === 'Admin' || role === 'SuperAdmin';

    if (this.currentUserId) {
      this.userService.getUserById(this.currentUserId).subscribe({
        next: user => this.currentUser = user,
        error: () => {}
      });
    }

    this.loadComments();
    this.loadRating();
  }

  // ---- Reyting ----

  loadRating(): void {
    this.bookRatingService.getSummary(this.book.id).subscribe({
      next: summary => this.rating = summary,
      error: () => {}
    });
  }

  rate(stars: number): void {
    if (!this.currentUserId || this.ratingSaving) return;
    this.ratingSaving = true;
    this.bookRatingService.rate(this.book.id, stars).subscribe({
      next: summary => {
        this.rating = summary;
        this.ratingSaving = false;
        // Ro'yxatdagi o'z izoh va javoblarimda ham yangi baho ko'rinsin
        const mine = (c: BookComment) => c.user.id === this.currentUserId;
        this.comments.forEach(c => {
          if (mine(c)) c.userStars = stars;
          c.replies?.forEach(r => { if (mine(r)) r.userStars = stars; });
        });
      },
      error: err => {
        this.ratingSaving = false;
        this.notify(err?.error?.message || "Bahoni saqlab bo'lmadi");
      }
    });
  }

  // ---- Izohlar ----

  loadComments(): void {
    this.loading = true;
    this.bookCommentService.getByBook(this.book.id).subscribe({
      next: comments => {
        this.comments = comments;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify("Izohlarni yuklab bo'lmadi");
      }
    });
  }

  // Izoh yoki (javob rejimida) javob yuborish
  send(): void {
    if (!this.canSend || !this.currentUserId) return;

    const text = this.text.trim();
    const target = this.replyingTo;
    const root = this.replyRoot;

    this.sending = true;
    this.bookCommentService.create(this.book.id, text, target?.id ?? null).subscribe({
      next: created => {
        this.sending = false;
        this.text = '';
        this.resetInputHeight();
        this.newCommentId = created.id;

        if (target && root) {
          root.replies = [...(root.replies ?? []), created];
          this.expandedRoots.add(root.id);
          this.cancelReply();
          setTimeout(() => this.scrollTo(created.id));
        } else {
          this.comments = [{ ...created, replies: created.replies ?? [] }, ...this.comments];
          setTimeout(() => this.list?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' }));
        }
      },
      error: err => {
        this.sending = false;
        this.notify(err?.error?.message || "Yuborib bo'lmadi");
      }
    });
  }

  // Enter — yuborish, Shift+Enter — yangi qator, Esc — javobni bekor qilish
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    } else if (event.key === 'Escape' && this.replyingTo) {
      event.preventDefault();
      event.stopPropagation();
      this.cancelReply();
    }
  }

  // Maydon matnga qarab 4 qatorgacha o'sadi
  autoGrow(): void {
    const el = this.input?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }

  private resetInputHeight(): void {
    const el = this.input?.nativeElement;
    if (el) el.style.height = '';
  }

  // Asosiy izoh o'chsa, javoblari ham o'chadi (backend ham shunday qiladi)
  remove(comment: BookComment, root?: BookComment): void {
    this.bookCommentService.delete(comment.id).subscribe({
      next: () => {
        if (root) {
          root.replies = root.replies.filter(r => r.id !== comment.id);
        } else {
          this.comments = this.comments.filter(c => c.id !== comment.id);
        }
        if (this.replyingTo?.id === comment.id || this.replyRoot?.id === comment.id) {
          this.cancelReply();
        }
      },
      error: err => this.notify(err?.error?.message || "Izohni o'chirib bo'lmadi")
    });
  }

  // ---- Javoblar ----

  startReply(comment: BookComment, root: BookComment): void {
    if (!this.currentUserId) {
      this.notify('Javob yozish uchun tizimga kiring');
      return;
    }
    this.replyingTo = comment;
    this.replyRoot = root;
    this.input?.nativeElement.focus();
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyRoot = null;
  }

  toggleReplies(root: BookComment): void {
    if (this.expandedRoots.has(root.id)) {
      this.expandedRoots.delete(root.id);
    } else {
      this.expandedRoots.add(root.id);
    }
  }

  private scrollTo(commentId: number): void {
    this.list?.nativeElement
      .querySelector(`[data-comment-id="${commentId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---- Layk ----

  toggleLike(comment: BookComment): void {
    if (!this.currentUserId) {
      this.notify('Layk bosish uchun tizimga kiring');
      return;
    }
    if (this.likeBusy.has(comment.id)) return;

    // Darhol ko'rsatamiz, server javobi bilan aniqlaymiz
    const before = { liked: comment.likedByMe, count: comment.likeCount };
    comment.likedByMe = !before.liked;
    comment.likeCount = Math.max(0, before.count + (comment.likedByMe ? 1 : -1));
    this.likePopId = comment.likedByMe ? comment.id : null;

    this.likeBusy.add(comment.id);
    this.bookCommentService.toggleLike(comment.id).subscribe({
      next: res => {
        comment.likedByMe = res.liked;
        comment.likeCount = res.likeCount;
        this.likeBusy.delete(comment.id);
      },
      error: err => {
        comment.likedByMe = before.liked;
        comment.likeCount = before.count;
        this.likeBusy.delete(comment.id);
        this.notify(err?.error?.message || "Laykni saqlab bo'lmadi");
      }
    });
  }

  // ---- Yordamchilar ----

  canDelete(comment: BookComment): boolean {
    return this.isAdmin || comment.user.id === this.currentUserId;
  }

  fullName(comment: BookComment): string {
    const name = `${comment.user.firstName ?? ''} ${comment.user.lastName ?? ''}`.trim();
    return name || 'Foydalanuvchi';
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultAvatar;
  }

  timeAgo(value: string): string {
    // Backend UTC qaytaradi; zona belgisi bo'lmasa UTC deb hisoblaymiz
    const iso = /Z|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (seconds < 60) return 'hozirgina';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} daq`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} soat`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} kun`;
    return new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  close(): void {
    this.dialogRef.close({ count: this.totalCount, rating: this.rating });
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Yopish', { duration: 3000 });
  }
}
