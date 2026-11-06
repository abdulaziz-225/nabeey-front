import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { RewardCertificate, RewardService, RewardType } from '../services/reward.service';
import { CERT_HEIGHT, CERT_WIDTH } from '../certificate-card/certificate-card.component';

@Component({
  selector: 'app-certificate-view',
  templateUrl: './certificate-view.component.html',
  styleUrls: ['./certificate-view.component.scss']
})
export class CertificateViewComponent implements OnInit {
  @ViewChild('stage') stageRef?: ElementRef<HTMLElement>;
  @ViewChild('cert', { read: ElementRef }) certRef?: ElementRef<HTMLElement>;

  readonly width = CERT_WIDTH;
  readonly height = CERT_HEIGHT;

  code = '';
  certificate?: RewardCertificate;
  qrDataUrl = '';
  verifyUrl = '';
  loading = true;
  notFound = false;
  downloading = false;
  scale = 1;

  readonly isLoggedIn = !!localStorage.getItem('userId');

  get isTopReader(): boolean {
    return this.certificate?.type === RewardType.TopReader;
  }

  constructor(
    private route: ActivatedRoute,
    private rewardService: RewardService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.code = this.route.snapshot.paramMap.get('code') ?? '';
    this.verifyUrl = this.rewardService.verifyUrl(this.code);

    this.rewardService.verify(this.code).subscribe({
      next: async certificate => {
        this.certificate = certificate;
        // QR aynan shu sahifaning manzilini saqlaydi: skanerlansa shu tekshiruv sahifasi ochiladi
        this.qrDataUrl = await QRCode.toDataURL(this.rewardService.verifyUrl(certificate.code), {
          margin: 0,
          width: 240,
          errorCorrectionLevel: 'M',
          color: { dark: '#1e293b', light: '#ffffff' },
        });
        this.loading = false;
        setTimeout(() => this.fit());
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  @HostListener('window:resize')
  fit(): void {
    const available = this.stageRef?.nativeElement.clientWidth ?? CERT_WIDTH;
    this.scale = Math.min(1, available / CERT_WIDTH);
  }

  async download(): Promise<void> {
    const el = this.certRef?.nativeElement.querySelector<HTMLElement>('.cert');
    if (!el || !this.certificate) return;

    this.downloading = true;
    const previousScale = this.scale;
    // html2canvas ota elementning transform'ini ham hisobga oladi, shuning uchun vaqtincha asl o'lcham
    this.scale = 1;
    await new Promise(r => setTimeout(r, 50));

    try {
      await document.fonts?.ready;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#fffdf7', useCORS: true });
      const link = document.createElement('a');
      link.download = `kitobsevar-sertifikat-${this.certificate.code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      this.scale = previousScale;
      this.downloading = false;
    }
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.verifyUrl);
      this.snackBar.open('Havola nusxalandi', 'Yopish', { duration: 2500, panelClass: ['success-snackbar'] });
    } catch {
      this.snackBar.open(this.verifyUrl, 'Yopish', { duration: 5000 });
    }
  }
}
