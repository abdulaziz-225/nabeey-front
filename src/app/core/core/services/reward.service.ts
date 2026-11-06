import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

// Backend RewardType enum'i bilan bir xil tartib
export enum RewardType {
  Ball100 = 0,
  TopReader = 1,
}

export interface CertificateTemplate {
  type: RewardType;
  subtitle: string;
  body: string;
  quote: string;
  signerName: string;
  signerTitle: string;
  primaryColor: string;
  accentColor: string;
  updatedAt?: string | null;
}

export interface RewardCertificate {
  code: string;
  type: RewardType;
  userId: number;
  fullName: string;
  ball: number;
  threshold: number;
  issuedAt: string;
  template?: CertificateTemplate;
}

export interface RewardStatus {
  totalBall: number;
  threshold: number;
  eligible: boolean;
  certificates: RewardCertificate[];
}

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  private apiUrl: string = `${environment.apiUrl}/rewards`;

  constructor(private http: HttpClient) {}

  // Chegaraga yetgan bo'lsa backend shu so'rovda sertifikatni avtomatik beradi
  getMyStatus(): Observable<RewardStatus> {
    return this.http.get<any>(`${this.apiUrl}/my`).pipe(map(res => res.data));
  }

  verify(code: string): Observable<RewardCertificate> {
    return this.http.get<any>(`${this.apiUrl}/verify/${encodeURIComponent(code)}`).pipe(map(res => res.data));
  }

  // QR kod ham, ulashish havolasi ham shu manzilga olib boradi
  verifyUrl(code: string): string {
    return `${window.location.origin}/certificate/${encodeURIComponent(code)}`;
  }

  title(type: RewardType, threshold = 100): string {
    return type === RewardType.TopReader ? 'Eng faol kitobxon' : `${threshold} ball sertifikati`;
  }
}
