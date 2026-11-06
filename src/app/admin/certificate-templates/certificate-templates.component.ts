import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as QRCode from 'qrcode';
import { AdminService } from '../services/admin.service';
import { CertificateTemplate, RewardService, RewardType } from 'src/app/core/core/services/reward.service';
import { CERT_HEIGHT, CERT_WIDTH } from 'src/app/core/core/certificate-card/certificate-card.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../dialogs/confirm-dialog/confirm-dialog.component';

const HEX = /^#[0-9a-fA-F]{6}$/;

@Component({
  selector: 'app-certificate-templates',
  templateUrl: './certificate-templates.component.html',
  styleUrls: ['../admin.scss', './certificate-templates.component.scss']
})
export class CertificateTemplatesComponent implements OnInit {
  @ViewChild('stage') stageRef?: ElementRef<HTMLElement>;

  readonly types = [
    { value: RewardType.Ball100, label: '100 ball sertifikati', icon: 'workspace_premium', hint: '100 ballga yetganda avtomatik beriladi' },
    { value: RewardType.TopReader, label: 'Eng faol kitobxon', icon: 'military_tech', hint: 'Super Admin tomonidan beriladi' },
  ];

  templates: CertificateTemplate[] = [];
  active: RewardType = RewardType.Ball100;
  loading = true;
  saving = false;
  errorMessage = '';
  scale = 0.5;
  qrDataUrl = '';
  readonly previewWidth = CERT_WIDTH;
  readonly previewHeight = CERT_HEIGHT;
  readonly today = new Date();

  form = new FormGroup({
    subtitle: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(220)] }),
    quote: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(180)] }),
    signerName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(40)] }),
    signerTitle: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    primaryColor: new FormControl('#1e3a8a', { nonNullable: true, validators: [Validators.required, Validators.pattern(HEX)] }),
    accentColor: new FormControl('#c9a227', { nonNullable: true, validators: [Validators.required, Validators.pattern(HEX)] }),
  });

  constructor(
    private adminService: AdminService,
    private rewardService: RewardService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit(): Promise<void> {
    // Namuna QR: haqiqiy sertifikatdagi kabi tekshirish sahifasiga olib boradi
    this.qrDataUrl = await QRCode.toDataURL(this.rewardService.verifyUrl('KS-2026-NAMUNA'), {
      margin: 0, width: 240, color: { dark: '#1e293b', light: '#ffffff' },
    });

    this.adminService.getCertificateTemplates().subscribe({
      next: templates => {
        this.templates = templates;
        this.loading = false;
        this.select(this.active);
        setTimeout(() => this.fit());
      },
      error: () => (this.loading = false),
    });
  }

  @HostListener('window:resize')
  fit(): void {
    const available = this.stageRef?.nativeElement.clientWidth ?? CERT_WIDTH / 2;
    this.scale = Math.min(1, available / CERT_WIDTH);
  }

  // Preview har bir tugma bosilishida forma qiymatidan chiziladi
  get preview(): CertificateTemplate {
    return { type: this.active, ...this.form.getRawValue() };
  }

  get current(): CertificateTemplate | undefined {
    return this.templates.find(t => t.type === this.active);
  }

  get activeMeta() {
    return this.types.find(t => t.value === this.active)!;
  }

  select(type: RewardType): void {
    if (this.form.dirty && type !== this.active) {
      this.confirm('Saqlanmagan o\'zgarishlar bor', "O'zgarishlar saqlanmaydi. Boshqa shablonga o'tasizmi?", "O'tish", 'swap_horiz', 'primary')
        .then(ok => ok && this.load(type));
      return;
    }
    this.load(type);
  }

  onColorText(control: 'primaryColor' | 'accentColor', value: string): void {
    const v = value.startsWith('#') ? value : '#' + value;
    this.form.controls[control].setValue(v);
    this.form.markAsDirty();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.errorMessage = '';
    this.adminService.saveCertificateTemplate(this.active, this.preview).subscribe({
      next: saved => this.afterSave(saved, 'Shablon saqlandi'),
      error: err => {
        this.saving = false;
        this.errorMessage = err.error?.message || "Saqlab bo'lmadi";
      },
    });
  }

  async reset(): Promise<void> {
    const ok = await this.confirm('Standart shablon', `"${this.activeMeta.label}" shabloni boshlang'ich matn va ranglarga qaytariladi.`, 'Qaytarish', 'restart_alt', 'danger');
    if (!ok) return;
    this.saving = true;
    this.adminService.resetCertificateTemplate(this.active).subscribe({
      next: saved => this.afterSave(saved, 'Standart shablon tiklandi'),
      error: err => {
        this.saving = false;
        this.errorMessage = err.error?.message || "Qaytarib bo'lmadi";
      },
    });
  }

  private afterSave(saved: CertificateTemplate, message: string): void {
    this.templates = this.templates.map(t => (t.type === saved.type ? saved : t));
    this.saving = false;
    this.load(saved.type);
    this.snackBar.open(message, 'Yopish', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private load(type: RewardType): void {
    this.active = type;
    const t = this.templates.find(x => x.type === type);
    if (!t) return;
    this.form.reset({
      subtitle: t.subtitle,
      body: t.body,
      quote: t.quote,
      signerName: t.signerName,
      signerTitle: t.signerTitle,
      primaryColor: t.primaryColor,
      accentColor: t.accentColor,
    });
    this.errorMessage = '';
  }

  private confirm(title: string, message: string, confirmLabel: string, icon: string, tone: 'danger' | 'primary'): Promise<boolean> {
    const data: ConfirmDialogData = { title, message, confirmLabel, icon, tone };
    return new Promise(resolve =>
      this.dialog.open(ConfirmDialogComponent, { width: '420px', data }).afterClosed().subscribe(r => resolve(!!r)));
  }
}
