import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { MatDialog } from '@angular/material/dialog';
import { BookDialogComponent } from '../book-dialog/book-dialog.component';
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-content',
  templateUrl: './book-content.component.html',
  styleUrls: ['./book-content.component.scss']
})
export class BookContentComponent implements OnInit{

  books: Book [] = [];
  selectedIndex = 0;
  userRole: string | null

  constructor(private bookService: BookService,
    private dialog: MatDialog
  ){
    const userRole = localStorage.getItem('role');
    let parseUserRole = null;
    if(userRole != null){
      parseUserRole = JSON.parse(userRole)
    }
   
    this.userRole = parseUserRole
  }

  ngOnInit(): void {
    this.loadBooks()
  }

  loadBooks(){
    this.bookService.loadBooks().subscribe(data=>{
      this.books = data.data;
    })
  }

  openDialog(isEdit: boolean, selectedIndex?:number): void{
    let book: any = null;
    if(isEdit && selectedIndex !== undefined){
      book = this.books[selectedIndex];
      // console.log('from dialog', book);
    }
    const dialogRef = this.dialog.open(BookDialogComponent,{
      data: {
        book: book,        
        isEdit: isEdit
      },
    });
    dialogRef.afterClosed().subscribe(()=>{
      this.loadBooks()
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
