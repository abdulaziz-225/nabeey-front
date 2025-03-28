export interface Answer {
    id: number;
    text: string;
    isTrue: boolean;
    asset: string | null;
  }

  export interface AnswerData{
    answerId: number,
    questionId: number,
    userId: string | undefined,
    quizId: number | null
  }