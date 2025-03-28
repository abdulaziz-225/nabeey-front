import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnswersService } from '../../services/answers.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-answer-dialog',
  templateUrl: './answer-dialog.component.html',
  styleUrls: ['./answer-dialog.component.scss']
})

export class AnswerDialogComponent implements OnInit{
  answerForm!: FormGroup;
  isEdit: boolean;
  answer:any

  constructor(
    private fb: FormBuilder, private dialog: MatDialog,
    private dialogRef: MatDialogRef<AnswerDialogComponent>,
    private answerService: AnswersService,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {  
    this.isEdit = data.isEdit;
    this.answer = data.answer
  }

  ngOnInit(): void {
    this.formBuilder();
    if(this.isEdit && this.answer?.id){
      this.answerForm.patchValue(this.answer)
    }
  }

  formBuilder(){
    this.answerForm = this.fb.group({
      id: [this.answer?.id],
      text: ['', Validators.required],
      questionId: [localStorage.getItem('selectedQuestionId')],
      isTrue: [false]
    });
  }

  createAnswer(){
    if(this.answerForm.valid){
      const answerFormValue = this.answerForm.value;

      console.log(answerFormValue);

      if(this.isEdit && this.answer?.id){
        this.answerService.updateAnswer(answerFormValue).subscribe(
          () => {
            this.dialogRef.close();
          },
        )
      }else{
        this.answerService.createAnswer(answerFormValue).subscribe(
          () => {
            this.dialogRef.close();
          },
        );
      }

      
    }
  }

  onDelete(id:number){
    this.answerService.deleteAnswer(id).subscribe(()=>{
        this.dialogRef.close()
    })
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
