export enum UserRole {
  User = 0,
  Writer = 1,
  Admin = 2,
  SuperAdmin = 3,
}

export const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: UserRole.User, label: 'Foydalanuvchi', description: "Kitob o'qiydi, test ishlaydi" },
  { value: UserRole.Writer, label: 'Yozuvchi', description: 'Kontent yozish huquqi' },
  { value: UserRole.Admin, label: 'Admin', description: "Kitob, test, bo'lim va suhbatlarni boshqaradi" },
  { value: UserRole.SuperAdmin, label: 'Super Admin', description: "Admin panel, rollar va parollarni boshqaradi" },
];

export function roleLabel(role: UserRole | string): string {
  const value = typeof role === 'string' ? UserRole[role as keyof typeof UserRole] : role;
  return ROLE_OPTIONS.find(r => r.value === value)?.label ?? String(role);
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface DailyActivity {
  date: string;
  quizAttempts: number;
  bookViews: number;
  aiQuestions: number;
}

export interface CategoryStat {
  id: number;
  name: string;
  bookCount: number;
  quizCount: number;
  quizAttempts: number;
  bookViews: number;
}

export interface BookDemand {
  id: number;
  title: string;
  author: string;
  genre: string;
  categoryName: string;
  imagePath: string | null;
  views: number;
  uniqueReaders: number;
  quizAttempts: number;
  averageScorePercent: number;
  lastViewedAt: string | null;
  demandScore: number;
}

export interface BookReader {
  userId: number;
  fullName: string;
  phone: string;
  views: number;
  lastViewedAt: string | null;
  tookQuiz: boolean;
  ball: number | null;
  scorePercent: number | null;
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userRole: UserRole;
  imagePath: string | null;
  createdAt: string;
  totalBall: number;
  rating: number;
  quizCount: number;
  certificateCount: number;
  bookViewCount: number;
  aiQuestionCount: number;
  lastActivityAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface AdminUserPage {
  items: AdminUser[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface UserQuizResult {
  quizId: number;
  quizName: string;
  ball: number;
  correctAnswers: number;
  incorrectAnswers: number;
  scorePercent: number;
  createdAt: string;
}

export interface UserBookView {
  bookId: number;
  title: string;
  author: string;
  views: number;
  lastViewedAt: string;
}

export interface UserActivity {
  user: AdminUser;
  quizResults: UserQuizResult[];
  viewedBooks: UserBookView[];
}

export type ActivityType = 'registration' | 'book-view' | 'quiz' | 'certificate';

export interface ActivityEvent {
  type: ActivityType;
  userId: number;
  userFullName: string;
  subject: string | null;
  detail: string | null;
  ball: number | null;
  scorePercent: number | null;
  certificateId: number | null;
  filePath: string | null;
  createdAt: string;
}

export type OwnedCertificateKind = 'ball100' | 'top-reader' | 'quiz';

export interface OwnedCertificate {
  kind: OwnedCertificateKind;
  title: string;
  code: string | null;
  filePath: string | null;
  issuedAt: string;
}

export interface CertificateOwner {
  userId: number;
  fullName: string;
  phone: string;
  totalBall: number;
  certificates: OwnedCertificate[];
}

export interface DashboardStats {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  activeUsersLast7Days: number;
  usersByRole: Record<string, number>;

  totalBooks: number;
  totalCategories: number;
  totalArticles: number;
  totalVideos: number;
  totalAudios: number;
  totalQuizzes: number;
  totalQuestions: number;

  totalQuizAttempts: number;
  averageScorePercent: number;
  totalBall: number;
  totalCertificates: number;
  totalBookViews: number;

  aiQuestionsToday: number;
  aiQuestionsTotal: number;
  openConversations: number;
  unreadMessages: number;

  registrations: DailyCount[];
  activity: DailyActivity[];
  categories: CategoryStat[];
  topBooks: BookDemand[];
  topUsers: AdminUser[];
}
