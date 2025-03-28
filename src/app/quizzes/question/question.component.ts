import { QuizQuestions } from './../models/quiz-question';
import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '../services/questions.service';
import { MatDialog } from '@angular/material/dialog';
import { QuestionDialogComponent } from './question-dialog/question-dialog.component';
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';
import { AnswerDialogComponent } from './answer-dialog/answer-dialog.component';
import { QuizQuestionsDialogComponent } from './quiz-questions-dialog/quiz-questions-dialog.component';
import { QuizQustionService } from '../services/quiz-qustion.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit{

  questions: any;
  hidden: boolean = false;
  selectedIndex: number = 0;


  colors = ['border-green-500', 'border-blue-500', 'border-black'];

  constructor(private questionService: QuestionsService,
    private dialog: MatDialog,
    private quizQuestionService: QuizQustionService
  ){}

  ngOnInit(): void {
    this.loadAllQuestions();
    
  } 
  
  loadAllQuestions() {
    this.questionService.loadAllQuestions().pipe(
      switchMap(questionsData => {
        this.questions = questionsData;
        return this.quizQuestionService.loadAllQuizQuestions();
      })
    ).subscribe(quizQuestions => {
      console.log(quizQuestions, 'test test test');
      
      
      const quizMap = new Map(quizQuestions.map((quizQuestion: any) => [quizQuestion.question.id, quizQuestion]));
  
      this.questions.forEach((question: any) => {
        question.linkedQuiz = quizMap.get(question.id) || null;
        console.log(question, 'nima kevoti?');
        
      });
    });
  }
  
   getBorderColor(index: number): string {
        return this.colors[index % this.colors.length];
    }

  openDialog(isEdit: boolean, question?:string){
    if(!question){
      question = this.questions[this.selectedIndex]
    }
    const dialogRef = this.dialog.open(QuestionDialogComponent,{
      data:{
        question: question,
        isEdit: isEdit
      },
        width: '400px',
      height: '230px'
    });
    dialogRef.afterClosed().subscribe(()=>{

      this.loadAllQuestions()
    })

  };

  deleteQuizQuestions(id:number){
    this.quizQuestionService.quizQuestionDelete(id).subscribe(()=>{
      this.loadAllQuestions()
    })
  }

  confirmQuizQuestionDelete(id:number){
    const dialogRef = this.dialog.open(ConfirmDeleteComponent,{
      width: '300px',
      height: '205px',
      data: {
        id: id,
        message: "Ushbu savolni quizdan o'chirishga ishonchingiz komilmi?"
      }
    });
    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        this.deleteQuizQuestions(id);
      }
    })
  }

  confirmDelete(id:number){
    const dialogRef = this.dialog.open(ConfirmDeleteComponent,{
      width: '280px',
      height: '175px',
      data: {
        id: id,
        message: "Ushbu savolni o'chirishga ishonchingiz komilmi?"
      }
    });
    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        this.deleteQuestion(id);
      }
    })
  }

  deleteQuestion(id:number){
    this.questionService.deleteQuestion(id).subscribe(()=>{
      this.loadAllQuestions();
    });
  }

  openAnswerDialog(questionId:number, isEdit: boolean, answerIndex?: number): void {
    localStorage.setItem('selectedQuestionId', questionId.toString());
    const selectedQuestion = this.questions.find((q:any) => q.id === questionId);

    const answer = (isEdit && answerIndex !== undefined) ? selectedQuestion?.answers[answerIndex] : null;
    console.log(answer);
    
    const dialogRef = this.dialog.open(AnswerDialogComponent, {
      data: {
        isEdit: isEdit,
        answer: answer
      },
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadAllQuestions()
    });
  }

  openQuizquestionDialog(questionId: number){
   localStorage.setItem('selectedQuestionId', questionId.toString())
    const dialogRef = this.dialog.open(QuizQuestionsDialogComponent, {
      width: '450px',
    });
    
    dialogRef.afterClosed().subscribe(() => {
      this.loadAllQuestions()
    });
  }

}
