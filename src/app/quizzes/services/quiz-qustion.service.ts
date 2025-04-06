import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Quiz } from '../models/quiz';
import { QuizQuestions } from '../models/quiz-question';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizQustionService {
  private apiUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  loadQuestionsByQuizId(quizId: number): Observable<Quiz[]> {
    return this.http.get<any>(`${this.apiUrl}/quiz-questions/get-by-quizId/${quizId}`).pipe(
      map(response => response.data)
    );
  }
  loadQuizQuestionsById(id: number): Observable<Quiz[]> {
    return this.http.get<any>(`${this.apiUrl}/quiz-questions/get/${id}`).pipe(
      map(response => response.data)
    );
  }

  quizQuestionDelete(id:number){
    return this.http.delete(`${this.apiUrl}/quiz-questions/delete/${id}`)
  }

  // loadAllQuizQuestions(): Observable<any[]>{
  //   return this.http.get<any>(`${this.apiUrl}/get-all`).pipe(
  //     map(response => response.data) 
  //   )
  // }
  loadAllQuizQuestions(): Observable<any[]> {
    const allQuizQuestions: any[] = [];
    const pageSize = 20; // API necha tadan qaytarayotganiga qarab tanlang
    let pageIndex = 1;
  
    return new Observable(observer => {
      const fetchPage = () => {
        this.http.get<any>(`${this.apiUrl}/quiz-questions/get-all?PageIndex=${pageIndex}&PageSize=${pageSize}`)
          .subscribe(response => {
            if (response.data.length > 0) {
              allQuizQuestions.push(...response.data);
              pageIndex++;
              fetchPage(); // Keyingi sahifani chaqiramiz
            } else {
              observer.next(allQuizQuestions);
              observer.complete();
            }
          }, error => observer.error(error));
      };
  
      fetchPage();
    });
  }
  

  createQuizQuestions(data: QuizQuestions){
    return   this.http.post(`${this.apiUrl}/quiz-questions/create`, data)
    }

}
