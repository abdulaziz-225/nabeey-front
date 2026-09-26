import { Component, Input, OnInit } from '@angular/core';
import { QuizzesService } from 'src/app/quizzes/services/quizzes.service';

@Component({
  selector: 'app-progress-button',
  templateUrl: './progress-button.component.html',
  styleUrls: ['./progress-button.component.scss']
})
export class ProgressButtonComponent implements OnInit {
  @Input() currentScore: number = 0;
  @Input() maxScore: number = 1000;
  @Input() label: string = 'Ballar';

  progress: number = 0;

  constructor(private quizzesService: QuizzesService) {}

  ngOnInit() {
    this.calculateProgress();
    this.loadScoreFromBackend();
  }

  private loadScoreFromBackend(): void {
    const rawUserId = localStorage.getItem('userId');
    const userId = rawUserId ? JSON.parse(rawUserId) : null;
    if (!userId) return;

    this.quizzesService.getLeaderboard().subscribe({
      next: (list: any[]) => {
        const mine = (list || []).find(item => item.user?.id === userId);
        this.currentScore = mine ? mine.ball : 0;
        this.calculateProgress();
      },
      error: () => {}
    });
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
