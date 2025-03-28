import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared/shared.module';
import { CoreModule } from "./core/core/core.module";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfileModule } from './profile/profile.module';
import { ContentCategoryModule } from './content-category/content-category.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';





@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    AppRoutingModule,
    CoreModule,
    ProfileModule,
    QuizzesModule,
    ContentCategoryModule,
],
  providers: [
    // { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { disableClose: true, hasBackdrop: false } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
