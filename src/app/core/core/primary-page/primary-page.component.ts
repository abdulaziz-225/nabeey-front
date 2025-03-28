import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BookService } from 'src/app/content-category/services/book.service';
import { QuizQustionService } from 'src/app/quizzes/services/quiz-qustion.service';
import { StartQuizDialogComponent } from 'src/app/quizzes/quizzes/start-quiz-dialog/start-quiz-dialog.component';
import { BeginQuizComponent } from 'src/app/quizzes/quizzes/start-quiz-dialog/begin-quiz/begin-quiz.component';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-primary-page',
  templateUrl: './primary-page.component.html',
  styleUrls: ['./primary-page.component.scss']
})
export class PrimaryPageComponent implements OnInit{

  books: any[] = [];
  filteredBooks: any[] = [];
  searchControl = new FormControl('');
  expandedBookId: number | null = null;
  
  constructor(private bookService: BookService, private quizQuestionService: QuizQustionService,
    private dialog: MatDialog, private cdRef: ChangeDetectorRef
  ){

  }


  toggleDescription(bookId: number) {
    this.expandedBookId = this.expandedBookId === bookId ? null : bookId;
  }

  ngOnInit(): void {
    this.loadBooks();
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      console.log("Qidiruv qiymati:", value);
      this.updateFilteredBooks(value || ''); // Agar value null bo‘lsa, bo‘sh string bo‘lsin
    });
    
  }

  // loadBooks() {
  //   this.bookService.loadBooks().subscribe(booksResponse => {
  //     this.quizQuestionService.loadAllQuizQuestions().subscribe(quizQuestions => {
        
  //       this.books = booksResponse.data.map((book: any) => {
  //         const matchingQuiz = quizQuestions.find((quizObj: any) => quizObj.quiz.name === book.title);
          
  //         if (matchingQuiz) {
  //           book.quiz = matchingQuiz.quiz;
  //           book.questions = quizQuestions
  //             .filter((q: any) => q.quiz.id === matchingQuiz.quiz.id)
  //             .map((q: any) => q.question);
  //         } else {
  //           book.questions = []; // Testi yo‘q kitoblar uchun bo‘sh array
  //         }
          
  //         return book;
  //       });
  
  //       // Faqat testi bor kitoblarni olish
  //       this.books = this.books.filter(book => book.questions.length > 0);

  //       this.filteredBooks = [...this.books];
  
  //       console.log("Testi bor kitoblar:", this.books);
  //     });
  //   });
  // }
  loadBooks() {
    this.bookService.loadBooks().subscribe(booksResponse => {
      this.quizQuestionService.loadAllQuizQuestions().subscribe(quizQuestions => {
        this.books = booksResponse.data.map((book: any) => {
          const matchingQuiz = quizQuestions.find((quizObj: any) => quizObj.quiz.name === book.title);
          book.quiz = matchingQuiz ? matchingQuiz.quiz : null;
          book.questions = matchingQuiz
            ? quizQuestions.filter((q: any) => q.quiz.id === matchingQuiz.quiz.id).map((q: any) => q.question)
            : [];
          return book;
        });

        this.books = this.books.filter(book => book.questions.length > 0);
        this.filteredBooks = [...this.books]; // Boshlang‘ich holatda barcha kitoblar chiqadi
      });
    });
  }
  
  updateFilteredBooks(query: string) {
    if (!query?.trim()) {
      this.filteredBooks = [...this.books];
    } else {
      this.filteredBooks = this.books.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.cdRef.detectChanges(); // <--- UI ni yangilash
  }
  

  startTest(book: any) {
    const dialogRef = this.dialog.open(StartQuizDialogComponent, {
      width: '600px',
      data: { book }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'start') {
        this.dialog.open(BeginQuizComponent, {
          width: '100vw',
          height: '100vh',
          hasBackdrop: false,
          disableClose: true, 
          position: { top: '0', left: '0' }, 
          data: { book }
        });
      }
    });
  }
}
