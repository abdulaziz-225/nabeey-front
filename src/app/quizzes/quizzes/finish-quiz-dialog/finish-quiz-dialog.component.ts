import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-finish-quiz-dialog',
  templateUrl: './finish-quiz-dialog.component.html',
  styleUrls: ['./finish-quiz-dialog.component.scss']
})
export class FinishQuizDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<FinishQuizDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quizName: string }
  ) {}

  closeDialog(result: boolean): void {
    this.dialogRef.close(result);
  }

}
