import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { QuestionAnswerService } from 'src/app/quizzes/services/question-answer.service';
import { QuizzesService } from 'src/app/quizzes/services/quizzes.service';

@Component({
  selector: 'app-begin-quiz',
  templateUrl: './begin-quiz.component.html',
  styleUrls: ['./begin-quiz.component.scss']
})
export class BeginQuizComponent implements OnInit{

  currentQuestionIndex: number = -1;
  countdown: number = 3;
  score: number = 0;
  selectedAnswer: string | null = null;
  showLetsGoMessage: boolean = false;
  correctAnswers = 0;
  incorrectAnswers = 0;
  timeLeft: number = 30;
  timer: any;
  isQuizFinished: boolean = false;
  quizResult: { bg: string, message: string, gif: string } = { bg: '', message: '', gif: '' };

  userId: number | null = null;
  quizId: number | null = null;
  totalScore: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<BeginQuizComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private questionAnswerService: QuestionAnswerService,
    private quizzesService: QuizzesService
  ) {
    const id = localStorage.getItem('userId');
    this.userId = id ? JSON.parse(id) : null;
    this.quizId = this.data.book?.quiz?.id ?? null;

    this.startCountdown();
  }

  ngOnInit(): void {}

  startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);

        this.showLetsGoMessage = true;

        setTimeout(() => {
          this.showLetsGoMessage = false;
          this.currentQuestionIndex = 0;
          this.startTimer();
        }, 1000);
      }
    }, 1000);
  }

  startTimer() {
    this.timeLeft = 30;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft === 0) {
        clearInterval(this.timer);
        this.nextQuestion();
      }
    }, 1000);
  }

  get currentQuestion() {
    return this.data.book.questions[this.currentQuestionIndex];
  }

  selectAnswer(answer: any) {
    this.selectedAnswer = answer;
  }

  checkAnswer(answer: any): void {
    if (!this.selectedAnswer) {
      this.selectedAnswer = answer.text;
      clearInterval(this.timer);
      if (answer.isTrue) {
        this.correctAnswers++;
      } else {
        this.incorrectAnswers++;
      }

      if (this.userId && this.quizId) {
        this.questionAnswerService.sumbitAnswer({
          answerId: answer.id,
          questionId: this.currentQuestion.id,
          userId: this.userId,
          quizId: this.quizId
        }).subscribe({ error: () => {} });
      }
    }

    setTimeout(() => {
      if(this.selectedAnswer){
         this.nextQuestion();
      }
    }, 1300);
  }

  nextQuestion() {
    clearInterval(this.timer);
    this.selectedAnswer = null;

    if (this.currentQuestionIndex < this.data.book.questions.length - 1) {
      this.currentQuestionIndex++;
      this.startTimer();
    } else {
      this.finishQuizz();
    }
  }

  finishQuizz() {
    this.isQuizFinished = true;
    this.currentQuestionIndex = -1;

    const percentage = (this.correctAnswers / this.data.book.questions.length) * 100;
    const bookId = this.data.book.id;

    const completedBooks: number[] = JSON.parse(localStorage.getItem('completedBookIds') || '[]');
    const alreadyCompleted = completedBooks.includes(bookId);
    const score = alreadyCompleted ? 0 : this.correctAnswers;

    if (!alreadyCompleted) {
      completedBooks.push(bookId);
      localStorage.setItem('completedBookIds', JSON.stringify(completedBooks));
    }

    if (this.userId && this.quizId) {
      this.quizzesService.getQuizResult(this.quizId, String(this.userId)).subscribe({
        next: () => this.refreshTotalScore(),
        error: () => this.refreshTotalScore()
      });
    }

    this.finishQuiz(percentage, alreadyCompleted, score);
  }

  private refreshTotalScore(): void {
    if (!this.userId) return;
    this.quizzesService.getLeaderboard().subscribe({
      next: (list) => {
        const mine = list.find((item: any) => item.user?.id === this.userId);
        this.totalScore = mine ? mine.ball : 0;
      },
      error: () => {}
    });
  }

  finishQuiz(percentage: number, alreadyCompleted: boolean, score: number) {
    if (alreadyCompleted) {
      this.quizResult = {
        bg: 'bg-gray-400',
        message: `Siz bu kitobni ilgari ishlagansiz, shuning uchun ball qo‘shilmadi.`,
        gif: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif'
      };
    } else if (percentage >= 80) {
      this.quizResult = {
        bg: 'bg-green-500',
        message: `Qoyilmaqom! Siz bu kitobdan ${score} ball oldingiz! (${percentage.toFixed(1)}%) \nKitob o‘qishda davom eting!`,
        gif: 'https://media.giphy.com/media/xT0GqeSlGSRQut4JSo/giphy.gif'
      };
    } else if (percentage >= 50) {
      this.quizResult = {
        bg: 'bg-yellow-500',
        message: `Yaxshi natija! Bu kitobdan ${score} ball oldingiz. (${percentage.toFixed(1)}%) \nHali ham kuchliroq bo‘lishingiz mumkin!`,
        gif: 'https://media.giphy.com/media/l0K4nGhy7aD6Z4zvO/giphy.gif'
      };
    } else {
      this.quizResult = {
        bg: 'bg-red-500',
        message: `Bu kitobdan ${score} ball oldingiz. (${percentage.toFixed(1)}%) \nKo‘proq kitob o‘qib, yana urinib ko‘ring!`,
        gif: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif'
      };
    }
  }

  restartQuiz() {
    this.isQuizFinished = false;
    this.quizResult = { bg: '', message: '', gif: '' };
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
    this.currentQuestionIndex = 0;
    this.startTimer();
  }

  goToHome() {
    this.dialogRef.close();
  }

}
