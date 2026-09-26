import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, interval, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ChatService } from '../../services/chat.service';
import { ChatConversation } from '../../models/chat';
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';
import { ChatChoiceDialogComponent } from '../chat-choice-dialog/chat-choice-dialog.component';

type ChatView = 'none' | 'expert' | 'ai';

@Component({
  selector: 'app-chatbot-widget',
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.scss']
})
export class ChatbotWidgetComponent implements OnInit, OnDestroy {
  @ViewChild('messageInput') messageInputRef?: ElementRef<HTMLTextAreaElement>;

  userRole: string | null = null;
  userId: number | null = null;

  activeView: ChatView = 'none';
  conversation: ChatConversation | null = null;
  messageText = '';
  loading = false;
  isMaximized = false;

  private pollSub?: Subscription;

  constructor(private chatService: ChatService, private dialog: MatDialog) {}

  ngOnInit(): void {
    const role = localStorage.getItem('role');
    this.userRole = role ? JSON.parse(role) : null;

    const id = localStorage.getItem('userId');
    this.userId = id ? JSON.parse(id) : null;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get isVisible(): boolean {
    return this.userRole === 'User';
  }

  get isOpen(): boolean {
    return this.activeView !== 'none';
  }

  get isConversationOpen(): boolean {
    return this.conversation?.status !== 'Closed';
  }

  toggleChat(): void {
    if (this.isOpen) {
      this.closeAll();
      return;
    }

    const dialogRef = this.dialog.open(ChatChoiceDialogComponent, {
      width: '360px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe((choice: 'expert' | 'ai' | undefined) => {
      if (choice === 'expert') {
        this.openExpertView();
      } else if (choice === 'ai') {
        this.activeView = 'ai';
      }
    });
  }

  openExpertView(): void {
    this.activeView = 'expert';
    this.loadConversation();
    this.startPolling();
  }

  closeAll(): void {
    this.activeView = 'none';
    this.isMaximized = false;
    this.stopPolling();
  }

  toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
  }

  loadConversation(): void {
    if (!this.userId) return;
    this.loading = true;
    this.chatService.getMyConversation(this.userId).subscribe({
      next: (conversation) => {
        this.conversation = conversation;
        this.loading = false;
        this.markAdminMessagesAsRead();
      },
      error: () => (this.loading = false)
    });
  }

  startPolling(): void {
    this.stopPolling();
    this.pollSub = interval(4000)
      .pipe(switchMap(() => this.chatService.getMyConversation(this.userId as number).pipe(catchError(() => of(null)))))
      .subscribe(conversation => {
        if (!conversation) return;
        this.conversation = conversation;
        this.markAdminMessagesAsRead();
      });
  }

  private markAdminMessagesAsRead(): void {
    if (!this.conversation) return;
    const hasUnread = this.conversation.messages.some(m => m.isFromAdmin && !m.isRead);
    if (!hasUnread) return;
    this.chatService.markAsRead(this.conversation.id, false).subscribe();
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  onEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.send();
    }
  }

  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  send(): void {
    const text = this.messageText.trim();
    if (!text || !this.userId) return;

    this.chatService.sendMessage({
      userId: this.userId,
      senderId: this.userId,
      isFromAdmin: false,
      text
    }).subscribe(() => {
      this.messageText = '';
      if (this.messageInputRef) this.messageInputRef.nativeElement.style.height = 'auto';
      this.loadConversation();
    });
  }

  closeConversation(): void {
    if (!this.conversation) return;
    const conversationId = this.conversation.id;

    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: {
        title: 'Suhbatni yakunlash',
        message: "Suhbatni yakunlamoqchimisiz? Xohlasangiz istalgan payt yangi xabar yozib qayta boshlashingiz mumkin.",
        confirmText: 'Yakunlash',
        confirmClass: 'btn-primary',
        icon: 'mark_chat_read',
        iconVariant: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.chatService.closeConversation(conversationId).subscribe(() => {
        this.loadConversation();
      });
    });
  }
}
