import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from '../services/admin.service';
import { BookDemand, BookReader } from '../models/admin';
import { UserActivityDialogComponent } from '../dialogs/user-activity-dialog/user-activity-dialog.component';

type SortKey = 'demandScore' | 'views' | 'uniqueReaders' | 'quizAttempts' | 'averageScorePercent';

@Component({
  selector: 'app-book-analytics',
  templateUrl: './book-analytics.component.html',
  styleUrls: ['../admin.scss', './book-analytics.component.scss']
})
export class BookAnalyticsComponent implements OnInit {
  books: BookDemand[] = [];
  loading = true;
  search = '';
  sortKey: SortKey = 'demandScore';

  selected?: BookDemand;
  readers: BookReader[] = [];
  readersLoading = false;

  readonly columns: { key: SortKey; label: string }[] = [
    { key: 'views', label: "Ko'rish" },
    { key: 'uniqueReaders', label: "O'quvchi" },
    { key: 'quizAttempts', label: 'Test' },
    { key: 'averageScorePercent', label: "O'rtacha %" },
    { key: 'demandScore', label: 'Talab' },
  ];

  constructor(private adminService: AdminService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.adminService.getBookDemand().subscribe({
      next: books => {
        this.books = books;
        this.loading = false;
        if (books.length && books[0].demandScore > 0) this.select(books[0]);
      },
      error: () => (this.loading = false),
    });
  }

  get visibleBooks(): BookDemand[] {
    const term = this.search.trim().toLowerCase();
    return this.books
      .filter(b => !term || b.title?.toLowerCase().includes(term) || b.author?.toLowerCase().includes(term))
      .sort((a, b) => b[this.sortKey] - a[this.sortKey]);
  }

  get maxScore(): number {
    return Math.max(1, ...this.books.map(b => b.demandScore));
  }

  get totals() {
    return {
      views: this.books.reduce((s, b) => s + b.views, 0),
      attempts: this.books.reduce((s, b) => s + b.quizAttempts, 0),
      untouched: this.books.filter(b => b.demandScore === 0).length,
    };
  }

  sortBy(key: SortKey): void {
    this.sortKey = key;
  }

  select(book: BookDemand): void {
    this.selected = book;
    this.readers = [];
    this.readersLoading = true;
    this.adminService.getBookReaders(book.id).subscribe({
      next: readers => {
        this.readers = readers;
        this.readersLoading = false;
      },
      error: () => (this.readersLoading = false),
    });
  }

  openUser(reader: BookReader): void {
    this.dialog.open(UserActivityDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      data: { userId: reader.userId },
    });
  }
}
