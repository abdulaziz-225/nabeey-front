import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { MatDialog } from '@angular/material/dialog';
import { ArticleDialogComponent } from '../article-dialog/article-dialog.component';
import { DetailedArticle } from '../../models/article';
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-article-content',
  templateUrl: './article-content.component.html',
  styleUrls: ['./article-content.component.scss']
})
export class ArticleContentComponent implements OnInit{

  articles: DetailedArticle [] = [];
  isOpened = false


  constructor(private articleService: ArticleService,
    private dialog: MatDialog
  ){}

  ngOnInit(): void {
    this.loadArticles()
  }

  loadArticles(){
    this.articleService.loadArticles().subscribe(data=>{
      this.articles = data.data;
      console.log(this.articles);
      
    })
  }

      openDialog(isEdit: boolean, selectedIndex?:number){
        let article: DetailedArticle | null = null;
        if(isEdit && selectedIndex !== undefined){
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

} 
