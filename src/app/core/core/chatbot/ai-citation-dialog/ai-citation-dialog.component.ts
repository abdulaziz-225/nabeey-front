import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/app/environments/environment';
import { AiCitation } from '../../models/ai-chat';

@Component({
  selector: 'app-ai-citation-dialog',
  templateUrl: './ai-citation-dialog.component.html',
  styleUrls: ['./ai-citation-dialog.component.scss']
})
export class AiCitationDialogComponent implements OnInit {
  source: any;
  loading = true;
  error = '';

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AiCitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public citation: AiCitation
  ) {}

  ngOnInit(): void {
    const endpoint = this.endpointForType(this.citation.type);
    if (!endpoint) {
      this.loading = false;
      this.error = 'Bu manba uchun batafsil sahifa mavjud emas.';
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/${endpoint}/get/${this.citation.sourceId}`).subscribe({
      next: response => {
        this.source = response?.data ?? response;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Manba ma’lumotini yuklab bo‘lmadi.';
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  get sourceText(): string {
    return this.source?.text || this.source?.description || '';
  }

  get fileUrl(): string | null {
    return this.source?.file?.filePath || null;
  }

  private endpointForType(type: string): string | null {
    switch (type.toLowerCase()) {
      case 'kitob': return 'books';
      case 'maqola': return 'article';
      case 'savol': return 'questions';
      default: return null;
    }
  }
}