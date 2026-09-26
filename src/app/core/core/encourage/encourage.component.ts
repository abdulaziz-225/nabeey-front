import { Component, OnInit } from '@angular/core';
import { QuizzesService } from 'src/app/quizzes/services/quizzes.service';

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
  telegramUsername: string = '';
  disableInput: boolean = false;
  isAlreadySent: boolean = false;
  pointsLeft: number = 1000;

  leaderboard: LeaderboardEntry[] = [];
  currentUserId: number | null = null;
  loadingLeaderboard: boolean = true;

  constructor(private quizzesService: QuizzesService) {}

  ngOnInit() {
    const id = localStorage.getItem('userId');
    this.currentUserId = id ? JSON.parse(id) : null;

    const alreadySent = localStorage.getItem('rewardClaimed');
    this.isAlreadySent = alreadySent === 'true';

    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.loadingLeaderboard = true;
    this.quizzesService.getLeaderboard().subscribe({
      next: (list: LeaderboardEntry[]) => {
        this.leaderboard = list || [];

        const mine = this.leaderboard.find(item => item.user?.id === this.currentUserId);
        this.totalScore = mine ? mine.ball : 0;
        this.pointsLeft = Math.max(0, 1000 - this.totalScore);
        this.disableInput = this.isAlreadySent || this.totalScore < 1000;

        this.loadingLeaderboard = false;
      },
      error: () => {
        this.loadingLeaderboard = false;
      }
    });
  }

  sendUsername() {
    if (this.telegramUsername.startsWith('@') && this.telegramUsername.length > 3) {
      localStorage.setItem('rewardClaimed', 'true');
      this.disableInput = true;
      this.isAlreadySent = true;
    } else {
      alert("Iltimos, to'g'ri Telegram username kiriting, masalan: @kitobsevar");
    }
  }
}
