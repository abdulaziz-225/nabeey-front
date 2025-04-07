import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AboutModalComponent } from './aboutModal.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  scrollToKitobxon() {
    const element = document.getElementById('kitobxon');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  constructor(public dialog: MatDialog) {}

  openAboutModal(): void {
    this.dialog.open(AboutModalComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      panelClass: 'full-screen-modal',
      backdropClass: 'transparent-backdrop',
      disableClose: true // Chapga bosib yopib bo'lmasligi uchun
    });
  }
  
}
