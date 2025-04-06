import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Book } from '../models/book';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent {
  @Input() book!: Book;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  userRole!: string | null;
  expandedBookId: number | null = null;

  
  constructor(){
    const userRole = localStorage.getItem('role');
    let parseUserRole = null;
    if(userRole != null){
      parseUserRole = JSON.parse(userRole)
    }
    
    this.userRole = parseUserRole
    
  }

  toggleDescription(bookId: number) {
    this.expandedBookId = this.expandedBookId === bookId ? null : bookId;
  }
  
  onEdit() {
    this.edit.emit(this.book);
  }

  onDelete() {
    this.delete.emit(this.book);
  }

}
