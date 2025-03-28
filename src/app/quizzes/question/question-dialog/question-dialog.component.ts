import { Component, Inject, OnInit,  } from '@angular/core';
import { QuestionsService } from '../../services/questions.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-question-dialog',
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss']
})
export class QuestionDialogComponent implements OnInit{

  questionForm!: FormGroup;
  isEdit: boolean
  question: any

  constructor(private questionService: QuestionsService, private dialogRef: MatDialogRef<QuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder
  ){
    this.isEdit = data.isEdit;
    this.question = data.question;
  }

  ngOnInit(): void {
    this.formBuilder();

    if(this.isEdit && this.question?.id){
      this.questionForm.patchValue(this.question)
    }
  }

  formBuilder(){
    this.questionForm = this.fb.group({
      id: [this.question.id],
      text: ['', Validators.required]
    })
  }

  save(){
    if(this.questionForm.valid){
      const questionFormValue =  this.questionForm.value

      if(this.isEdit && this.question.id){
        this.questionService.updateQuestions(questionFormValue).subscribe(()=>{
          this.dialogRef.close(true)
        });
      } else{
        this.questionService.createQuestions(questionFormValue).subscribe(()=>{
          this.dialogRef.close()
        })
      }
    }
  }

  onClose(){
    this.dialogRef.close()
  }


}
