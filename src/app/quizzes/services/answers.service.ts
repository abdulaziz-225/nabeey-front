import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnswersService {

  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }
  
  createAnswer(data: any) {
    let queryParams = new HttpParams()
      .set('text', data.text)
      .set('questionId', data.questionId)
      .set('isTrue', data.isTrue.toString());

    return this.http.post(`${this.apiUrl}/answers/create`, data, { params: queryParams });
  }

  updateAnswer( data: any) {
    let queryParams = new HttpParams()
    .set('id', data.id)
    .set('text', data.text)
    .set('questionId', data.questionId)
    .set('isTrue', data.isTrue.toString());
  
    return this.http.put(`${this.apiUrl}/answers/update`, data, { params: queryParams });
  }

  deleteAnswer(id:number){
    return this.http.delete(`${this.apiUrl}/answers/delete/${id}`)
  }
  
}
