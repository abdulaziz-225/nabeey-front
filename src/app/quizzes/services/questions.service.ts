import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '../models/question';
import { map, Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }


  loadAllQuestions(): Observable<any[]> {
    return new Observable(observer => {
      const allQuestions: any[] = [];
      const pageSize = 20; // API nechta qaytarayotganiga qarab tanlang
      let pageIndex = 1;
  
      const fetchPage = () => {
        this.http.get<any>(`${this.apiUrl}/questions/get-all?PageIndex=${pageIndex}&PageSize=${pageSize}`)
          .subscribe(response => {
            if (pageIndex === 1) {
              allQuestions.length = 0; // Eski ma’lumotlarni o‘chirib tashlaymiz
            }
            
            if (response.data.length > 0) {
              allQuestions.push(...response.data);
              pageIndex++;
              fetchPage(); // Keyingi sahifani yuklaymiz
            } else {
              observer.next(allQuestions); // Barcha savollarni qaytaramiz
              observer.complete();
            }
          }, error => observer.error(error));
      };
  
      fetchPage();
    });
  }
  

    createQuestions(data: Question){
      let formData = new FormData;
      formData.append('text', data.text);
      formData.append('image', data.image)

    return  this.http.post(`${this.apiUrl}/questions/create`, formData)
    }

    updateQuestions(data: Question){
      let formData = new FormData;
      formData.append('id', data.id);
      formData.append('text', data.text);
      formData.append('image', data.image)

    return  this.http.put(`${this.apiUrl}/questions/update`, formData)
    }

    deleteQuestion(id: number){
    return  this.http.delete(`${this.apiUrl}/questions/delete/${id}`)
    }

}
