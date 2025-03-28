import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QuizQuestions } from '../models/quiz-question';
import { map, Observable } from 'rxjs';
import { Quiz } from '../models/quiz';

@Injectable({
  providedIn: 'root'
})
export class QuizzesService {

  private apiUrl = 'https://localhost:7267/api'

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
