import { Component, OnInit } from '@angular/core';

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

  ngOnInit() {
    const progressData = JSON.parse(localStorage.getItem('userProgress') || '{}');
    this.totalScore = progressData.totalScore || 0;
    this.pointsLeft = 1000 - this.totalScore;

    const alreadySent = localStorage.getItem('rewardClaimed');
    this.isAlreadySent = alreadySent === 'true';
    this.disableInput = this.isAlreadySent || this.totalScore < 1000;
  }

  sendUsername() {
    if (this.telegramUsername.startsWith('@') && this.telegramUsername.length > 3) {
      console.log('Yuborilgan Telegram username:', this.telegramUsername);
      localStorage.setItem('rewardClaimed', 'true');
      this.disableInput = true;
      this.isAlreadySent = true;
    } else {
      alert("Iltimos, to'g'ri Telegram username kiriting, masalan: @kitobsevar");
    }
  }
}
