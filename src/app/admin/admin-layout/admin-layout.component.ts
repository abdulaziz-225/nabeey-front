import { Component } from '@angular/core';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  exact?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  menuOpen = false;

  analytics: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', link: '/admin', exact: true },
    { label: 'Foydalanuvchilar', icon: 'group', link: '/admin/users' },
    { label: 'Kitoblar tahlili', icon: 'insights', link: '/admin/books' },
    { label: 'Faoliyat lentasi', icon: 'history', link: '/admin/activity' },
    { label: 'Sertifikat shablonlari', icon: 'workspace_premium', link: '/admin/certificate-templates' },
  ];

  management: NavItem[] = [
    { label: 'Kitoblar', icon: 'menu_book', link: '/books' },
    { label: "Bo'limlar", icon: 'category', link: '/categories' },
    { label: 'Savollar', icon: 'quiz', link: '/questions' },
    { label: 'Viktorina', icon: 'emoji_events', link: '/quiz' },
    { label: 'Xabarlar', icon: 'article', link: '/article' },
    { label: 'Suhbatlar', icon: 'forum', link: '/support' },
  ];
}
