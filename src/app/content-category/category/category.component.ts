import { Component, inject, OnInit } from '@angular/core';
import { ContentCategoryService } from '../services/content-category.service';
import { MatDialog } from '@angular/material/dialog';
import { ArticleService } from '../services/article.service';
import { Article, DetailedArticle } from '../models/article';
import { BookService } from '../services/book.service';
import { BookDialogComponent } from '../book/book-dialog/book-dialog.component';
import { Book } from '../models/book';
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';
import { ArticleDialogComponent } from '../article/article-dialog/article-dialog.component';
import { VideoService } from '../services/video.service';
import { Category } from '../models/category';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html'
})
export class CategoryComponent implements OnInit{

  contentCategories:Category[] = [];
  articles: DetailedArticle[] = [];
  books: Book [] = [];
  visibleContent: string | null = 'all';


  constructor(private categoryService: ContentCategoryService,
    public dialog: MatDialog, private articleService: ArticleService,
    private videoService: VideoService,
    private bookService: BookService,
  ){}


  ngOnInit(): void {
    this.loadCategories();
    this.loadArticles();
    this.loadBooks()
  } 

  loadCategories(){
    this.categoryService.loadContentCategory().subscribe(data=>{
      this.contentCategories = data;
    })
  }

  loadArticles(){
    this.articleService.loadArticles().subscribe(data=>{
      this.articles = data.data;
    })
  }

  loadBooks(){
    this.bookService.loadBooks().subscribe(data=>{
      this.books = data.data;
    })
  }

  filteredArticleByCategory(categoryName:string): DetailedArticle[]{
    return this.articles.filter((article) => article.category.name === categoryName)
  }
  
  setVisibleContent(content: string) {
    if (this.visibleContent === content) {
      this.visibleContent = null; 
    } else {
      this.visibleContent = content; 
    }
  }

  showAllContent() {
    this.visibleContent = 'all';
  }

  openBookDialog(isEdit: boolean, selectedIndex?:number): void{
    let book: any = null;
    if(isEdit && selectedIndex !== undefined){
      book = this.books[selectedIndex];

      console.log('from dialog', book);
      
    }
    const dialogRef = this.dialog.open(BookDialogComponent,{
      data: {
        book: book,        
        isEdit: isEdit
      },
    });
    dialogRef.afterClosed().subscribe(()=>{
      this.loadBooks();
      this.loadCategories()
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

  deleteCategory(id:number){
    this.categoryService.deleteCategory(id).subscribe({
      next:()=>{
        this.loadCategories()
      }
    })
  }

  confirmArticleDelete(id:number){
    const dialogRef = this.dialog.open(ConfirmDeleteComponent,{
      width: '280px',
      height: '175px',
      data: {
        id: id,
        message: "Ushbu maqolani o'chirishga ishonchingiz komilmi?"
      }
    });
    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        this.deleteArticle(id)
      }
    })
  }

  deleteArticle(id:number){
    this.articleService.deleteArticle(id).subscribe(()=>{
      this.loadArticles();
    })
  }

  openArticleDialog(isEdit: boolean, selectedIndex?:number){
    let article: any = null;
    if(isEdit&& selectedIndex !== undefined){
      article = this.articles[selectedIndex];
    }
  const dialogRef = this.dialog.open(ArticleDialogComponent,{
    width: "330px",
    data: {
      article: article,
      isEdit: isEdit
    }
  });
  dialogRef.afterClosed().subscribe(()=>{
    this.loadArticles()
  })
}

confirmVideoDelete(id:number){
  const dialogRef = this.dialog.open(ConfirmDeleteComponent,{
    width: '280px',
    height: '175px',
    data: {
      id: id,
      message: "Ushbu videoni o'chirishga ishonchingiz komilmi?"
    }
  });
  dialogRef.afterClosed().subscribe(res=>{
    if(res){
      this.deletevideo(id)
    }
  })
}

deletevideo(id:number){
  this.videoService.deleteVideo(id).subscribe(()=>{
    this.loadCategories();
  })
}

}
