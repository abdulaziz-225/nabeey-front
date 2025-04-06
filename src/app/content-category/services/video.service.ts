import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Video } from '../models/video';
import { environment } from 'src/app/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class VideoService {

    private apiUrl: string = environment.apiUrl;

    constructor(private http: HttpClient) { }
    
    allVideoes(): Observable<Video[]> {
        return this.http.get<{ statusCode: number, message: string, data: Video[] }>(`${this.apiUrl}/content-videos/get-all`)
          .pipe(
            map(response => response.data) 
          );
      }
      

    createVideo(data: Video){
        return this.http.post(`${this.apiUrl}/content-videos/create`, data)
    }

    deleteVideo(id:number){
        return this.http.delete(`${this.apiUrl}/content-videos/delete/${id}`)
    }
}