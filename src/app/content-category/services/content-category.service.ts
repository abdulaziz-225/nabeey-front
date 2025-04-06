import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../models/category';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentCategoryService {

  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  loadContentCategory(): Observable<Category[]>{
    return this.http.get<any>(`${this.apiUrl}/content-categories/get-all`)
    .pipe(
      map(response=> response.data)
    )
  }

  createContentCategory(data: any){
    let categoryData = new FormData();
    categoryData.append('name', data.name);
    categoryData.append('description', data.description);
    categoryData.append('image', data.image);
    return this.http.post(`${this.apiUrl}/content-categories/create`, categoryData)
  }

  updateCategory(data:any){
    let categoryData = new FormData();
    categoryData.append('id', data.id);
    categoryData.append('name', data.name);
    categoryData.append('description', data.description);
    categoryData.append('image', data.image);
   return  this.http.put(`${this.apiUrl}/content-categories/update`, categoryData)
  }

  deleteCategory(id:number){
    return this.http.delete(`${this.apiUrl}/content-categories/delete/${id}`)
  }
  
}
