import { FileData } from "src/app/content-category/models/book";

export interface User{
    // firstName: string;
    // lastName: string;
    // email: string;
    // phone: string;
    // password: string;
    // asset?: string;
    id: string
    FirstName: string;
    LastName: string;
    Email: string;
    Phone: string;
    Password: string;
    Image: string;
}

export interface USerr{
    id: number
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    // password: string;
    asset: FileData
}