import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnswerData } from '../models/answer';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionAnswerService {

  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sumbitAnswer(answerData: AnswerData){
    return this.http.post(`${this.apiUrl}/question-answer/create`, answerData)
  }
  

}
