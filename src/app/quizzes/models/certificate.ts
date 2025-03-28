export interface Certificate{
    score: number;
    quizId: number;
    userId: number
}

export interface ApiResponseCertificate{
    data: Certificate
}