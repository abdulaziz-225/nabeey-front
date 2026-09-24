import { DetailedArticle } from "./article";
import { FileData } from "./book";

export interface Category{
    id: number;
    name: string;
    description: string;
    image: FileData | null;
    books: any[]; 
    audios: any[]; 
    videos: any[]; 
    articles: DetailedArticle[];
}