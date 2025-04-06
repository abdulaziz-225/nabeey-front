import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { map, Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  login(credentials: { phone: string; password: string }) {
    return this.http
      .post(
        `${this.apiUrl}/auth/login?phone=${credentials.phone}&password=${credentials.password}`,
        null
      )
      .pipe(
        switchMap((response: any) => {
          
          this.accessToken = response.data.token;

          return of(response);
        })
      );
  }

  signUp(data: User): Observable<User> {
    let formData = new FormData();
    formData.append('FirstName', data.FirstName);
    formData.append('LastName', data.LastName);
    formData.append('Email', data.Email);
    formData.append('Phone', data.Phone);
    formData.append('Password', data.Password);

    return this.http.post<User>(`${this.apiUrl}/user/create`, formData);
  }

  updateUser(data: any): Observable<any> {
    let formData = new FormData();
    formData.append('Id', data.id);
    formData.append('FirstName', data.firstName);
    formData.append('LastName', data.lastName);
    formData.append('Email', data.email);
    formData.append('Phone', data.phone);
    formData.append('Image', data.image);
    // formData.append("Password",data.Password)
    return this.http.put<any>(`${this.apiUrl}/user/update`, formData);
  }

  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/get-all`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/get/${id}`).pipe(
      map(response=> response.data)
    );
  }

  updateUserRole(userId: number, role: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/user/upgrade-role?id=${userId}&role=${role}`,
      {}
    );
  }

}
