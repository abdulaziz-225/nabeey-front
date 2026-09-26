export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  isFromAdmin: boolean;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: number;
  userId: number;
  status: 'Open' | 'Closed';
  createdAt: string;
  closedAt: string | null;
  messages: ChatMessage[];
}

export interface ChatConversationSummary {
  id: number;
  userId: number;
  userFullName: string;
  status: 'Open' | 'Closed';
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  conversationCount: number;
  createdAt: string;
}
