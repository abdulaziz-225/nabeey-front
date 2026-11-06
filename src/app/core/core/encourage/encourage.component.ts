import { Component, OnInit } from '@angular/core';
import { QuizzesService } from 'src/app/quizzes/services/quizzes.service';
import { RewardCertificate, RewardService, RewardType } from '../services/reward.service';

interface LeaderboardEntry {
  rating: number;
  ball: number;
  user: { id: number; firstName: string; lastName: string } | null;
}

@Component({
  selector: 'app-encourage',
  templateUrl: './encourage.component.html',
  styleUrls: ['./encourage.component.scss']
})
export class EncourageComponent implements OnInit {
  totalScore: number = 0;
  threshold: number = 100;
  certificates: RewardCertificate[] = [];
  loadingStatus: boolean = true;

  leaderboard: LeaderboardEntry[] = [];
  currentUserId: number | null = null;
  loadingLeaderboard: boolean = true;
  leaderboardPeriod: 'day' | 'week' | 'month' | 'all' = 'all';
  readonly leaderboardPeriods: { value: 'day' | 'week' | 'month' | 'all'; label: string }[] = [
    { value: 'day', label: 'Kunlik' },
    { value: 'week', label: 'Haftalik' },
    { value: 'month', label: 'Oylik' },
    { value: 'all', label: 'Umumiy' }
  ];

  constructor(private quizzesService: QuizzesService, private rewardService: RewardService) {}

  ngOnInit() {
    const id = localStorage.getItem('userId');
    this.currentUserId = id ? Number(JSON.parse(id)) : null;

    this.loadStatus();
    this.loadLeaderboard();
  }

  get pointsLeft(): number {
    return Math.max(0, this.threshold - this.totalScore);
  }

  get hasBallCertificate(): boolean {
    return this.certificates.some(c => c.type === RewardType.Ball100);
  }

  certificateTitle(c: RewardCertificate): string {
    return this.rewardService.title(c.type, c.threshold);
  }

  // Ball va sertifikatlar backend'dan: 100 ballga yetgan bo'lsa sertifikat shu so'rovda beriladi
  loadStatus(): void {
    this.loadingStatus = true;
    this.rewardService.getMyStatus().subscribe({
      next: status => {
        this.totalScore = status.totalBall;
        this.threshold = status.threshold;
        this.certificates = status.certificates;
        this.loadingStatus = false;
      },
      error: () => {
        this.loadingStatus = false;
      }
    });
  }

  setLeaderboardPeriod(period: 'day' | 'week' | 'month' | 'all'): void {
    if (this.leaderboardPeriod === period) return;
    this.leaderboardPeriod = period;
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.loadingLeaderboard = true;
    this.quizzesService.getLeaderboard(this.leaderboardPeriod).subscribe({
      next: (list: LeaderboardEntry[]) => {
        this.leaderboard = list || [];
        this.loadingLeaderboard = false;
      },
      error: () => {
        this.loadingLeaderboard = false;
      }
    });
  }
}
