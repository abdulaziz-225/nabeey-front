import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BookService } from 'src/app/content-category/services/book.service';
import { QuizQustionService } from 'src/app/quizzes/services/quiz-qustion.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ArticleService } from 'src/app/content-category/services/article.service';
import { DetailedArticle } from 'src/app/content-category/models/article';
import { ContentCategoryService } from 'src/app/content-category/services/content-category.service';
import { BookRatingService } from 'src/app/content-category/services/book-rating.service';
import { BookStat } from 'src/app/content-category/models/book-comment';
import { QuizAttemptService } from 'src/app/quizzes/services/quiz-attempt.service';
import { QuizLauncherService } from 'src/app/quizzes/services/quiz-launcher.service';

@Component({
  selector: 'app-primary-page',
  templateUrl: './primary-page.component.html',
  styleUrls: ['./primary-page.component.scss']
})
export class PrimaryPageComponent implements OnInit{

  books: any[] = [];
  articles: DetailedArticle [] = [];
  filteredBooks: any[] = [];
  searchControl = new FormControl('');
  expandedBookId: number | null = null;
  currentBookPage: number = 1;
  itemsPerPageBooks: number = 6;
  currentArticlePage: number = 1;
  itemsPerPageArticles: number = 3;
  paginatedBooks: any[] = [];
  contentCategories: any[] = [];
  paginatedArticles: DetailedArticle[] = [];
  selectedCategory: string = '';
  totalScore: number = 0;
  intervalId: any;
  stats: Record<number, BookStat> = {};

  
  constructor(private bookService: BookService, private quizQuestionService: QuizQustionService,
    private dialog: MatDialog, private articleService: ArticleService, private contentCategoriesService: ContentCategoryService,
    private bookRatingService: BookRatingService,
    private quizAttemptService: QuizAttemptService,
    private quizLauncher: QuizLauncherService,
  ){

  }

  // userProgress = {
  //   totalScore: 0,
  //   completedBooks: new Set<number>(),
  // };

  get totalBookPages(): number {
    return Math.ceil(this.filteredBooks.length / this.itemsPerPageBooks);
  }
  get totalBookPagesArray(): number[] {
    return Array(this.totalBookPages).fill(0).map((_, i) => i + 1);
  }

  get totalArticlePages(): number {
    return Math.ceil(this.articles.length / this.itemsPerPageArticles);
  }


  get totalArticlePagesArray(): number[] {
    return Array(this.totalArticlePages).fill(0).map((_, i) => i + 1);
  }

  toggleDescription(bookId: number) {
    this.expandedBookId = this.expandedBookId === bookId ? null : bookId;
  }

  ngOnInit(): void {
    this.loadBooks();
    this.loadAllArticles()
    this.loadContentCategories()
    this.loadStats();
    
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      console.log("Qidiruv qiymati:", value);
      this.updateFilteredBooks(value || ''); 
    });


  }
  
  loadContentCategories(){
    this.contentCategoriesService.loadContentCategory().subscribe(data=>{
      this.contentCategories = data
      console.log(this.contentCategories);
      
    })
  }
  
  
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
        this.filteredBooks = [...this.books]; 
        this.updatePaginatedBooks();
        this.updatePaginatedArticles();
        this.resumeQuizIfAny();
        
      });
    });
  }

  loadStats() {
    this.bookRatingService.getStats('all').subscribe({
      next: list => this.stats = Object.fromEntries(list.map(st => [st.bookId, st])),
      error: () => {}
    });
  }

  loadAllArticles(){
    this.articleService.loadArticles().subscribe(articles=>{
      this.articles = articles.data;
      this.updatePaginatedArticles();
    })
  }

  toggleCategory(categoryName: string) {
    if (this.selectedCategory === categoryName) {
      this.selectedCategory = ''; // Agar bosilgan bo‘lsa, tozalaymiz
    } else {
      this.selectedCategory = categoryName; // Yangi kategoriya tanlaymiz
    }
  
    this.filterBooksByCategory();
  }
  

  // ✅ Ushbu category tanlanganmi yo‘qmi tekshiradi
  // isSelected(categoryName: string): boolean {
  //   return this.selectedCategories.includes(categoryName);
  // }
  isSelected(categoryName: string): boolean {
    return this.selectedCategory === categoryName;
  }
  

  // ✅ Kitoblarni tanlangan kategoriyalar bo‘yicha filtrlash
  // filterBooksByCategory() {
  //   if (this.selectedCategories.length === 0) {
  //     this.filteredBooks = [...this.books];
  //   } else {
  //     this.filteredBooks = this.books.filter(book =>
  //       this.selectedCategories.includes(book.quiz.contentCategory.name)
  //     );
  //   }

  //   this.updatePaginatedBooks();
  // }
  filterBooksByCategory() {
    if (!this.selectedCategory) {
      this.filteredBooks = [...this.books];
    } else {
      this.filteredBooks = this.books.filter(book =>
        book.quiz.contentCategory.name === this.selectedCategory
      );
    }
  
    this.updatePaginatedBooks();
  }
  
  
  updateFilteredBooks(query: string) {
    if (!query?.trim()) {
      this.filteredBooks = [...this.books];
      
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredBooks = this.books.filter(book =>
        (book.title?.toLowerCase().includes(lowerQuery)) ||
        (book.author?.toLowerCase().includes(lowerQuery))
      );
    }
    this.currentArticlePage = 1;
    this.currentBookPage = 1;
    this.updatePaginatedBooks();
  }
  
  
  changeBookPage(page: number) {
    this.currentBookPage = page;
    this.updatePaginatedBooks();
  }

  changeArticlePage(page: number) {
    this.currentArticlePage = page;
    this.updatePaginatedArticles();
  }
  
  updatePaginatedBooks() {
    const startIndex = (this.currentBookPage - 1) * this.itemsPerPageBooks;
    const endIndex = startIndex + this.itemsPerPageBooks;
    this.paginatedBooks = this.filteredBooks.slice(startIndex, endIndex);
  }
  

  updatePaginatedArticles() {
    const startIndex = (this.currentArticlePage - 1) * this.itemsPerPageArticles;
    const endIndex = startIndex + this.itemsPerPageArticles;
    this.paginatedArticles = this.articles.slice(startIndex, endIndex);
  }
  

  // Test paytida sahifa yangilangan bo'lsa, serverdagi tugallanmagan urinishni davom ettiramiz
  private resumeQuizIfAny() {
    if (!localStorage.getItem('accessToken')) return;

    this.quizAttemptService.getActive().subscribe({
      next: attempt => {
        if (!attempt) return;
        this.quizLauncher.resume(attempt, this.books.find(b => b.id === attempt.bookId)).subscribe();
      },
      error: () => {}
    });
  }

  scrollToKitobxon() {
    const element = document.getElementById('kitobxon');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  

  
}
