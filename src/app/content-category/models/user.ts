import { FileData } from "./book";

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userRole: number;
    asset: FileData; 
  }

  export interface Asset {
    fileName: string;
    filePath: string;
  }
  
  