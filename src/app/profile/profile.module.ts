import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../shared/shared/shared.module';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { ContentCategoryModule } from '../content-category/content-category.module';



@NgModule({
  declarations: [
    ProfileComponent,
    ProfileDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgxMaskDirective,
    ContentCategoryModule
  ],
  providers: [
    provideNgxMask(),

  ]
})
export class ProfileModule { }
