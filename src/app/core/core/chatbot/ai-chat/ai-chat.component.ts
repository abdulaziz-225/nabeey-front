import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AiChatService } from '../../services/ai-chat.service';
import { AiBookSummary, AiChatMessage, AiChatMode, AiCitation } from '../../models/ai-chat';
import { MatDialog } from '@angular/material/dialog';
import { AiCitationDialogComponent } from '../ai-citation-dialog/ai-citation-dialog.component';

interface DisplayMessage extends AiChatMessage {
  books?: AiBookSummary[];
  citations?: AiCitation[];
}

interface AiChatSession {
  id: string;
  sessionId: string;
  startedAt: number;
  messages: DisplayMessage[];
}

const STORAGE_KEY = 'ai-chat-messages';
const HISTORY_KEY = 'ai-chat-history';
const MAX_HISTORY_SESSIONS = 20;
const COOLDOWN_SECONDS = 30;

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss']
})
export class AiChatComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mode: AiChatMode = 'general';
  @Input() isMaximized = false;
  @Output() switchToExpert = new EventEmitter<void>();
  @Output() switchMode = new EventEmitter<AiChatMode>();
  @Output() toggleMaximize = new EventEmitter<void>();
  @ViewChild('chatBody') chatBodyRef?: ElementRef<HTMLDivElement>;
  @ViewChild('questionInput') questionInputRef?: ElementRef<HTMLTextAreaElement>;

  messages: DisplayMessage[] = [];
  questionText = '';
  isSending = false;
  errorMessage: string | null = null;
  remaining: number | null = null;
  limit: number | null = null;
  cooldownSeconds = 0;
  showHistory = false;
  history: AiChatSession[] = [];
  sessionId = '';

  private cooldownTimer?: ReturnType<typeof setInterval>;

  get title(): string {
    return this.mode === 'library' ? 'Kutubxona AI' : 'AI yordamchi';
  }

  get storageKey(): string {
    return this.mode === 'general' ? STORAGE_KEY : `${STORAGE_KEY}-${this.mode}`;
  }

  get historyKey(): string {
    return this.mode === 'general' ? HISTORY_KEY : `${HISTORY_KEY}-${this.mode}`;
  }

  private historyStorageKey(mode: AiChatMode): string {
    return mode === 'general' ? HISTORY_KEY : `${HISTORY_KEY}-${mode}`;
  }

  constructor(private aiChatService: AiChatService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadLimit();
    this.restoreMessages();
    this.archiveCurrentSession();
    this.messages = [];
    this.sessionId = this.createSessionId();
    this.persistMessages();
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['mode'] || changes['mode'].firstChange) return;
    const previousMode = changes['mode'].previousValue as AiChatMode;
    this.archiveCurrentSession(this.historyStorageKey(previousMode));
    this.messages = [];
    this.sessionId = this.createSessionId();
    this.persistMessages();
    this.history = [];
    this.showHistory = false;
    this.errorMessage = null;
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
  }

  private restoreMessages(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      this.messages = saved ? JSON.parse(saved) : [];
    } catch {
      this.messages = [];
    }
  }

  private persistMessages(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    } catch {
      // localStorage mavjud bo'lmasa, e'tiborsiz qoldiramiz
    }
  }

  private loadHistory(key = this.historyKey): AiChatSession[] {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private persistHistory(history: AiChatSession[], key = this.historyKey): void {
    try {
      localStorage.setItem(key, JSON.stringify(history));
    } catch {
      // localStorage mavjud bo'lmasa, e'tiborsiz qoldiramiz
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.chatBodyRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  get isLimitReached(): boolean {
    return this.remaining !== null && this.remaining <= 0;
  }

  loadLimit(): void {
    this.aiChatService.getLimit().subscribe({
      next: (res) => {
        this.remaining = res.remaining;
        this.limit = res.limit;
      },
      error: () => {}
    });
  }

  send(): void {
    const question = this.questionText.trim();
    if (!question || this.isSending || this.isLimitReached || this.cooldownSeconds > 0) return;

    // Faqat to'liq (user+assistant) juftliklarni tarix sifatida olamiz —
    // oldingi urinish xato bergan bo'lsa, javobsiz qolgan savol tarixga
    // qo'shilib ketmasligi va AI keyingi javobda bir nechta savolni
    // birlashtirib javob bermasligi uchun.
    const lastAnsweredIndex = this.lastAssistantIndex();
    const cleanHistory: AiChatMessage[] = this.messages
      .slice(0, lastAnsweredIndex + 1)
      .map(m => ({ role: m.role, content: m.content }));

    this.errorMessage = null;
    this.messages.push({ role: 'user', content: question });
    this.persistMessages();
    this.scrollToBottom();
    this.questionText = '';
    if (this.questionInputRef) this.questionInputRef.nativeElement.style.height = 'auto';
    this.isSending = true;
    this.startCooldown();

    const request = this.mode === 'library'
      ? this.aiChatService.askLibrary(question, cleanHistory, this.sessionId)
      : this.aiChatService.ask(question, cleanHistory, this.sessionId);

    request.subscribe({
      next: (res) => {
        this.messages.push({
          role: 'assistant',
          content: res.answer,
          books: res.books,
          citations: res.citations
        });
        this.remaining = res.remaining;
        this.isSending = false;
        this.persistMessages();
        this.scrollToBottom();
      },
      error: (err) => {
        this.isSending = false;
        this.errorMessage = err?.error?.message || "Xatolik yuz berdi, qaytadan urinib ko'ring";
        if (err?.status === 429) {
          this.remaining = 0;
        }
        this.scrollToBottom();
      }
    });
  }

  private lastAssistantIndex(): number {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'assistant') return i;
    }
    return -1;
  }

  private startCooldown(): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownSeconds = COOLDOWN_SECONDS;
    this.cooldownTimer = setInterval(() => {
      this.cooldownSeconds--;
      if (this.cooldownSeconds <= 0) {
        this.cooldownSeconds = 0;
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = undefined;
      }
    }, 1000);
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

  goToExpert(): void {
    this.switchToExpert.emit();
  }

  switchAiMode(): void {
    this.switchMode.emit(this.mode === 'library' ? 'general' : 'library');
  }

  openCitation(citation: AiCitation): void {
    if (!citation.sourceId) return;
    this.dialog.open(AiCitationDialogComponent, {
      width: '560px',
      maxWidth: '94vw',
      maxHeight: '85vh',
      data: citation
    });
  }

  startNewChat(): void {
    this.archiveCurrentSession();
    this.messages = [];
    this.sessionId = this.createSessionId();
    this.errorMessage = null;
    this.persistMessages();
    this.showHistory = false;
  }

  private archiveCurrentSession(historyKey = this.historyKey): void {
    if (this.messages.length === 0) return;

    const history = this.loadHistory(historyKey);
    history.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: this.sessionId || this.createSessionId(),
      startedAt: Date.now(),
      messages: this.messages
    });

    this.persistHistory(history.slice(0, MAX_HISTORY_SESSIONS), historyKey);
  }

  private createSessionId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, token => {
      const value = Math.floor(Math.random() * 16);
      return (token === 'x' ? value : (value & 0x3) | 0x8).toString(16);
    });
  }

  toggleHistory(): void {
    if (!this.showHistory) this.history = this.loadHistory();
    this.showHistory = !this.showHistory;
  }

  openSession(session: AiChatSession): void {
    this.archiveCurrentSession();

    const history = this.loadHistory().filter(s => s.id !== session.id);
    this.persistHistory(history);

    this.messages = session.messages;
    this.sessionId = session.sessionId || this.createSessionId();
    this.errorMessage = null;
    this.persistMessages();
    this.showHistory = false;
    this.scrollToBottom();
  }

  sessionPreview(session: AiChatSession): string {
    const firstUserMessage = session.messages.find(m => m.role === 'user');
    const text = firstUserMessage?.content || '';
    return text.length > 40 ? text.slice(0, 40) + '…' : text;
  }
}
