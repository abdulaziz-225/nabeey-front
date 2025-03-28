import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionComponent } from './question/question.component';
import { CoreModule } from '../core/core/core.module';
import { SharedModule } from '../shared/shared/shared.module';
import { QuestionDialogComponent } from './question/question-dialog/question-dialog.component';
import { AnswerDialogComponent } from './question/answer-dialog/answer-dialog.component';
import { QuizQuestionsDialogComponent } from './question/quiz-questions-dialog/quiz-questions-dialog.component';
import { QuizzesComponent } from './quizzes/quizzes.component';
import { QuizDialogComponent } from './quizzes/quiz-dialog/quiz-dialog.component';
import { StartQuizDialogComponent } from './quizzes/start-quiz-dialog/start-quiz-dialog.component';
import { FinishQuizDialogComponent } from './quizzes/finish-quiz-dialog/finish-quiz-dialog.component';
import { BeginQuizComponent } from './quizzes/start-quiz-dialog/begin-quiz/begin-quiz.component';
import { ScoreDialogComponent } from './quizzes/start-quiz-dialog/score-dialog/score-dialog.component';



@NgModule({
  declarations: [
    QuestionComponent,
    QuestionDialogComponent,
    AnswerDialogComponent,
    QuizQuestionsDialogComponent,
    QuizzesComponent,
    QuizDialogComponent,
    StartQuizDialogComponent,
    FinishQuizDialogComponent,
    BeginQuizComponent,
    ScoreDialogComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    SharedModule
  ]
})
export class QuizzesModule { }
