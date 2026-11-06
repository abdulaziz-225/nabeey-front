export interface BookCommentAuthor {
  id: number;
  firstName: string;
  lastName: string;
  imagePath: string | null;
}

export interface BookComment {
  id: number;
  bookId: number;
  quizId: number | null;
  // Javob bo'lsa — asosiy izoh Id'si
  parentId: number | null;
  text: string;
  createdAt: string;
  // Muallifning shu kitobga qo'ygan bahosi
  userStars: number | null;
  likeCount: number;
  likedByMe: boolean;
  user: BookCommentAuthor;
  // Javobga javob yozilganda kimga javob berilgani
  replyTo: BookCommentAuthor | null;
  // Faqat asosiy izohlarda (eskisidan yangisiga)
  replies: BookComment[];
}

export interface BookCommentLikeResult {
  commentId: number;
  liked: boolean;
  likeCount: number;
}

export interface BookRatingSummary {
  bookId: number;
  average: number;
  count: number;
  myStars: number | null;
  // [1 yulduz, ..., 5 yulduz]
  distribution: number[];
}

export type StatPeriod = 'day' | 'week' | 'month' | 'all';

export interface BookStat {
  bookId: number;
  // Tanlangan davrdagi ko'rishlar
  views: number;
  totalViews: number;
  comments: number;
  ratingAverage: number;
  ratingCount: number;
  // Kitob nomiga mos, savollari bor test
  quizId: number | null;
  questionCount: number;
}
