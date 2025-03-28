import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-begin-quiz',
  templateUrl: './begin-quiz.component.html',
  styleUrls: ['./begin-quiz.component.scss']
})
export class BeginQuizComponent{

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

  constructor(
    public dialogRef: MatDialogRef<BeginQuizComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    public dialog: MatDialog
  ) {
    console.log(data.book, 'fu');
    
    this.startCountdown();
  }

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

  checkAnswer(isTrue: boolean, answerText: string): void {
    if (!this.selectedAnswer) {
      this.selectedAnswer = answerText;
      clearInterval(this.timer);
      if (isTrue) {
        this.correctAnswers++;
      } else {
        this.incorrectAnswers++;
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

    let percentage = (this.correctAnswers / this.data.book.questions.length) * 100;
    this.finishQuiz(percentage);
  }

  finishQuiz(percentage: number) {
    if (percentage >= 80) {
      this.quizResult = { 
        bg: 'bg-green-500', 
        message: `Qoyilmaqom! ${percentage.toFixed(1)}% natijaga erishdingiz! \nKitob o‘qishda davom eting!`, 
        gif: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExajM2Y29uOXdwYXE5eGxuMWFhdmttMzFxY240NWwwdDg5c2I5bjRtMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/duNowzaVje6Di3hnOu/giphy.gif' 
      };
    } else if (percentage >= 50) {
      this.quizResult = { 
        bg: 'bg-yellow-500', 
        message: `Yaxshi natija! ${percentage.toFixed(1)}% ga erishdingiz, lekin hali yaxshiroq bo‘lishi mumkin!`, 
        gif: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif' 
      };
    } else {
      this.quizResult = { 
        bg: 'bg-red-500', 
        message: `Siz ${percentage.toFixed(1)}% natijaga erishdingiz. Yanada ko‘proq kitob o‘qishingiz kerak!`, 
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
