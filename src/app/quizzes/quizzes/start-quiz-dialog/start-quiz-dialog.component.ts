import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-start-quiz-dialog',
  templateUrl: './start-quiz-dialog.component.html'
})
export class StartQuizDialogComponent {
  book:any
  constructor(
    public dialogRef: MatDialogRef<StartQuizDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    
  ) {
    this.book = data.book 
    console.log(this.book);
  }

  closeDialog(result: string) {
    this.dialogRef.close(result);
  }

}
