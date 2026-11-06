import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { QuizQuestions } from '../models/quiz-question';
import { map, Observable } from 'rxjs';
import { Quiz } from '../models/quiz';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizzesService {

  private apiUrl: string = environment.apiUrl;

  // Test natijasi ballga yozilganda: bosh sahifadagi "Ballar" tugmasi yangilanadi
  readonly scoreChanged$ = new Subject<void>();

  constructor(private http: HttpClient) { }

  loadAllQuizzes(): Observable<any[]>{
    return this.http.get<any>(`${this.apiUrl}/quizzes/get-all`).pipe(
      map(response => response.data) 
    );
  }
  
  getQuizResult(quizId?: number | null, userId?: string | undefined): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/quiz-result/get-by-quizId-userId/${quizId}/${userId}`).pipe(
      map(response => response.data)
    )
  }

  // period: day | week | month | all (umumiy ball uchun parametrsiz)
  getLeaderboard(period: 'day' | 'week' | 'month' | 'all' = 'all'): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/quiz-result/leaderboard`, { params: { period } }).pipe(
      map(response => response.data)
    );
  }

  createQuiz(data: Quiz){
    return this.http.post(`${this.apiUrl}/quizzes/create`, data)
  }

  updateQuiz(data: Quiz){
    return this.http.put(`${this.apiUrl}/quizzes/update`, data)
  }

  deleteQuiz(id: number){
    return this.http.delete(`${this.apiUrl}/quizzes/delete/${id}`)
  }
  
}
