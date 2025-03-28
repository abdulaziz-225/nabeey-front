import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuizzesService } from '../../services/quizzes.service';
import { QuizQustionService } from '../../services/quiz-qustion.service';

@Component({
  selector: 'app-quiz-questions-dialog',
  templateUrl: './quiz-questions-dialog.component.html',
  styleUrls: ['./quiz-questions-dialog.component.scss']
})
export class QuizQuestionsDialogComponent implements OnInit{

  qQuestionForm!: FormGroup;
  quizzes: any[] = []

  constructor(private dialogRef: MatDialogRef<QuizQuestionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any, private fb: FormBuilder, private qQuestionService: QuizzesService,
    private quizQuestionService: QuizQustionService
  ){
  }

  ngOnInit(): void {
    this.formBuilder();
    this.loadQuizzes()
  }

  formBuilder(){
    this.qQuestionForm = this.fb.group({
      quizId: ['', Validators.required],
      questionId: [localStorage.getItem('selectedQuestionId')],
    })
  }

  loadQuizzes(){
    this.qQuestionService.loadAllQuizzes().subscribe(data=>{
      this.quizzes = data;
      
    })
  }

  createQQuestion(){
    if(this.qQuestionForm.valid){
      const qQuestionFormValue = this.qQuestionForm.value;

      this.quizQuestionService.createQuizQuestions(qQuestionFormValue).subscribe(()=>{
        this.dialogRef.close()
      })
      
    }
  };

  onClose(){
    this.dialogRef.close()
  }
}
