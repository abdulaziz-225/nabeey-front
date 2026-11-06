import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { niceMax } from '../column-chart/column-chart.component';

export interface LineSeries {
  name: string;
  color: string;
  values: number[];
}

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['../chart.scss']
})
export class LineChartComponent implements OnChanges {
  @Input() labels: string[] = [];
  @Input() series: LineSeries[] = [];
  @Input() height = 240;

  @ViewChild('svg') svgRef?: ElementRef<SVGSVGElement>;

  readonly width = 600;
  readonly pad = { top: 12, right: 12, bottom: 26, left: 32 };

  paths: { d: string; color: string; name: string }[] = [];
  ticks: { y: number; value: number }[] = [];
  xLabels: { x: number; text: string }[] = [];
  hovered: number | null = null;
  private max = 1;

  get plotBottom(): number {
    return this.height - this.pad.bottom;
  }

  ngOnChanges(): void {
    const n = this.labels.length;
    if (!n || !this.series.length) { this.paths = []; this.ticks = []; this.xLabels = []; return; }

    this.max = niceMax(Math.max(1, ...this.series.flatMap(s => s.values)));
    const plotH = this.plotBottom - this.pad.top;

    this.paths = this.series.map(s => ({
      name: s.name,
      color: s.color,
      d: s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${this.x(i)},${this.y(v)}`).join(' '),
    }));

    this.ticks = [0, 0.5, 1].map(f => ({ y: this.plotBottom - f * plotH, value: Math.round(this.max * f) }));

    const step = Math.ceil(n / 6);
    this.xLabels = this.labels
      .map((text, i) => ({ x: this.x(i), text, i }))
      .filter(l => l.i % step === 0 || l.i === n - 1);
  }

  x(i: number): number {
    const n = this.labels.length;
    const plotW = this.width - this.pad.left - this.pad.right;
    return n <= 1 ? this.pad.left + plotW / 2 : this.pad.left + (i / (n - 1)) * plotW;
  }

  y(v: number): number {
    const plotH = this.plotBottom - this.pad.top;
    return this.plotBottom - (v / this.max) * plotH;
  }

  onMove(event: MouseEvent): void {
    const svg = this.svgRef?.nativeElement;
    if (!svg || !this.labels.length) return;
    const rect = svg.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * this.width;
    const plotW = this.width - this.pad.left - this.pad.right;
    const ratio = (px - this.pad.left) / plotW;
    this.hovered = Math.min(this.labels.length - 1, Math.max(0, Math.round(ratio * (this.labels.length - 1))));
  }

  tooltipLeft(i: number): string {
    return `${(this.x(i) / this.width) * 100}%`;
  }
}
