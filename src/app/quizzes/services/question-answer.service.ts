import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnswerData } from '../models/answer';

@Injectable({
  providedIn: 'root'
})
export class QuestionAnswerService {

  private apiUrl = 'https://localhost:7267/api/question-answer'

  constructor(private http: HttpClient) { }

  sumbitAnswer(answerData: AnswerData){
    return this.http.post(`${this.apiUrl}/create`, answerData)
  }
  

}
