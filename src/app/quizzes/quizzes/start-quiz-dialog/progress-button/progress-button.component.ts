import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-button',
  templateUrl: './progress-button.component.html',
  styleUrls: ['./progress-button.component.scss']
})
export class ProgressButtonComponent implements OnInit {
  @Input() currentScore: number = 6; // Default value changed to match your image
  @Input() maxScore: number = 1000;
  @Input() label: string = 'Ballar';

  progress: number = 0;

  ngOnInit() {
    // Retrieve data from localStorage if available
    const userProgress = localStorage.getItem('userProgress');
    
    if (userProgress) {
      try {
        const parsedProgress = JSON.parse(userProgress);
        this.currentScore = parsedProgress.totalScore || this.currentScore;
      } catch (e) {
        console.error('Error parsing user progress', e);
      }
    }

    // Calculate the percentage of progress with better handling
    this.calculateProgress();
  }

  private calculateProgress(): void {
    // Ensure we don't divide by zero
    if (this.maxScore <= 0) {
      this.progress = 0;
      return;
    }

    // Calculate percentage with at least 2 decimal places
    const rawPercentage = (this.currentScore / this.maxScore) * 100;
    
    // Show at least 1% if there's any progress (for visibility)
    if (rawPercentage > 0 && rawPercentage < 1) {
      this.progress = 1;
    } else {
      // Round to nearest integer
      this.progress = Math.round(rawPercentage);
    }

    // Ensure we don't exceed 100%
    this.progress = Math.min(this.progress, 100);
  }
}