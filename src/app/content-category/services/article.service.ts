import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Article, ArticleApiResponse, DetailedArticle } from '../models/article';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  loadArticles(): Observable<ArticleApiResponse>{
    return this.http.get<ArticleApiResponse>(`${this.apiUrl}/article/get-all`);
  }

  loadArticle(id:number): Observable<ArticleApiResponse>{
    return this.http.get<ArticleApiResponse>(`${this.apiUrl}/article/get/${id}`)
  }
  
  loadArticleByUser(user:number): Observable<ArticleApiResponse>{
    return this.http.get<ArticleApiResponse>(`${this.apiUrl}/article/get-by-user/${user}`)
    }  

  createArticle(data: Article){
    let formData = new FormData;
    formData.append('text', data.text);
    formData.append('categoryId', data.categoryId);
    formData.append('userId', data.userId);
    if (data.image) {
      formData.append('image', data.image); 
    }
    return this.http.post(`${this.apiUrl}/article/create`, formData)
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
    return this.http.put(`${this.apiUrl}/article/update`, formData)
  }

  deleteArticle(id:number){
    return this.http.delete(`${this.apiUrl}/article/delete/${id}`)
  }
  
}
