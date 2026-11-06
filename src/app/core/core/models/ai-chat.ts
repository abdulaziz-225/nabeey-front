export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AiChatMode = 'general' | 'library';

export interface AiModeAvailability {
  generalEnabled: boolean;
  libraryEnabled: boolean;
}

export interface AiCitation {
  sourceId: number;
  title: string;
  type: string;
  page?: number | null;
  url?: string | null;
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
  citations?: AiCitation[];
}

export interface AiLimitResponse {
  remaining: number;
  limit: number;
}
