import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from '../models/book';
import { BookStat } from '../models/book-comment';
import { BookCommentsDialogComponent } from 'src/app/core/core/primary-page/book-comments-dialog/book-comments-dialog.component';
import { QuizLauncherService } from 'src/app/quizzes/services/quiz-launcher.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent {
  @Input() book!: Book;
  // Ko'rishlar, reyting, izohlar va mos test (bo'lmasa karta ularsiz ko'rinadi)
  @Input() stat: BookStat | null = null;
  // Talab bo'yicha o'rni (1–3 bo'lsa "Ommabop" belgisi)
  @Input() demandRank: number | null = null;
  @Input() periodLabel = '';
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  // Test yoki izohlar oynasi yopilganda: statistika yangilanishi kerak
  @Output() changed = new EventEmitter<void>();

  userRole!: string | null;

  constructor(private dialog: MatDialog, private quizLauncher: QuizLauncherService) {
    const userRole = localStorage.getItem('role');
    this.userRole = userRole != null ? JSON.parse(userRole) : null;
  }

  get isAdmin(): boolean {
    return this.userRole === 'Admin' || this.userRole === 'SuperAdmin';
  }

  get initial(): string {
    return (this.book?.title || '?').trim().charAt(0).toUpperCase();
  }

  startTest() {
    if (!this.stat?.quizId) return;
    this.quizLauncher.launch({ ...this.book, quiz: { id: this.stat.quizId } })
      .subscribe(() => this.changed.emit());
  }

  openComments() {
    this.dialog.open(BookCommentsDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'book-comments-panel',
      autoFocus: false,
      data: { book: this.book }
    }).afterClosed().subscribe(() => this.changed.emit());
  }

  onEdit() {
    this.edit.emit(this.book);
  }

  onDelete() {
    this.delete.emit(this.book);
  }
}
