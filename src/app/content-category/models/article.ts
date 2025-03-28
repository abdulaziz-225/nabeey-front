import { FileData } from "./book";
import { Category } from "./category";
import { User } from "./user";

export interface Article{
    id:string;
    text: string;
    categoryId: string;
    userId: string;
    image: string;
}


export interface DetailedArticle {
    id: number;
    text: string;
    category: Category;
    image: FileData
    user: User;
  }

  export interface ArticleApiResponse {
    data: DetailedArticle[];
  }