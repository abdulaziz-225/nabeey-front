import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponseCertificate, Certificate } from '../models/certificate';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
 
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  
  createCertificate(data:Certificate){
    return this.http.post<ApiResponseCertificate>(`${this.apiUrl}/certificates/generate`, data).pipe(
      map(response => response.data)
    )
  }

  getCertificateById(quizId: number | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/certificates/get-by-id/${quizId}`)
  }

  getResultCertificateById(id?:number): Observable<any>{
    return this.http.get(`${this.apiUrl}/quiz-result/get-certificate/${id}`, )
  }


}
