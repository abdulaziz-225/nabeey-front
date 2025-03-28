import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PrimaryPageComponent } from './primary-page/primary-page.component';


@NgModule({
  declarations: [
    LoginComponent,
    SignUpComponent,
    HomeComponent,
    NavbarComponent,
    PrimaryPageComponent,
  ],
  imports: [
    CommonModule,
    SharedModule, 
    NgxMaskDirective,
  ],
  exports: [
    LoginComponent,
    HomeComponent
  ],
  providers: [
    provideNgxMask(),
  ]
})
export class CoreModule { }
