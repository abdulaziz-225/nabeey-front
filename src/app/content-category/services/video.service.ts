import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Video } from '../models/video';

@Injectable({
    providedIn: 'root'
})

export class VideoService {

    private apiUrl = 'https://localhost:7267/api/content-videos'

    constructor(private http: HttpClient) { }
    
    allVideoes(): Observable<Video[]> {
        return this.http.get<{ statusCode: number, message: string, data: Video[] }>(`${this.apiUrl}/get-all`)
          .pipe(
            map(response => response.data) 
          );
      }
      

    createVideo(data: Video){
        return this.http.post(`${this.apiUrl}/create`, data)
    }

    deleteVideo(id:number){
        return this.http.delete(`${this.apiUrl}/delete/${id}`)
    }
}