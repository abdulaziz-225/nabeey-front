import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnswersService {

  private apiUrl = 'https://localhost:7267/api/answers';

  constructor(private http: HttpClient) { }
  
  createAnswer(data: any) {
    let queryParams = new HttpParams()
      .set('text', data.text)
      .set('questionId', data.questionId)
      .set('isTrue', data.isTrue.toString());

    return this.http.post(`${this.apiUrl}/create`, data, { params: queryParams });
  }

  updateAnswer( data: any) {
    let queryParams = new HttpParams()
    .set('id', data.id)
    .set('text', data.text)
    .set('questionId', data.questionId)
    .set('isTrue', data.isTrue.toString());
  
    return this.http.put(`${this.apiUrl}/update`, data, { params: queryParams });
  }

  deleteAnswer(id:number){
    return this.http.delete(`${this.apiUrl}/delete/${id}`)
  }
  
}
