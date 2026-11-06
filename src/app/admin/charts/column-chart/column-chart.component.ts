import { Component, Input, OnChanges } from '@angular/core';

export interface ColumnPoint {
  label: string;
  value: number;
}

// Yuqori chegara har doim juft: o'rta chiziq (max / 2) butun son bo'lib chiqadi
export function niceMax(value: number): number {
  if (value <= 4) return 4;
  if (value <= 10) return value <= 6 ? 6 : value <= 8 ? 8 : 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

@Component({
  selector: 'app-column-chart',
  templateUrl: './column-chart.component.html',
  styleUrls: ['../chart.scss']
})
export class ColumnChartComponent implements OnChanges {
  @Input() data: ColumnPoint[] = [];
  @Input() seriesName = '';
  @Input() color = 'var(--series-1)';
  @Input() height = 200;

  readonly width = 600;
  readonly pad = { top: 12, right: 8, bottom: 26, left: 32 };

  bars: { x: number; y: number; w: number; h: number; hitX: number; hitW: number; point: ColumnPoint }[] = [];
  ticks: { y: number; value: number }[] = [];
  xLabels: { x: number; text: string }[] = [];
  hovered: number | null = null;

  get plotBottom(): number {
    return this.height - this.pad.bottom;
  }

  ngOnChanges(): void {
    const n = this.data.length;
    if (!n) { this.bars = []; this.ticks = []; this.xLabels = []; return; }

    const max = niceMax(Math.max(...this.data.map(d => d.value), 1));
    const plotW = this.width - this.pad.left - this.pad.right;
    const plotH = this.plotBottom - this.pad.top;
    const slot = plotW / n;
    const gap = 2;
    const barW = Math.max(slot - gap, 1);

    this.bars = this.data.map((point, i) => {
      const h = (point.value / max) * plotH;
      const x = this.pad.left + i * slot + gap / 2;
      return { x, y: this.plotBottom - h, w: barW, h, hitX: this.pad.left + i * slot, hitW: slot, point };
    });

    this.ticks = [0, 0.5, 1].map(f => ({ y: this.plotBottom - f * plotH, value: Math.round(max * f) }));

    const step = Math.ceil(n / 6);
    this.xLabels = this.data
      .map((d, i) => ({ x: this.pad.left + i * slot + slot / 2, text: d.label, i }))
      .filter(l => l.i % step === 0 || l.i === n - 1);
  }

  // Yuqori burchaklari yumaloq, pastki qismi bazaviy chiziqqa tekis
  barPath(b: { x: number; y: number; w: number; h: number }): string {
    if (b.h <= 0) return '';
    const r = Math.min(4, b.w / 2, b.h);
    const bottom = b.y + b.h;
    return `M${b.x},${bottom} V${b.y + r} Q${b.x},${b.y} ${b.x + r},${b.y} H${b.x + b.w - r} Q${b.x + b.w},${b.y} ${b.x + b.w},${b.y + r} V${bottom} Z`;
  }

  tooltipLeft(i: number): string {
    const b = this.bars[i];
    return `${((b.hitX + b.hitW / 2) / this.width) * 100}%`;
  }
}
