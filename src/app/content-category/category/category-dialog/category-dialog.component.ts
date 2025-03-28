import { Category } from 'src/app/content-category/models/category';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContentCategoryService } from '../../services/content-category.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.scss']
})

export class CategoryDialogComponent implements OnInit {
  categoryForm!: FormGroup;
  isEdit: boolean;
  category: any;
  selectedFile: File | null = null;
  imagePreview!: string;


  constructor(
    public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private categoryService: ContentCategoryService
  ) {
    
    this.category = data.category;
    
    this.isEdit = data.isEdit;

    console.log(this.category);
    
  }

  ngOnInit(): void {
    this.formBuilder()

    if(this.isEdit && this.category?.id) {
      this.categoryForm.patchValue(this.category);

      if(this.category.image.filePath) {
        this.imagePreview = this.category.image.filePath;
      }
    }
    
  }

  onClose(){
    this.dialogRef.close()
  }

  formBuilder(){
    this.categoryForm = this.fb.group({
      id: [this.category.id],
      name: ['', Validators.required],
      description: ['', Validators.required],
      image: ['']
    });
  }

  onFileSelected(event: Event): void {
    
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;  
      };
      reader.readAsDataURL(this.selectedFile); 
    }
  }

  save(): void {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;

      if (this.selectedFile) {

        categoryData.image = this.selectedFile;
      }

      if (this.isEdit && this.category?.id) {
        this.categoryService.updateCategory(categoryData).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.categoryService.createContentCategory(categoryData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  };
  
}

