import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminService, AiAdminSettings, AiLibraryStatus } from '../../services/admin.service';

const DEFAULT_SETTINGS: AiAdminSettings = {
  systemPrompt: '',
  scopeInstructions: '',
  generalEnabled: true,
  libraryEnabled: true,
  includeBooks: true,
  includeArticles: true,
  includeQuestions: false
};

@Component({
  selector: 'app-ai-settings-dialog',
  templateUrl: './ai-settings-dialog.component.html',
  styleUrls: ['../dialog.scss', './ai-settings-dialog.component.scss']
})
export class AiSettingsDialogComponent implements OnInit {
  settings: AiAdminSettings = { ...DEFAULT_SETTINGS };
  libraryStatus: AiLibraryStatus | null = null;
  loadingSettings = true;
  saving = false;
  reindexing = false;
  loadError = '';
  saveError = '';
  statusError = '';
  saved = false;

  constructor(
    private adminService: AdminService,
    private dialogRef: MatDialogRef<AiSettingsDialogComponent>
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.refreshStatus();
  }

  loadSettings(): void {
    this.loadingSettings = true;
    this.loadError = '';
    this.adminService.getAiSettings().subscribe({
      next: settings => {
        this.settings = { ...DEFAULT_SETTINGS, ...settings };
        this.loadingSettings = false;
      },
      error: () => {
        this.loadError = 'AI sozlamalarini serverdan olib bo‘lmadi.';
        this.loadingSettings = false;
      }
    });
  }

  refreshStatus(): void {
    this.statusError = '';
    this.adminService.getAiLibraryStatus().subscribe({
      next: status => this.libraryStatus = status,
      error: () => this.statusError = 'Kutubxona indeks holatini olib bo‘lmadi.'
    });
  }

  save(): void {
    if (this.loadingSettings || this.saving || this.loadError) return;
    this.saving = true;
    this.saved = false;
    this.saveError = '';
    this.adminService.saveAiSettings(this.settings).subscribe({
      next: settings => {
        this.settings = { ...DEFAULT_SETTINGS, ...settings };
        this.saving = false;
        this.saved = true;
      },
      error: () => {
        this.saving = false;
        this.saveError = 'Saqlash bajarilmadi. Backend AI sozlamalari endpointini tekshiring.';
      }
    });
  }

  reindex(): void {
    if (this.reindexing) return;
    this.reindexing = true;
    this.statusError = '';
    this.adminService.reindexAiLibrary().subscribe({
      next: status => {
        this.libraryStatus = status;
        this.reindexing = status.state === 'queued' || status.state === 'running';
      },
      error: () => {
        this.reindexing = false;
        this.statusError = 'Indekslash boshlanmadi. Backend reindex endpointini tekshiring.';
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  get statusLabel(): string {
    const labels: Record<AiLibraryStatus['state'], string> = {
      idle: 'Boshlanmagan',
      queued: 'Navbatda',
      running: 'Indekslanmoqda',
      completed: 'Tayyor',
      failed: 'Xatolik'
    };
    return this.libraryStatus ? labels[this.libraryStatus.state] : 'Noma’lum';
  }
}