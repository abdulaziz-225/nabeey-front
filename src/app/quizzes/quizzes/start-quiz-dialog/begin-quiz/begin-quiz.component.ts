import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizzesService } from 'src/app/quizzes/services/quizzes.service';
import {
  QuizAttempt,
  QuizAttemptAnswerResult,
  QuizAttemptOption,
  QuizAttemptQuestion,
  QuizAttemptReviewItem,
  QuizAttemptService
} from 'src/app/quizzes/services/quiz-attempt.service';
import { ConfirmDeleteComponent } from 'src/app/shared/shared/confirm-delete/confirm-delete.component';
import { animateNumber } from 'src/app/shared/shared/utils/animate-number';

// Test serverdagi urinish (QuizAttempt) orqali ishlaydi: savollar to'g'ri javob belgisisiz keladi,
// javob va taymer serverda tekshiriladi, sahifa yangilansa urinish serverdan davom ettiriladi.
@Component({
  selector: 'app-begin-quiz',
  templateUrl: './begin-quiz.component.html',
  styleUrls: ['./begin-quiz.component.scss']
})
export class BeginQuizComponent implements OnDestroy {

  attempt: QuizAttempt | null = null;
  questions: QuizAttemptQuestion[] = [];
  currentQuestionIndex: number = -1;
  countdown: number = 3;
  showLetsGoMessage: boolean = false;
  correctAnswers = 0;
  incorrectAnswers = 0;
  questionSeconds = 30;
  timeLeft: number = 30;
  isQuizFinished: boolean = false;

  // Natija ekrani
  result: QuizAttempt | null = null;
  tier: 'excellent' | 'good' | 'low' | 'practice' = 'good';
  percentage = 0;
  ringPercentage = 0;
  resultIcon = '';
  resultTitle = '';
  resultMessage = '';
  showReview = false;
  reviewFilter: 'all' | 'wrong' = 'all';
  // Natija ekranida 0 dan sanab chiqadigan raqamlar
  shown = { percent: 0, correct: 0, wrong: 0 };
  private stopCounters: (() => void)[] = [];

  // Tanlangan javob va server bergan natija (null — javob kutilmoqda)
  selectedAnswerId: number | null = null;
  selectedIsCorrect: boolean | null = null;

  userId: number | null = null;
  totalScore: number | null = null;

  private timer: any;
  private countdownInterval: any;
  private letsGoTimeout: any;
  private advanceTimeout: any;
  private deadline = 0;
  private nextIndex: number | null = null;
  private busy = false;
  private exitConfirmOpen = false;

