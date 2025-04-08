import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/core/login/login.component';
import { AuthGuard } from './core/core/guards/auth.guard';
import { ProfileComponent } from './profile/profile/profile.component';
import { CategoryComponent } from './content-category/category/category.component';
// import { ArticleComponent } from './content-category/article/article.component';
import { ArticleContentComponent } from './content-category/article/article-content/article-content.component';
import { ContentVideoComponent } from './content-category/category/content-video/content-video.component';
import { BookContentComponent } from './content-category/book/book-content/book-content.component';
import { CategoryContentComponent } from './content-category/category/category-content/category-content.component';
import { QuestionComponent } from './quizzes/question/question.component';
import { QuizzesComponent } from './quizzes/quizzes/quizzes.component';
import { PrimaryPageComponent } from './core/core/primary-page/primary-page.component';
import { EncourageComponent } from './core/core/encourage/encourage.component';

const routes: Routes = [
  {
    path: '', component: LoginComponent, pathMatch: 'full'
  },
  { path: 'login', component: LoginComponent  },
  // {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  {path: 'category', component: CategoryComponent, canActivate: [AuthGuard]},
  {path: 'article', component: ArticleContentComponent, canActivate: [AuthGuard]},
  // {path: 'videos', component: ContentVideoComponent, canActivate: [AuthGuard]},
  {path: 'categories', component: CategoryContentComponent, canActivate: [AuthGuard]},
  {path: 'books', component: BookContentComponent, canActivate: [AuthGuard]},
  {path: 'questions', component: QuestionComponent, canActivate: [AuthGuard]},
  {path: 'quiz', component: QuizzesComponent, canActivate: [AuthGuard]},
  {path: 'home', component: PrimaryPageComponent, canActivate: [AuthGuard]},
  {path: 'encourage', component: EncourageComponent, canActivate: [AuthGuard]},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
 }
