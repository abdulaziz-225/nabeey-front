export interface Book{
    id: number;
    title: string;
    author: string;
    description: string;
    file: FileData | null;
    image: FileData | null;
    categoryId: string;
    year: string;
    genre: string
}

export interface FileData {
    fileName?: string;
    filePath: string;
  }