import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { CertificateTemplate, RewardType } from 'src/app/core/core/services/reward.service';
import {
  ActivityEvent,
  ActivityType,
  AdminUser,
  AdminUserPage,
  BookDemand,
  BookReader,
  CertificateOwner,
  DashboardStats,
  UserActivity,
  UserRole,
} from '../models/admin';

export interface UserQuery {
  pageIndex: number;
  pageSize: number;
  search?: string;
  role?: UserRole | null;
  sortBy?: string;
  deleted?: boolean;
}

export interface AiAdminSettings {
  systemPrompt: string;
  scopeInstructions: string;
  generalEnabled: boolean;
  libraryEnabled: boolean;
  includeBooks: boolean;
  includeArticles: boolean;
  includeQuestions: boolean;
}

export interface AiLibraryStatus {
  state: 'idle' | 'queued' | 'running' | 'completed' | 'failed';
  indexedItems: number;
  totalItems: number;
  lastIndexedAt?: string | null;
  error?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl: string = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`).pipe(map(res => res.data));
  }

  getAiSettings(): Observable<AiAdminSettings> {
    return this.http.get<any>(`${this.apiUrl}/ai/settings`).pipe(map(res => res.data));
  }

  saveAiSettings(settings: AiAdminSettings): Observable<AiAdminSettings> {
    return this.http.put<any>(`${this.apiUrl}/ai/settings`, settings).pipe(map(res => res.data));
  }

  getAiLibraryStatus(): Observable<AiLibraryStatus> {
    return this.http.get<any>(`${this.apiUrl}/ai/library/status`).pipe(map(res => res.data));
  }

  reindexAiLibrary(): Observable<AiLibraryStatus> {
    return this.http.post<any>(`${this.apiUrl}/ai/library/reindex`, {}).pipe(map(res => res.data));
  }

  getUsers(query: UserQuery): Observable<AdminUserPage> {
    let params = new HttpParams()
      .set('pageIndex', query.pageIndex)
      .set('pageSize', query.pageSize);
    if (query.search?.trim()) params = params.set('search', query.search.trim());
    if (query.role !== null && query.role !== undefined) params = params.set('role', query.role);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.deleted) params = params.set('deleted', true);

    return this.http.get<any>(`${this.apiUrl}/users`, { params }).pipe(map(res => res.data));
  }

  getUserActivity(userId: number): Observable<UserActivity> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}/activity`).pipe(map(res => res.data));
  }

  changeRole(userId: number, role: UserRole): Observable<AdminUser> {
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}/role`, { role }).pipe(map(res => res.data));
  }

  resetPassword(userId: number, newPassword: string): Observable<boolean> {
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}/password`, { newPassword }).pipe(map(res => res.data));
  }

  updateUser(userId: number, dto: { firstName: string; lastName: string; email: string; phone: string; newPassword: string | null }): Observable<AdminUser> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}`, dto).pipe(map(res => res.data));
  }

  getCertificateTemplates(): Observable<CertificateTemplate[]> {
    return this.http.get<any>(`${this.apiUrl}/certificate-templates`).pipe(map(res => res.data));
  }

  saveCertificateTemplate(type: RewardType, template: CertificateTemplate): Observable<CertificateTemplate> {
    return this.http.put<any>(`${this.apiUrl}/certificate-templates/${type}`, template).pipe(map(res => res.data));
  }

  resetCertificateTemplate(type: RewardType): Observable<CertificateTemplate> {
    return this.http.delete<any>(`${this.apiUrl}/certificate-templates/${type}`).pipe(map(res => res.data));
  }

  restoreUser(userId: number): Observable<AdminUser> {
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}/restore`, null).pipe(map(res => res.data));
  }

  deleteUser(userId: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/users/${userId}`).pipe(map(res => res.data));
  }

  getCertificateOwners(): Observable<CertificateOwner[]> {
    return this.http.get<any>(`${this.apiUrl}/certificates/owners`).pipe(map(res => res.data));
  }

  grantTopReader(userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/${userId}/certificates/top-reader`, null).pipe(map(res => res.data));
  }

  getBookDemand(): Observable<BookDemand[]> {
    return this.http.get<any>(`${this.apiUrl}/books/demand`).pipe(map(res => res.data));
  }

  getBookReaders(bookId: number): Observable<BookReader[]> {
    return this.http.get<any>(`${this.apiUrl}/books/${bookId}/readers`).pipe(map(res => res.data));
  }

  getRecentActivity(take = 50, type?: ActivityType): Observable<ActivityEvent[]> {
    let params = new HttpParams().set('take', take);
    if (type) params = params.set('type', type);
    return this.http.get<any>(`${this.apiUrl}/activity`, { params }).pipe(map(res => res.data));
  }
}
