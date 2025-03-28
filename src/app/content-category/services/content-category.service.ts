import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class ContentCategoryService {

  private apiUrl = 'https://localhost:7267/api/content-categories'

  constructor(private http: HttpClient) { }

  loadContentCategory(): Observable<Category[]>{
    return this.http.get<any>(`${this.apiUrl}/get-all`)
    .pipe(
      map(response=> response.data)
    )
  }

  createContentCategory(data: any){
    let categoryData = new FormData();
    categoryData.append('name', data.name);
    categoryData.append('description', data.description);
    categoryData.append('image', data.image);
    return this.http.post(`${this.apiUrl}/create`, categoryData)
  }

  updateCategory(data:any){
    let categoryData = new FormData();
    categoryData.append('id', data.id);
    categoryData.append('name', data.name);
    categoryData.append('description', data.description);
    categoryData.append('image', data.image);
   return  this.http.put(`${this.apiUrl}/update`, categoryData)
  }

  deleteCategory(id:number){
    return this.http.delete(`${this.apiUrl}/delete/${id}`)
  }
  
}
