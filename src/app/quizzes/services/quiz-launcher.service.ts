import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, Observable, map, switchMap } from 'rxjs';
import { BookService } from 'src/app/content-category/services/book.service';
import { BeginQuizComponent } from '../quizzes/start-quiz-dialog/begin-quiz/begin-quiz.component';
import { StartQuizDialogComponent } from '../quizzes/start-quiz-dialog/start-quiz-dialog.component';
import { QuizAttempt } from './quiz-attempt.service';

// Testni bir xil tartibda ochish: tasdiqlash oynasi → to'liq ekranli test.
// Bosh sahifa ham, kitoblar sahifasi ham shu servisdan foydalanadi.
@Injectable({
  providedIn: 'root'
})
export class QuizLauncherService {

  constructor(private dialog: MatDialog, private bookService: BookService) { }

  // book.quiz.id bo'lishi shart. Test oynasi yopilganda emit qiladi
  launch(book: any): Observable<void> {
    // Kitobga qiziqishni (talabni) yozib qo'yamiz; xato bo'lsa testga to'sqinlik qilmaydi
    this.bookService.trackView(book.id).subscribe({ error: () => {} });

    return this.dialog.open(StartQuizDialogComponent, { width: '600px', data: { book } })
      .afterClosed()
      .pipe(switchMap(result => result === 'start' ? this.open(book) : EMPTY));
  }

  // Sahifa yangilangandan keyin tugallanmagan urinishni davom ettirish
  resume(attempt: QuizAttempt, book?: any): Observable<void> {
    return this.open(book ?? { id: attempt.bookId, title: attempt.bookTitle, quiz: { id: attempt.quizId } }, attempt);
  }

  private open(book: any, resume?: QuizAttempt): Observable<void> {
    return this.dialog.open(BeginQuizComponent, {
      width: '100vw',
      height: '100vh',
      hasBackdrop: false,
      disableClose: true,
      position: { top: '0', left: '0' },
      data: { book, resume }
    }).afterClosed().pipe(map(() => undefined));
  }
}
