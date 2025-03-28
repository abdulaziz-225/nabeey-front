import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuizzesService } from '../../services/quizzes.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Quiz } from '../../models/quiz';
import { ContentCategoryService } from 'src/app/content-category/services/content-category.service';
import { Category } from 'src/app/content-category/models/category';

@Component({
  selector: 'app-quiz-dialog',
  templateUrl: './quiz-dialog.component.html',
  styleUrls: ['./quiz-dialog.component.scss']
})
export class QuizDialogComponent implements OnInit{

  isEdit: boolean;
  quiz: Quiz;
  quizForm!: FormGroup;
  categories: Category[] = []

  constructor(private fb: FormBuilder, private quizService: QuizzesService,
    private categoryService: ContentCategoryService,
    public dialogRef: MatDialogRef<QuizDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ){
    this.isEdit = data.isEdit;
    this.quiz = data.quiz
    console.log(data);
  }

  ngOnInit(): void {
    this.formBuilder();
    this.loadAllCategories();

    if(this.isEdit && this.quiz?.id){
      this.quizForm.patchValue(this.quiz)
    }

  } 

  loadAllCategories(){
    this.categoryService.loadContentCategory().subscribe(data=>{
      this.categories = data
    })
  }

  formBuilder(){
    const userId = localStorage.getItem('userId')?.replace(/"/g, '')
    this.quizForm = this.fb.group({
      id: [ this.quiz?.id],
      name: ['', Validators.required],
      description: ['', Validators.required],
      questionCount: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern('^[0-9]*$')]],
      userId: [userId, Validators.required],
      contentCategoryId: [this.quiz?.contentCategory?.id, Validators.required]
    })
  }

  onClose(){
    this.dialogRef.close()
  }

  saveQuiz(){
    if(this.quizForm.valid){
      let quizFormValue = this.quizForm.value;

      if(this.isEdit && this.quiz?.id){
        this.quizService.updateQuiz(quizFormValue).subscribe(()=>{
          this.dialogRef.close()
        })
      }else{
        this.quizService.createQuiz(quizFormValue).subscribe(()=>{
          this.dialogRef.close()
        })
      }
    }
  }
}
