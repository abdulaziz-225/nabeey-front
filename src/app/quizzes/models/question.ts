import { Answer } from "./answer";

export interface Question{
    id: string;
    text: string;
    image: string;
    answers: Answer[]
}

// export interface Answer{
//     text: string;
//     questionId: string;
//     isTrue: boolean
// }