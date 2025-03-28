import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Article, ArticleApiResponse, DetailedArticle } from '../models/article';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private apiUrl = 'https://localhost:7267/api/article'

  constructor(private http: HttpClient) { }

  loadArticles(): Observable<ArticleApiResponse>{
    return this.http.get<ArticleApiResponse>(`${this.apiUrl}/get-all`);
  }

  loadArticle(id:number): Observable<ArticleApiResponse>{
    return this.http.get<ArticleApiResponse>(`${this.apiUrl}/get/${id}`)
  }
  
  loadArticleByUser(user:number): Observable<ArticleApiResponse>{
    return this.http.get<ArticleApiResponse>(`${this.apiUrl}/get-by-user/${user}`)
    }  

  createArticle(data: Article){
    let formData = new FormData;
    formData.append('text', data.text);
    formData.append('categoryId', data.categoryId);
    formData.append('userId', data.userId);
    if (data.image) {
      formData.append('image', data.image); 
    }
    return this.http.post(`${this.apiUrl}/create`, formData)
  }

  editArticle(data: Article){
    let formData = new FormData;
    formData.append('id', data.id);
    formData.append('text', data.text);
    formData.append('categoryId', data.categoryId);
    formData.append('userId', data.userId);
    if (data.image) {
      formData.append('image', data.image); 
    }
    return this.http.put(`${this.apiUrl}/update`, formData)
  }

  deleteArticle(id:number){
    return this.http.delete(`${this.apiUrl}/delete/${id}`)
  }
  
}
