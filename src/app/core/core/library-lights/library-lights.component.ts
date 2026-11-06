import { Component } from '@angular/core';

// Kutubxona fonidagi chiroqlar: 3 soniya yonadi, o'chganda fon yarim xiralashadi (0.5),
// 1.7 soniyadan keyin qayta yonadi (1). Animatsiya to'liq CSS'da.
@Component({
  selector: 'app-library-lights',
  template: '<div class="lights-out"></div>',
  styleUrls: ['./library-lights.component.scss']
})
export class LibraryLightsComponent { }
