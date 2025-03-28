import { QuizzesService } from './../services/quizzes.service';
import { Component, OnInit } from '@angular/core';
import { QuizQustionService } from '../services/quiz-qustion.service';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { QuizDialogComponent } from './quiz-dialog/quiz-dialog.component';
import { StartQuizDialogComponent } from './start-quiz-dialog/start-quiz-dialog.component'
import { UserService } from 'src/app/core/core/services/user.service'
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.scss']
})
export class QuizzesComponent implements OnInit{

  quizzes: any[] = [];
  questions: any[] = [];
  currentQuizId!: number | null;
  currentQuestionIndex = 0;
  timer: any;
  countdown = 30;
  correctAnswers = 0;
  incorrectAnswers = 0;
  quizResult: any;
  selectedAnswer: string | null = null; 
  checkStatusQuiz: boolean = false;

  
  constructor(private quizService: QuizzesService,
    private location: Location, private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.loadAllQuizzes();   
  }

  goBack(){
    this.location.back();
  }

  loadAllQuizzes(): void {
    this.quizService.loadAllQuizzes().subscribe((quizzes: any) => {
      this.quizzes = quizzes;
      console.log(quizzes, 'testt');
    });
  }


openDialog(isEdit: boolean, selectIndex?: number){
  let quiz: any  = null;
  if(isEdit && selectIndex !== undefined){
    quiz = this.quizzes[selectIndex]
    console.log(quiz);
  }
  const dialogRef = this.dialog.open(QuizDialogComponent,{
    data:{
      quiz: quiz,
      isEdit: isEdit
    },
  })
  dialogRef.afterClosed().subscribe(()=>{
    this.loadAllQuizzes()
  })
}

  confirmDelete(id:number){
    const dialogRef = this.dialog.open(ConfirmDeleteComponent,{
      width: '280px',
      height: '175px',
      data: {
        id: id,
        message: "Ushbu viktorinani o'chirishga ishonchingiz komilmi?"
      }
    });
    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        this.deleteQuiz(id);
      }
    })
  }

  deleteQuiz(id:number){
    this.quizService.deleteQuiz(id).subscribe(()=>{
      this.loadAllQuizzes();
    });
  }

}