  constructor(
    public dialogRef: MatDialogRef<BeginQuizComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book: any; resume?: QuizAttempt },
    public dialog: MatDialog,
    private quizAttemptService: QuizAttemptService,
    private quizzesService: QuizzesService,
    private snackBar: MatSnackBar
  ) {
    const id = localStorage.getItem('userId');
    this.userId = id ? Number(JSON.parse(id)) : null;

    if (this.data.resume) {
      this.applyAttempt(this.data.resume);
    } else {
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  get currentQuestion(): QuizAttemptQuestion | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  get bookTitle(): string {
    return this.attempt?.bookTitle || this.data.book?.title || '';
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval);
        this.showLetsGoMessage = true;

        this.letsGoTimeout = setTimeout(() => {
          this.showLetsGoMessage = false;
          this.startAttempt();
        }, 1000);
      }
    }, 1000);
  }

  private startAttempt() {
    const bookId = this.attempt?.bookId ?? this.data.book?.id;
    const quizId = this.attempt?.quizId ?? this.data.book?.quiz?.id;

    this.quizAttemptService.start(bookId, quizId).subscribe({
      next: attempt => this.applyAttempt(attempt),
      error: err => {
        this.notify(err?.error?.message || "Testni boshlab bo'lmadi");
        this.dialogRef.close();
      }
    });
  }

  // Serverdagi urinish holatini ekranga qo'yish (yangi, davom ettirilgan yoki qayta sinxronlangan)
  private applyAttempt(attempt: QuizAttempt) {
    this.clearTimers();
    this.attempt = attempt;
    this.questions = attempt.questions;
    this.questionSeconds = attempt.questionSeconds || 30;
    this.countdown = 0;
    this.showLetsGoMessage = false;
    this.selectedAnswerId = null;
    this.selectedIsCorrect = null;
    this.busy = false;

    this.correctAnswers = attempt.savedAnswers.filter(a => a.isCorrect).length;
    // Vaqti tugab o'tkazib yuborilgan savollarda saqlangan javob bo'lmaydi
    this.incorrectAnswers = Math.max(0, attempt.currentQuestionIndex - this.correctAnswers);

    if (attempt.currentQuestionIndex >= attempt.questionCount) {
      this.finishAttempt();
      return;
    }

    this.currentQuestionIndex = attempt.currentQuestionIndex;
    if (attempt.secondsLeft <= 0) {
      this.onTimeUp();
    } else {
      this.startTimer(attempt.secondsLeft);
    }
  }

  private startTimer(seconds: number) {
    clearInterval(this.timer);
    this.deadline = Date.now() + seconds * 1000;
    this.timeLeft = seconds;

    // Qolgan vaqt deadline'dan hisoblanadi: brauzer tab'ni sekinlashtirsa ham to'g'ri ishlaydi
    this.timer = setInterval(() => {
      this.timeLeft = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));
      if (this.timeLeft === 0) {
        clearInterval(this.timer);
        this.onTimeUp();
      }
    }, 1000);
  }

  private onTimeUp() {
    if (!this.attempt || this.busy || this.selectedAnswerId !== null) return;

    this.busy = true;
    this.quizAttemptService.advance(this.attempt.id).subscribe({
      next: res => {
        this.busy = false;
        this.incorrectAnswers++;
        this.goToQuestion(res.currentQuestionIndex);
      },
      error: err => this.resync(err)
    });
  }

  checkAnswer(option: QuizAttemptOption): void {
    if (!this.attempt || !this.currentQuestion || this.busy || this.selectedAnswerId !== null) return;

    clearInterval(this.timer);
    this.selectedAnswerId = option.id;
    this.selectedIsCorrect = null;
    this.busy = true;

    this.quizAttemptService.answer(this.attempt.id, this.currentQuestion.id, option.id).subscribe({
      next: (res: QuizAttemptAnswerResult) => {
        this.busy = false;
        this.selectedIsCorrect = res.isCorrect;
        if (res.isCorrect) {
          this.correctAnswers++;
        } else {
          this.incorrectAnswers++;
        }
        if (res.timedOut) {
          this.notify('Vaqt tugaganidan keyin javob berildi — hisobga olinmadi');
        }

        this.nextIndex = res.currentQuestionIndex;
        this.advanceTimeout = setTimeout(() => this.nextQuestion(), 1300);
      },
      error: err => this.resync(err)
    });
  }

  // "Keyingi" tugmasi yoki javobdan keyingi avtomatik o'tish
  nextQuestion() {
    if (this.nextIndex === null) return;
    clearTimeout(this.advanceTimeout);
    const index = this.nextIndex;
    this.nextIndex = null;
    this.goToQuestion(index);
  }

  private goToQuestion(index: number) {
    this.selectedAnswerId = null;
    this.selectedIsCorrect = null;

    if (index >= this.questions.length) {
      this.finishAttempt();
      return;
    }
    this.currentQuestionIndex = index;
    this.startTimer(this.questionSeconds);
  }

  private finishAttempt() {
    if (!this.attempt) return;
    this.clearTimers();
    this.busy = true;

    this.quizAttemptService.finish(this.attempt.id).subscribe({
      next: result => {
        this.busy = false;
        this.isQuizFinished = true;
        this.currentQuestionIndex = -1;
        this.correctAnswers = result.correctAnswers;
        this.incorrectAnswers = Math.max(0, result.questionCount - result.correctAnswers);
        this.showResult(result);
        this.refreshTotalScore();
        if (result.isScoreEligible) {
          this.quizzesService.scoreChanged$.next();
        }
      },
      error: err => this.resync(err)
    });
  }

  // Server bilan holat mos kelmay qolsa (masalan, boshqa tabda davom ettirilgan) — serverdagisini olamiz
  private resync(err: any) {
    this.busy = false;
    this.clearTimers();
    this.quizAttemptService.getActive().subscribe({
      next: active => {
        if (active && active.id === this.attempt?.id) {
          this.applyAttempt(active);
        } else {
          this.notify(err?.error?.message || 'Test holati yangilandi');
          this.dialogRef.close();
        }
      },
      error: () => {
        this.notify("Server bilan aloqa yo'q. Sahifani yangilab, testni davom ettiring.");
        this.dialogRef.close();
      }
    });
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

  private showResult(result: QuizAttempt) {
    this.result = result;
    this.showReview = false;
    this.reviewFilter = 'all';
    this.percentage = result.questionCount ? Math.round((result.correctAnswers / result.questionCount) * 100) : 0;
    // Halqa va raqamlar 1 soniyada 0 dan haqiqiy qiymatgacha to'ladi
    this.ringPercentage = 0;
    setTimeout(() => this.ringPercentage = this.percentage, 50);
    this.startCounters();

    const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

    if (!result.isScoreEligible) {
      this.tier = 'practice';
      this.resultIcon = 'fitness_center';
      this.resultTitle = 'Mashq yakunlandi!';
      this.resultMessage = "Bu qayta urinish ballga ta'sir qilmaydi, lekin har bir takrorlash bilimingizni mustahkamlaydi.";
    } else if (this.percentage >= 80) {
      this.tier = 'excellent';
      this.resultIcon = 'emoji_events';
      this.resultTitle = 'Qoyilmaqom!';
      this.resultMessage = pick([
        "Siz kitobni chuqur o'qibsiz. Shu ruhda davom eting!",
        "Haqiqiy kitobxon natijasi! Navbatdagi kitob sizni kutmoqda.",
        "Ajoyib! Bilimingiz bilan faxrlansangiz arziydi."
      ]);
    } else if (this.percentage >= 50) {
      this.tier = 'good';
      this.resultIcon = 'thumb_up';
      this.resultTitle = 'Yaxshi natija!';
      this.resultMessage = pick([
        "Asosiy g'oyalarni yaxshi tushunibsiz. Xatolarni ko'rib chiqsangiz, yanada kuchli bo'lasiz.",
        "Zo'r harakat! Bir oz takrorlash — va natija a'loga chiqadi."
      ]);
    } else {
      this.tier = 'low';
      this.resultIcon = 'auto_stories';
      this.resultTitle = 'Boshlanishi yaxshi!';
      this.resultMessage = pick([
        "Har bir buyuk kitobxon shu yerdan boshlagan. Xatolarni ko'rib chiqing — ular eng yaxshi ustoz.",
        "Kitobni yana bir bor varaqlab chiqing, keyingi safar natija albatta yaxshi bo'ladi."
      ]);
    }
  }

  private startCounters() {
    this.stopCounters.forEach(stop => stop());
    this.shown = { percent: 0, correct: 0, wrong: 0 };
    this.stopCounters = [
      animateNumber(0, this.percentage, 1000, v => this.shown.percent = v),
      animateNumber(0, this.correctAnswers, 1000, v => this.shown.correct = v),
      animateNumber(0, this.incorrectAnswers, 1000, v => this.shown.wrong = v)
    ];
  }

  get reviewItems(): QuizAttemptReviewItem[] {
    const items = this.result?.review ?? [];
    return this.reviewFilter === 'wrong' ? items.filter(item => !item.isCorrect) : items;
  }

  get wrongCount(): number {
    return (this.result?.review ?? []).filter(item => !item.isCorrect).length;
  }

  // Halqa diagrammasi uchun (r = 54)
  readonly ringCircumference = 2 * Math.PI * 54;
  get ringOffset(): number {
    return this.ringCircumference * (1 - this.ringPercentage / 100);
  }

  restartQuiz() {
    this.isQuizFinished = false;
    this.result = null;
    this.showReview = false;
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
    this.currentQuestionIndex = -1;
    this.questions = [];
    this.startAttempt();
  }

  confirmExit() {
    // Sanoq paytida urinish hali boshlanmagan
    if (!this.attempt) {
      this.closeQuiz();
      return;
    }
    if (!this.attempt.isScoreEligible) {
      this.exitQuiz();
      return;
    }
    if (this.exitConfirmOpen) return;

    this.exitConfirmOpen = true;
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '380px',
      data: {
        title: 'Testni yakunlaysizmi?',
        message: 'Siz bu testni birinchi marta ishlayapsiz. Hozir chiqsangiz, test shu yerda yakunlanadi va faqat javob bergan savollaringiz hisoblanadi.',
        confirmText: 'Ha, yakunlash',
        icon: 'logout'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      this.exitConfirmOpen = false;
      if (confirmed && !this.isQuizFinished) {
        this.exitQuiz();
      }
    });
  }

  // Test o'rtasida chiqish: urinish yakunlanadi, aks holda keyingi safar shu joydan davom etardi
  private exitQuiz() {
    this.clearTimers();
    if (!this.attempt || this.isQuizFinished) {
      this.closeQuiz();
      return;
    }
    this.quizAttemptService.finish(this.attempt.id).subscribe({
      next: () => this.closeQuiz(),
      error: () => this.closeQuiz()
    });
  }

  goToHome() {
    this.closeQuiz();
  }

  private closeQuiz() {
    this.clearTimers();
    this.dialogRef.close();
  }

  private clearTimers() {
    this.stopCounters.forEach(stop => stop());
    clearInterval(this.timer);
    clearInterval(this.countdownInterval);
    clearTimeout(this.letsGoTimeout);
    clearTimeout(this.advanceTimeout);
  }

  private notify(message: string) {
    this.snackBar.open(message, 'Yopish', { duration: 3500 });
  }
}
