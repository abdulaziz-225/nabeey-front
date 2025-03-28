import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent{

  @Input() articles: any;
  @Output() delete = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();

  userRole!: string | null
  isOpened = false;
  
  constructor(){
    const userRole = localStorage.getItem('role');
    let parseUserRole = null;
    if(userRole != null){
      parseUserRole = JSON.parse(userRole)
    }
   
    this.userRole = parseUserRole
  }

  isOpen(){
    if(this.isOpened){
      this.isOpened = false
    }else{
      this.isOpened =true
    }
  }

  onDelete() {
    this.delete.emit(this.articles);
  }

  onEdit() {
    this.edit.emit(this.articles)
  }
  

}
