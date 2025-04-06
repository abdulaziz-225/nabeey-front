import { Article, DetailedArticle } from './../../models/article';
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArticleService } from '../../services/article.service';
import { ContentCategoryService } from '../../services/content-category.service';

@Component({
  selector: 'app-article-dialog',
  templateUrl: './article-dialog.component.html',
})
export class ArticleDialogComponent implements OnInit{
  
  articleForm!: FormGroup;
  isEdit: boolean;
  categories: any;
  article:DetailedArticle
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private articleService: ArticleService,
    private categoryService: ContentCategoryService,
    public dialogRef: MatDialogRef<ArticleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ){
    this.article = data.article;
    this.isEdit = data.isEdit
    
    console.log(this.article);
    
  }

  ngOnInit(): void {
    this.formBuilder();
    this.loadCategory();

    if (this.isEdit && this.article?.id) {
      this.articleForm.patchValue(this.article);
    }

    if (this.article && this.article.image && this.article.image.filePath) {
      this.imagePreview = this.article.image.filePath;
    } else {
      this.imagePreview = null; 
    }
    
  }

  formBuilder(){
    const userId = localStorage.getItem('userId')?.replace(/"/g, '')
    this.articleForm = this.fb.group({
      id: [this.article?.id],
      text: ['', Validators.required],
      categoryId: [this.article?.category?.id, Validators.required],
      userId: [userId],
      image: [''],
      title: ['', Validators.required],
      link: ['']
  
    })

    
  }

  loadCategory(){
    this.categoryService.loadContentCategory().subscribe(data=>{
      this.categories = data;
    })
  }

  onClose(){
    this.dialogRef.close()
  }

  createArticle(){
    if(this.articleForm.valid){
      let formValue = this.articleForm.value

      if(this.isEdit && this.article?.id){
        this.articleService.editArticle(formValue).subscribe(()=>{
          this.dialogRef.close(true)
        })
      }else{

        this.articleService.createArticle(formValue).subscribe({
          next: ()=>{
            this.dialogRef.close(true)
          }
        })
      }
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result; 
        this.articleForm.patchValue({ image: file }); 
      };
      reader.readAsDataURL(file);
    }
  }

}
