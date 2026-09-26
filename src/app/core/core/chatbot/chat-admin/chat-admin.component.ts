import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ChatService } from '../../services/chat.service';
import { ChatConversation, ChatConversationSummary } from '../../models/chat';

type StatusFilter = 'All' | 'Open' | 'Closed';

@Component({
  selector: 'app-chat-admin',
  templateUrl: './chat-admin.component.html',
  styleUrls: ['./chat-admin.component.scss']
})
export class ChatAdminComponent implements OnInit, OnDestroy {

  conversations: ChatConversationSummary[] = [];
  selectedConversation: ChatConversation | null = null;
  selectedUserName: string = '';
  messageText = '';
  adminId: number | null = null;

  searchText = '';
  statusFilter: StatusFilter = 'All';

  private listPollSub?: Subscription;
  private conversationPollSub?: Subscription;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    const id = localStorage.getItem('userId');
    this.adminId = id ? JSON.parse(id) : null;

    this.loadConversations();
    this.listPollSub = interval(6000)
      .pipe(switchMap(() => this.chatService.getAllConversations().pipe(catchError(() => of(null)))))
      .subscribe(conversations => {
        if (conversations) this.conversations = conversations;
      });
  }

  ngOnDestroy(): void {
    this.listPollSub?.unsubscribe();
    this.conversationPollSub?.unsubscribe();
  }

  get isSelectedOpen(): boolean {
    return this.selectedConversation?.status !== 'Closed';
  }

  get filteredConversations(): ChatConversationSummary[] {
    let list = this.conversations;

    if (this.statusFilter !== 'All') {
      list = list.filter(c => c.status === this.statusFilter);
    }

    const query = this.searchText.trim().toLowerCase();
    if (query) {
      list = list.filter(c =>
        (c.userFullName || '').toLowerCase().includes(query) ||
        String(c.userId).includes(query)
      );
    }

    return list;
  }

  setStatusFilter(status: StatusFilter): void {
    this.statusFilter = status;
  }

  loadConversations(): void {
    this.chatService.getAllConversations().subscribe(conversations => {
      this.conversations = conversations;
    });
  }

  selectConversation(summary: ChatConversationSummary): void {
    this.conversationPollSub?.unsubscribe();
    this.selectedUserName = summary.userFullName?.trim() || ('Foydalanuvchi #' + summary.userId);

    this.chatService.getConversation(summary.id).subscribe(conversation => {
      this.selectedConversation = conversation;
      this.markUserMessagesAsRead();
    });

    this.conversationPollSub = interval(4000)
      .pipe(switchMap(() => this.chatService.getConversation(summary.id).pipe(catchError(() => of(null)))))
      .subscribe(conversation => {
        if (!conversation) return;
        this.selectedConversation = conversation;
        this.markUserMessagesAsRead();
      });
  }

  private markUserMessagesAsRead(): void {
    if (!this.selectedConversation) return;
    const hasUnread = this.selectedConversation.messages.some(m => !m.isFromAdmin && !m.isRead);
    if (!hasUnread) return;
    this.chatService.markAsRead(this.selectedConversation.id, true).subscribe(() => {
      this.loadConversations();
    });
  }

  send(): void {
    const text = this.messageText.trim();
    if (!text || !this.selectedConversation || !this.adminId) return;

    const conversationId = this.selectedConversation.id;

    this.chatService.sendMessage({
      userId: this.selectedConversation.userId,
      senderId: this.adminId,
      isFromAdmin: true,
      text
    }).subscribe(() => {
      this.messageText = '';
      this.chatService.getConversation(conversationId).subscribe(conversation => {
        this.selectedConversation = conversation;
      });
      this.loadConversations();
    });
  }

  closeConversation(): void {
    if (!this.selectedConversation) return;
    const conversationId = this.selectedConversation.id;

    this.chatService.closeConversation(conversationId).subscribe(() => {
      this.chatService.getConversation(conversationId).subscribe(conversation => {
        this.selectedConversation = conversation;
      });
      this.loadConversations();
    });
  }
}
