import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private apiUrl = 'https://localhost:7267/api/books'

  constructor(private http: HttpClient) { }

  loadBooks(): Observable<any>{
    return this.http.get(`${this.apiUrl}/get-all`)
  }

  createBook(data: Book){

    let queryParams = new HttpParams()
     .set('title', data.title)
    .set('author', data.author)
    .set('description', data.description)
    .set('categoryId', data.categoryId)
      
    const formData = new FormData();
    if (data.file instanceof File) {
        formData.append('file', data.file, data.file.name);
    }
    if (data.image instanceof File) {
        formData.append('image', data.image, data.image.name);
    }

    return this.http.post(`${this.apiUrl}/create`, formData, {params:queryParams})
  }

  updateBook(data: any) {

    let queryParams = new HttpParams()
    .set('id', data.id)
    .set('title', data.title)
    .set('author', data.author)
    .set('description', data.description)
    .set('categoryId', data.categoryId)

    const formData = new FormData();

    if (data.file instanceof File) {
      formData.append('file', data.file, data.file.name);
  }
  if (data.image instanceof File) {
      formData.append('image', data.image, data.image.name);
  }

    // console.log('this from service', [...(<any>queryParams).entries()]); 

    return this.http.put(`${this.apiUrl}/update`, formData, {params: queryParams});
}
  
  deleteBook(id:number){
    return this.http.delete(`${this.apiUrl}/delete/${id}`)
  }

}
