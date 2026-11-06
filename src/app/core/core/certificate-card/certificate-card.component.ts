import { Component, Input } from '@angular/core';
import { CertificateTemplate, RewardType } from '../services/reward.service';

// Sertifikatning asl o'lchami (A4 albom, 96 dpi)
export const CERT_WIDTH = 1123;
export const CERT_HEIGHT = 794;

// Bir rangni ikkinchisiga ratio ulushda aralashtiradi (html2canvas color-mix'ni bilmaydi)
function mix(hex: string, target: string, ratio: number): string {
  const parse = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const a = parse(hex);
  const b = parse(target);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * ratio).toString(16).padStart(2, '0')).join('');
}

@Component({
  selector: 'app-certificate-card',
  templateUrl: './certificate-card.component.html',
  styleUrls: ['./certificate-card.component.scss']
})
export class CertificateCardComponent {
  @Input() fullName = '';
  @Input() code = '';
  @Input() issuedAt: string | Date = new Date();
  @Input() type: RewardType = RewardType.Ball100;
  @Input() threshold = 100;
  @Input() template!: CertificateTemplate;
  @Input() qrDataUrl = '';

  readonly width = CERT_WIDTH;
  readonly height = CERT_HEIGHT;

  get isTopReader(): boolean {
    return this.type === RewardType.TopReader;
  }

  get body(): string {
    return (this.template?.body ?? '').replace(/\{ball\}/g, String(this.threshold));
  }

  get colorVars(): Record<string, string> {
    const primary = this.template?.primaryColor || '#1e3a8a';
    const accent = this.template?.accentColor || '#c9a227';
    return {
      '--cert-primary': primary,
      '--cert-primary-light': mix(primary, '#ffffff', 0.55),
      '--cert-primary-ring': mix(primary, '#ffffff', 0.85),
      '--cert-accent': accent,
      '--cert-accent-dark': mix(accent, '#000000', 0.3),
      '--cert-accent-ink': mix(accent, '#000000', 0.6),
      '--cert-accent-light': mix(accent, '#ffffff', 0.45),
      '--cert-accent-soft': mix(accent, '#ffffff', 0.45),
      '--cert-accent-line': mix(accent, '#ffffff', 0.4),
      '--cert-accent-ring': mix(accent, '#ffffff', 0.8),
    };
  }
}
