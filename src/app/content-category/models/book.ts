export interface Book{
    id: number;
    title: string;
    author: string;
    description: string;
    file: FileData;
    image: FileData;
    categoryId: string
}

export interface FileData {
    fileName?: string;
    filePath: string;
  }