import { Component, Inject, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { ContentCategoryService } from '../../services/content-category.service';
import { Category } from '../../models/category';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-dialog',
  templateUrl: './book-dialog.component.html',
  styleUrls: ['./book-dialog.component.scss']
})
export class BookDialogComponent implements OnInit{

  bookForm!: FormGroup;
  categories: Category[] = [];
  isEdit:boolean;
  book:any;
  selectedImageFile: File | null = null;
  selectedOtherFile: File | null = null;

  imagePreview: string | ArrayBuffer | null = null
  filePreview: string | ArrayBuffer | null = null

  constructor(private bookService: BookService,
    private fb: FormBuilder, public dialogRef: DialogRef<BookDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private contentCategoryService: ContentCategoryService
  ){
    console.log(data.book);
    
    this.book = data.book;
    this.isEdit = data.isEdit;
    console.log(this.book);
    
    
  }

  ngOnInit(): void {
    this.formBuilder();
    this.loadCategory();
    
    if(this.isEdit && this.book?.id){
      this.bookForm.patchValue(this.book)
    }

    if( this.book?.id && this.book.image.filePath){
      this.imagePreview = this.book.image.filePath
    }

    if( this.book?.id && this.book.file.filePath){
      this.filePreview = this.book.file.filePath
    }

  }


  formBuilder(){
    this.bookForm = this.fb.group({
      id: [this.book?.id],
      title: ['', ],
      author: ['',],
      description: ['', ],
      categoryId: [3, ],
      year: [''],
      genre: [''],
      file: ['', ],
      image: ['',],
    })
  };

  loadCategory(){
    this.contentCategoryService.loadContentCategory().subscribe(data=>{
      this.categories = data
    })
  }

  createBook() {
    if (this.bookForm.valid) {
        const formValue = this.bookForm.value;


        if (this.selectedImageFile) {
            formValue.image = this.selectedImageFile; 
        } else {
            formValue.image = null; 
        }

        if (this.selectedOtherFile) {
            formValue.file = this.selectedOtherFile; 
        } else {
            formValue.file = null; 
        }

        console.log('Form data before submission:', formValue);

        if (this.isEdit && this.book?.id) {
            this.bookService.updateBook(formValue).subscribe({
                next: () => {
                    this.dialogRef.close();
                },
                error: (err) => {
                    console.error('Error updating book:', err);
                }
            });
        } else {
            this.bookService.createBook(formValue).subscribe({
                next: () => {
                    this.dialogRef.close();
                },
                error: (err) => {
                    console.error('Error creating book:', err);
                }
            });
        }
    }
}

onFilesSelected(event: Event, type: 'image' | 'file') {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
        const selectedFile = fileInput.files[0];

        if (type === 'image') {
            this.selectedImageFile = selectedFile; 
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
                this.filePreview = reader.result as string;
                this.bookForm.patchValue({ image: this.selectedImageFile });
            };
            reader.readAsDataURL(this.selectedImageFile);
        } else if (type === 'file') {
            this.selectedOtherFile = selectedFile;
            
        }
    }
}

  onClose(){
    this.dialogRef.close()
  }

}
