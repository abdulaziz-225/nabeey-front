import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { MatDialog } from '@angular/material/dialog';
import { BookDialogComponent } from '../book-dialog/book-dialog.component';
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';
import { Book } from '../../models/book';
import { BookStat, StatPeriod } from '../../models/book-comment';
import { BookRatingService } from '../../services/book-rating.service';

type SortMode = 'popular' | 'rating' | 'newest';

@Component({
  selector: 'app-book-content',
  templateUrl: './book-content.component.html',
  styleUrls: ['./book-content.component.scss']
})
export class BookContentComponent implements OnInit, AfterViewInit {

  @ViewChildren('sortButton') sortButtons!: QueryList<ElementRef<HTMLButtonElement>>;
  // Sirpanuvchi fon joyi; birinchi joylashuvdan keyingina animatsiya yoqiladi
  indicator = { left: 0, top: 0, width: 0, height: 0, ready: false };

  books: (Book & { createdAt?: string })[] = [];
  stats: Record<number, BookStat> = {};
  userRole: string | null;
  loading = true;

  sort: SortMode = 'popular';
  period: StatPeriod = 'week';
  searchControl = new FormControl('');

  readonly sortOptions: { value: SortMode; label: string; icon: string }[] = [
    { value: 'popular', label: "Eng ko'p o'qilgan", icon: 'local_fire_department' },
    { value: 'rating', label: 'Eng yuqori baholangan', icon: 'star' },
    { value: 'newest', label: 'Yangi', icon: 'fiber_new' }
  ];

  readonly periodOptions: { value: StatPeriod; label: string; short: string }[] = [
    { value: 'day', label: 'Bugun', short: 'bugun' },
    { value: 'week', label: 'Hafta', short: 'haftada' },
    { value: 'month', label: 'Oy', short: 'oyda' },
    { value: 'all', label: 'Hammasi', short: 'jami' }
  ];

  constructor(private bookService: BookService,
    private bookRatingService: BookRatingService,
    private dialog: MatDialog
  ){
    const userRole = localStorage.getItem('role');
    this.userRole = userRole != null ? JSON.parse(userRole) : null;
  }

  ngOnInit(): void {
    this.loadBooks();
    this.loadStats();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.moveIndicator();
      setTimeout(() => this.indicator.ready = true);
    });
  }

  // Ekran o'lchami o'zgarsa tugmalar boshqa qatorga o'tishi mumkin
  @HostListener('window:resize')
  onResize() {
    this.moveIndicator();
  }

  private moveIndicator() {
    const index = this.sortOptions.findIndex(o => o.value === this.sort);
    const button = this.sortButtons?.get(index)?.nativeElement;
    if (!button) return;
    this.indicator = {
      ...this.indicator,
      left: button.offsetLeft,
      top: button.offsetTop,
      width: button.offsetWidth,
      height: button.offsetHeight
    };
  }

  trackById(_: number, book: Book) {
    return book.id;
  }

  get periodLabel(): string {
    return this.periodOptions.find(p => p.value === this.period)?.short ?? '';
  }

  // Qidiruv + saralash
  get visibleBooks() {
    const query = (this.searchControl.value || '').trim().toLowerCase();
    const filtered = query
      ? this.books.filter(b => b.title?.toLowerCase().includes(query) || b.author?.toLowerCase().includes(query))
      : [...this.books];

    const stat = (b: Book) => this.stats[b.id];
    switch (this.sort) {
      case 'popular':
        return filtered.sort((a, b) =>
          (stat(b)?.views ?? 0) - (stat(a)?.views ?? 0) || (stat(b)?.totalViews ?? 0) - (stat(a)?.totalViews ?? 0));
      case 'rating':
        return filtered.sort((a, b) =>
          (stat(b)?.ratingAverage ?? 0) - (stat(a)?.ratingAverage ?? 0) || (stat(b)?.ratingCount ?? 0) - (stat(a)?.ratingCount ?? 0));
      default:
        return filtered.sort((a, b) =>
          (b.createdAt ? Date.parse(b.createdAt) : b.id) - (a.createdAt ? Date.parse(a.createdAt) : a.id) || b.id - a.id);
    }
  }

  // Tanlangan davrda eng ko'p talab qilingan kitoblar (faqat ko'rishi borlar)
  get topDemand() {
    return [...this.books]
      .filter(b => (this.stats[b.id]?.views ?? 0) > 0)
      .sort((a, b) => this.stats[b.id].views - this.stats[a.id].views)
      .slice(0, 3);
  }

  demandRank(book: Book): number | null {
    const index = this.topDemand.findIndex(b => b.id === book.id);
    return index >= 0 ? index + 1 : null;
  }

  setSort(sort: SortMode) {
    this.sort = sort;
    this.moveIndicator();
  }

  setPeriod(period: StatPeriod) {
    if (this.period === period) return;
    this.period = period;
    this.loadStats();
  }

  loadBooks(){
    this.loading = true;
    this.bookService.loadBooks().subscribe({
      next: data => {
        this.books = data.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadStats() {
    this.bookRatingService.getStats(this.period).subscribe({
      next: list => this.stats = Object.fromEntries(list.map(s => [s.bookId, s])),
      error: () => {}
    });
  }

  openDialog(isEdit: boolean, book?: Book): void{
    const dialogRef = this.dialog.open(BookDialogComponent,{
      data: {
        book: isEdit ? book : null,
        isEdit: isEdit
      },
    });
    dialogRef.afterClosed().subscribe(()=>{
      this.loadBooks();
      this.loadStats();
    })
  }

  confirmDeleteBook(id:number){
    const dialogRef = this.dialog.open(ConfirmDeleteComponent,{
      width: '280px',
      height: '175px',
      data: {
        id: id,
        message: "Ushbu kitobni o'chirishga ishonchingiz komilmi?"
      }
    });
    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        this.deleteBook(id)
      }
    })
  }

  deleteBook(id:number){
    this.bookService.deleteBook(id).subscribe(()=>{
      this.loadBooks()
    })
  }

}
