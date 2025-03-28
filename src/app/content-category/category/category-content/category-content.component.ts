import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContentCategoryService } from '../../services/content-category.service';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';
import { Category } from '../../models/category';

@Component({
  selector: 'app-category-content',
  templateUrl: './category-content.component.html'
})
export class CategoryContentComponent implements OnInit{

  contentCategories:Category[] = [];
  selectedIndex: number = 0;


  constructor(private categoryService: ContentCategoryService,
    public dialog: MatDialog){}

  ngOnInit(): void {
    this.loadCategories()
  }
  
  loadCategories(){
    this.categoryService.loadContentCategory().subscribe(data=>{
      this.contentCategories = data;
      console.log(this.contentCategories);
      
    })
  }

  openDialog(isEdit: boolean, category?:Category): void {
    if (!category) {
      category = this.contentCategories[this.selectedIndex];
    }
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: {
        category: category,        
        isEdit: isEdit
      },
      width: '400px',
      height: '500px'
    });
  
    dialogRef.afterClosed().subscribe(() => {
        this.loadCategories();
    });
  }

  confirmDelete(id:number){
    const dialogRef = this.dialog.open(ConfirmDeleteComponent,{
      width: '280px',
      height: '175px',
      data: {
        id: id,
        message: "Ushbu category'ni o'chirishga ishonchingiz komilmi?"
      }
    });
    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        this.deleteCategory(id)
      }
    })
  }

  deleteCategory(id:number){
    this.categoryService.deleteCategory(id).subscribe(()=>{
      this.loadCategories()
    });
  }

}
