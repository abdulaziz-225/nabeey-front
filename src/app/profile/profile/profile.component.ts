import { ConfirmDeleteComponent } from './../../shared/shared/confirm-delete/confirm-delete.component';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/core/services/user.service';
import { Location } from '@angular/common';
import {  USerr } from 'src/app/core/core/models/user';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { ArticleService } from 'src/app/content-category/services/article.service';
import { ArticleDialogComponent } from 'src/app/content-category/article/article-dialog/article-dialog.component';
import { ProfileActivity, ProfileActivityService } from './profile-activity.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  profiles?: USerr;
  articles: any[] = [];
  activity?: ProfileActivity;
  activityLoading = true;
  activityError = false;
  activeHistoryTab: 'quizzes' | 'ai' | 'expert' | 'articles' = 'quizzes';
  expandedAiSessionId: string | null = null;
  expandedExpertConversationId: number | null = null;
  selectedIndex: number = 0;



  constructor(private userService: UserService,
    private articleService: ArticleService,
    private profileActivityService: ProfileActivityService,
    private location: Location,
    private dialog: MatDialog
  ){}

  ngOnInit(): void {
    this.getUserById();
    this.getArticleByUser();
    this.loadActivity();
    
  }

  loadActivity(): void {
    this.activityLoading = true;
    this.activityError = false;
    this.profileActivityService.getActivity().subscribe({
      next: activity => {
        this.activity = activity;
        this.activityLoading = false;
      },
      error: () => {
        this.activityError = true;
        this.activityLoading = false;
      }
    });
  }

  setHistoryTab(tab: 'quizzes' | 'ai' | 'expert' | 'articles'): void {
    this.activeHistoryTab = tab;
  }

  toggleAiSession(sessionId: string): void {
    this.expandedAiSessionId = this.expandedAiSessionId === sessionId ? null : sessionId;
  }

  toggleExpertConversation(conversationId: number): void {
    this.expandedExpertConversationId = this.expandedExpertConversationId === conversationId ? null : conversationId;
  }

  firstUserMessage(messages: { isFromAdmin: boolean; text: string }[]): string {
    return messages.find(message => !message.isFromAdmin)?.text || 'Suhbat';
  }

  firstAiQuestion(turns: { question: string }[]): string {
    return turns[0]?.question || 'AI suhbati';
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
      const profile = response as USerr;
      this.profiles = profile;
      
      if (profile.asset && profile.asset.filePath) {
        profile.asset = profile.asset;
      } else {
        profile.asset = {
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
