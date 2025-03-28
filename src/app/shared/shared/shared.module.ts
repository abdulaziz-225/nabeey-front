import { MatInputModule } from '@angular/material/input';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpInterceptorService } from './interceptors/api.interceptor';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { FormatePhonePipe } from './pipes/formate-phone.pipe';
import { AuthHttpInterceptor } from 'src/app/core/core/services/api.interceptor';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import { MatCardModule} from '@angular/material/card';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { ConfirmDeleteComponent } from './confirm-delete/confirm-delete.component';

// import { MatToolbarModule } from '@angular/material/toolbar'



@NgModule({
  declarations: [
    FormatePhonePipe,
    SafeUrlPipe,
    ConfirmDeleteComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatInputModule,
    HttpClientModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    // MatToolbarModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatInputModule,
    HttpClientModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatRippleModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
    ConfirmDeleteComponent,
    [SafeUrlPipe]

    // MatToolbarModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true },
    { provide:  HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },

    { provide: FormatePhonePipe},
    [SafeUrlPipe]
    

  ]
})
export class SharedModule { }
