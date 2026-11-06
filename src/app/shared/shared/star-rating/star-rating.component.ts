import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

// Yulduzcha reyting: readonly — o'rtacha bahoni (kasr qismi bilan) ko'rsatadi,
// aks holda foydalanuvchi 1–5 yulduz tanlay oladi
@Component({
  selector: 'app-star-rating',
  template: `
    <span class="stars" [class.interactive]="!readonly" (mouseleave)="hovered = 0"
          [attr.role]="readonly ? 'img' : 'radiogroup'"
          [attr.aria-label]="readonly ? (value + ' / 5') : 'Baho tanlang'">
      <span *ngFor="let star of stars" class="star" [class.pulse]="pulseStar === star" [style.width.px]="size" [style.height.px]="size"
            (mouseenter)="!readonly && (hovered = star)"
            (click)="select(star)"
            [attr.role]="readonly ? null : 'radio'"
            [attr.aria-checked]="readonly ? null : value === star"
            [attr.title]="readonly ? null : labels[star - 1]">
        <mat-icon class="star-bg" [style.font-size.px]="size" [style.width.px]="size" [style.height.px]="size">star</mat-icon>
        <span class="star-fill" [style.width.%]="fill(star)">
          <mat-icon [style.font-size.px]="size" [style.width.px]="size" [style.height.px]="size">star</mat-icon>
        </span>
      </span>
    </span>
  `,
  styles: [`
    :host { display: inline-flex; vertical-align: middle; }
    .stars { display: inline-flex; gap: 2px; }
    .star { position: relative; display: inline-block; line-height: 0; }
    .star-bg { color: #e2e8f0; }
    .star-fill { position: absolute; top: 0; left: 0; height: 100%; overflow: hidden; color: #f59e0b; }
    .interactive .star { cursor: pointer; transition: transform 0.15s ease; }
    .interactive .star:hover { transform: scale(1.15); }
    .pulse { animation: star-pulse 0.35s ease-out; }
    @keyframes star-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
    @media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }
  `]
})
export class StarRatingComponent implements OnChanges, OnDestroy {
  @Input() value = 0;
  @Input() readonly = true;
  @Input() size = 18;
  @Output() rate = new EventEmitter<number>();

  readonly stars = [1, 2, 3, 4, 5];
  readonly labels = ['Yomon', "O'rtacha", 'Yaxshi', 'Juda yaxshi', "A'lo"];
  hovered = 0;
  // Baho qo'yilgandan keyin yulduzlar chapdan o'ngga bittalab to'ladi
  revealed: number | null = null;
  pulseStar = 0;
  private justRated = false;
  private timers: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.justRated && !this.readonly) {
      this.justRated = false;
      this.reveal(Math.round(this.value || 0));
    }
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearTimeout(t));
  }

  private reveal(stars: number): void {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    this.hovered = 0;
    this.revealed = 0;
    this.pulseStar = 0;
    for (let i = 1; i <= stars; i++) {
      this.timers.push(setTimeout(() => {
        this.revealed = i;
        if (i === stars) this.pulseStar = i;
      }, i * 50));
    }
    this.timers.push(setTimeout(() => {
      this.revealed = null;
      this.pulseStar = 0;
    }, stars * 50 + 400));
  }

  fill(star: number): number {
    const current = this.revealed ?? (this.hovered || this.value || 0);
    return Math.max(0, Math.min(1, current - (star - 1))) * 100;
  }

  select(star: number): void {
    if (this.readonly) return;
    this.justRated = true;
    this.rate.emit(star);
  }
}
