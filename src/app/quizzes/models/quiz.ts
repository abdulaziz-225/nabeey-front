import { Category } from "src/app/content-category/models/category";
import { User } from "src/app/content-category/models/user";

export interface Quiz {
    id: number;
    name: string;
    description: string;
    questionCount: number;
    startTime: string;
    endTime: string;
    user: User | null;
    contentCategory: Category
    certificate: string | null;
  }