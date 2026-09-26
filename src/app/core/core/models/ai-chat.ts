export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiBookSummary {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: string;
}

export interface AiAskResponse {
  answer: string;
  remaining: number;
  books: AiBookSummary[];
}

export interface AiLimitResponse {
  remaining: number;
  limit: number;
}
