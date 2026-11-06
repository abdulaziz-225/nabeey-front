import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { QuizzesService } from 'src/app/quizzes/services/quizzes.service';
import { animateNumber } from 'src/app/shared/shared/utils/animate-number';

@Component({
  selector: 'app-progress-button',
  templateUrl: './progress-button.component.html',
  styleUrls: ['./progress-button.component.scss']
})
export class ProgressButtonComponent implements OnInit, OnDestroy {
  @Input() currentScore: number = 0;
  @Input() maxScore: number = 100;
  @Input() label: string = 'Ballar';

  progress: number = 0;
  // Ko'rsatilayotgan ball (sanab chiqadi) va qo'shilgan ball belgisi ("+3")
  shownScore: number = 0;
  gained: number | null = null;
  animateBar = false;

  private userId: number | null = null;
  private stopCounter: () => void = () => {};
  private gainedTimer: any;
  private subscription?: Subscription;

  constructor(private quizzesService: QuizzesService) {}

  ngOnInit() {
    const rawUserId = localStorage.getItem('userId');
    this.userId = rawUserId ? Number(JSON.parse(rawUserId)) : null;
    this.shownScore = this.currentScore;
    this.calculateProgress();
    this.loadScoreFromBackend();
    // Test tugab ball yozilganda (dialog bosh sahifa ustida ochiladi) qayta yuklaymiz
    this.subscription = this.quizzesService.scoreChanged$.subscribe(() => this.loadScoreFromBackend());
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.stopCounter();
    clearTimeout(this.gainedTimer);
  }

  // Oxirgi ko'rilgan ball: sahifa yangilangandan keyin ham qo'shilgan ball ko'rinadi
  private get seenKey(): string {
    return `seenBall_${this.userId}`;
  }

  private loadScoreFromBackend(): void {
    const userId = this.userId;
    if (!userId) return;

    this.quizzesService.getLeaderboard().subscribe({
      next: (list: any[]) => {
        const mine = (list || []).find(item => item.user?.id === userId);
        this.showScore(mine ? mine.ball : 0);
      },
      error: () => {}
    });
  }

  private showScore(score: number): void {
    let seen: number | null = null;
    try {
      const raw = localStorage.getItem(this.seenKey);
      seen = raw === null ? null : Number(raw);
      localStorage.setItem(this.seenKey, String(score));
    } catch {}

    const from = seen !== null && seen < score ? seen : score;
    // Avval eski holatni animatsiyasiz qo'yamiz, keyin yangi ballgacha 0.8s da to'ldiramiz
    this.animateBar = false;
    this.currentScore = from;
    this.shownScore = from;
    this.calculateProgress();

    if (from === score) return;

    setTimeout(() => {
      this.animateBar = true;
      this.currentScore = score;
      this.calculateProgress();
      this.stopCounter();
      this.stopCounter = animateNumber(from, score, 800, v => this.shownScore = v);

      this.gained = score - from;
      clearTimeout(this.gainedTimer);
      this.gainedTimer = setTimeout(() => this.gained = null, 1600);
    }, 300);
  }

  private calculateProgress(): void {
    if (this.maxScore <= 0) {
      this.progress = 0;
      return;
    }

    const rawPercentage = (this.currentScore / this.maxScore) * 100;

    if (rawPercentage > 0 && rawPercentage < 1) {
      this.progress = 1;
    } else {
      this.progress = Math.round(rawPercentage);
    }

    this.progress = Math.min(this.progress, 100);
  }
}
