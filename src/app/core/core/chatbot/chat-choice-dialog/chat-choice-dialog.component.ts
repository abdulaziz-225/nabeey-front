import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AiChatService } from '../../services/ai-chat.service';
import { AiModeAvailability } from '../../models/ai-chat';

@Component({
  selector: 'app-chat-choice-dialog',
  templateUrl: './chat-choice-dialog.component.html',
  styleUrls: ['./chat-choice-dialog.component.scss']
})
export class ChatChoiceDialogComponent implements OnInit {
  availability: AiModeAvailability = { generalEnabled: true, libraryEnabled: true };

  constructor(
    public dialogRef: MatDialogRef<ChatChoiceDialogComponent>,
    private aiChatService: AiChatService
  ) {}

  ngOnInit(): void {
    this.aiChatService.getModeAvailability().subscribe({
      next: availability => this.availability = availability,
      error: () => {}
    });
  }

  choose(option: 'expert' | 'ai' | 'library'): void {
    this.dialogRef.close(option);
  }
}
