import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PrimaryPageComponent } from './primary-page/primary-page.component';
import { FooterComponent } from './footer/footer.component';
import { LayoutComponent } from './layout/layout.component';
import { AboutModalComponent } from './footer/aboutModal.component';
import { ProgressButtonComponent } from 'src/app/quizzes/quizzes/start-quiz-dialog/progress-button/progress-button.component';
import { EncourageComponent } from './encourage/encourage.component';
import { ChatbotWidgetComponent } from './chatbot/chatbot-widget/chatbot-widget.component';
import { ChatAdminComponent } from './chatbot/chat-admin/chat-admin.component';
import { ChatChoiceDialogComponent } from './chatbot/chat-choice-dialog/chat-choice-dialog.component';
import { AiChatComponent } from './chatbot/ai-chat/ai-chat.component';


@NgModule({
  declarations: [
    LoginComponent,
    SignUpComponent,
    HomeComponent,
    NavbarComponent,
    PrimaryPageComponent,
    FooterComponent,
    LayoutComponent,
    AboutModalComponent,
    ProgressButtonComponent,
    EncourageComponent,
    ChatbotWidgetComponent,
    ChatAdminComponent,
    ChatChoiceDialogComponent,
    AiChatComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgxMaskDirective,

  ],
  exports: [
    LoginComponent,
    HomeComponent,
    LayoutComponent,
    FooterComponent,
    ChatbotWidgetComponent,
    ChatAdminComponent
  ],
  providers: [
    provideNgxMask(),
  ]
})
export class CoreModule { }
