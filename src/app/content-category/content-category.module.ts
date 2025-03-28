import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared/shared.module';
import { CategoryComponent } from './category/category.component';
import { CoreModule } from '../core/core/core.module';
import { CategoryDialogComponent } from './category/category-dialog/category-dialog.component';
import { ArticleComponent } from './article/article.component';
import { ArticleDialogComponent } from './article/article-dialog/article-dialog.component';
import { ArticleContentComponent } from './article/article-content/article-content.component';
import { VideoPlayerComponent } from './category/video-player/video-player.component';
import { ContentVideoComponent } from './category/content-video/content-video.component';
import { VideoDialogComponent } from './category/content-video/video-dialog/video-dialog.component';
import { BookComponent } from './book/book.component';
import { BookContentComponent } from './book/book-content/book-content.component';
import { BookDialogComponent } from './book/book-dialog/book-dialog.component';
import { CategoryContentComponent } from './category/category-content/category-content.component';



@NgModule({
  declarations: [
    CategoryComponent,
    CategoryDialogComponent,
    ArticleComponent,
    ArticleDialogComponent,
    ArticleContentComponent,
    VideoPlayerComponent,
    ContentVideoComponent,
    VideoDialogComponent,
    BookComponent,
    BookContentComponent,
    BookDialogComponent,
    CategoryContentComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CoreModule
  ],
  exports: [
    ArticleComponent,
    CategoryComponent
  ]
})
export class ContentCategoryModule { }
