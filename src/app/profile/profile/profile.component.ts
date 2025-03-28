import { ConfirmDeleteComponent } from './../../shared/shared/confirm-delete/confirm-delete.component';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/core/services/user.service';
import { Location } from '@angular/common';
import {  USerr } from 'src/app/core/core/models/user';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { ArticleService } from 'src/app/content-category/services/article.service';
import { ArticleDialogComponent } from 'src/app/content-category/article/article-dialog/article-dialog.component';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  profiles!: USerr;
  articles:any
  selectedIndex: number = 0;



  constructor(private userService: UserService,
    private articleService: ArticleService,
    private location: Location,
    private dialog: MatDialog
  ){}

  ngOnInit(): void {
    this.getUserById();
    this.getArticleByUser();
    
  }

  goBack(){
    this.location.back();
  }

  getUserById(){
    const userId = localStorage.getItem('userId')
    let parseUserId = null
    if(userId != null){
      parseUserId = JSON.parse(userId)
    }

    this.userService.getUserById(parseUserId).subscribe((response) => {
      this.profiles = response;
      console.log(this.profiles);
      
      if (response.asset && response.asset.filePath) {
          this.profiles.asset = response.asset; 
      } else {
          this.profiles.asset = { 
              filePath: 'assets/Default_pfp.svg.png', 
              // fileName: 'Default_pfp.svg.png'
          };
      }
  });
  
  }

  getArticleByUser(){
    const userId = localStorage.getItem('userId')
    let parseUserId = null
    if(userId != null){
      parseUserId = JSON.parse(userId)
    }

    this.articleService.loadArticleByUser(parseUserId).subscribe(data => {
      this.articles = data.data.map((article:any) => {
        
        if (article.image && article.image.filePath) {
          article.image.filePath = article.image.filePath;
        } else {
          article.image = { filePath: '../../../assets/Default_pfp.svg.png' }; 
        }
        return article; 
      });
    });
  }

  deleteArticle(id:number){
    this.articleService.deleteArticle(id).subscribe({
      next:()=>{
        this.getArticleByUser()
      }
    })
  }

  confirmDeleteArticle(id:number){
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

  openDialog(): void {
    const dialogRef = this.dialog.open(ProfileDialogComponent, {
      width: '550px',
      height: '500px  ',
      data: { profile: this.profiles 
        
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.profiles = result;
      }
      this.getUserById()
    });
  }

  editDialog(isEdit: boolean, article?: string) {
    if (!article) {
      article = this.articles[this.selectedIndex];  
    }
    
    const dialogRef = this.dialog.open(ArticleDialogComponent, {
      data: {
        article: article,
        isEdit: isEdit
      },
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getArticleByUser();
      }
    });
  }
  
  
}
