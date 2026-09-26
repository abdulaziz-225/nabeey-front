import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chat-choice-dialog',
  templateUrl: './chat-choice-dialog.component.html',
  styleUrls: ['./chat-choice-dialog.component.scss']
})
export class ChatChoiceDialogComponent {

  constructor(public dialogRef: MatDialogRef<ChatChoiceDialogComponent>) {}

  choose(option: 'expert' | 'ai'): void {
    this.dialogRef.close(option);
  }
}
