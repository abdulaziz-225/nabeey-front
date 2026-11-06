import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/app/environments/environment';

// Savol variantlari to'g'ri javob belgisisiz keladi: tekshiruv serverda
export interface QuizAttemptOption {
  id: number;
  text: string;
}

export interface QuizAttemptQuestion {
  id: number;
  text: string;
  answers: QuizAttemptOption[];
}

export interface QuizAttemptSavedAnswer {
  questionId: number;
  answerId: number;
  isCorrect: boolean;
}

// Test yakunlangach keladigan xatolar tahlili
export interface QuizAttemptReviewItem {
  questionId: number;
  questionText: string;
  selectedAnswerId: number | null;
  selectedAnswerText: string | null;
  correctAnswerId: number | null;
  correctAnswerText: string | null;
  isCorrect: boolean;
  isSkipped: boolean;
}

export interface QuizAttempt {
  id: number;
  bookId: number;
  quizId: number;
  bookTitle: string;
  quizName: string;
  currentQuestionIndex: number;
  // Birinchi urinish (ball birinchi marta yoziladi)
  isScoreEligible: boolean;
  isCompleted: boolean;
  correctAnswers: number;
  questionCount: number;
  questionSeconds: number;
  secondsLeft: number;
  questions: QuizAttemptQuestion[];
  savedAnswers: QuizAttemptSavedAnswer[];
  review: QuizAttemptReviewItem[];
}

export interface QuizAttemptAnswerResult {
  isCorrect: boolean;
  timedOut: boolean;
  currentQuestionIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizAttemptService {

  private apiUrl = `${environment.apiUrl}/quiz-attempts`;

  constructor(private http: HttpClient) { }

  start(bookId: number, quizId: number): Observable<QuizAttempt> {
    return this.http.post<any>(`${this.apiUrl}/start`, { bookId, quizId }).pipe(map(res => res.data));
  }

  getActive(): Observable<QuizAttempt | null> {
    return this.http.get<any>(`${this.apiUrl}/active`).pipe(map(res => res.data ?? null));
  }

  answer(attemptId: number, questionId: number, answerId: number): Observable<QuizAttemptAnswerResult> {
    return this.http.post<any>(`${this.apiUrl}/${attemptId}/answer`, { questionId, answerId }).pipe(map(res => res.data));
  }

  // Savol vaqti tugaganda javobsiz keyingisiga o'tish
  advance(attemptId: number): Observable<QuizAttemptAnswerResult> {
    return this.http.post<any>(`${this.apiUrl}/${attemptId}/advance`, null).pipe(map(res => res.data));
  }

  finish(attemptId: number): Observable<QuizAttempt> {
    return this.http.post<any>(`${this.apiUrl}/${attemptId}/finish`, null).pipe(map(res => res.data));
  }
}
