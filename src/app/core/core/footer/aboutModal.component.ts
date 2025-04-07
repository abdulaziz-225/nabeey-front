// about-modal.component.ts
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-about-modal',
  template: `
  <mat-dialog-content class="text-gray-700 leading-relaxed">
  <h2 mat-dialog-title class="text-2xl font-bold text-blue-600">
    <i class="fas fa-book-open mr-2"></i>Kitoblar Dunyosiga Sayohat
  </h2>
  <div class="space-y-4">
    <p>
      <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
      <strong>kitobsevar.olami.uz</strong> - bu kitobxonlar uchun maxsus yaratilgan interaktiv platforma 
      bo'lib, sizga o'qigan kitoblaringiz haqida testlar orqali yangicha tajriba taklif etadi.
    </p>
    
    <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
      <i class="fas fa-quote-left text-blue-300 float-left mr-2"></i>
      <p class="font-medium">Har bir kitob - bu yangi dunyo. Biz esa sizga bu dunyolarga qaytish imkoniyatini beramiz!</p>
    </div>
    
    <ul class="list-disc pl-5 space-y-2">
      <li><i class="fas fa-check-circle text-green-500 mr-2"></i> Sevimli kitoblaringiz haqidagi bilimingizni sinang</li>
      <li><i class="fas fa-check-circle text-green-500 mr-2"></i> Do'stlaringiz bilan raqobatlashing</li>
      <li><i class="fas fa-check-circle text-green-500 mr-2"></i> Kitobga bo'lgan muhabbatingizni yangilang</li>
    </ul>
  </div>
</mat-dialog-content>
<mat-dialog-actions class="justify-end">
  <button mat-raised-button color="primary" (click)="close()">
    <i class="fas fa-times mr-2"></i>Yopish
  </button>
</mat-dialog-actions>

  `,
  styleUrls: ['./about-modal.component.scss'] 
})
export class AboutModalComponent {
  constructor(public dialogRef: MatDialogRef<AboutModalComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}