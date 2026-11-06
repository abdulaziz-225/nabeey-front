import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

export interface ProfileQuizResult {
  quizId: number;
  quizName: string;
  ball: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completedAt: string;
}

export interface ProfileExpertMessage {
  isFromAdmin: boolean;
  text: string;
  sentAt: string;
}

export interface ProfileExpertConversation {
  id: number;
  status: string;
  startedAt: string;
  closedAt: string | null;
  messages: ProfileExpertMessage[];
}

export interface ProfileAiTurn {
  mode: 'general' | 'library';
  question: string;
  answer: string;
  createdAt: string;
}

export interface ProfileAiSession {
  sessionId: string;
  mode: 'general' | 'library';
  startedAt: string;
  turns: ProfileAiTurn[];
}

export interface ProfileActivity {
  totalBall: number;
  quizCount: number;
  aiConversationCount: number;
  expertConversationCount: number;
  quizResults: ProfileQuizResult[];
  expertConversations: ProfileExpertConversation[];
  aiSessions: ProfileAiSession[];
}

@Injectable({ providedIn: 'root' })
export class ProfileActivityService {
  constructor(private http: HttpClient) {}

  getActivity(): Observable<ProfileActivity> {
    return this.http.get<any>(`${environment.apiUrl}/profile/activity`).pipe(
      map(response => response.data)
    );
  }
}
