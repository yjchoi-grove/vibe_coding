export interface Attachment {
  id: number;
  filename: string;
  file_size: number;
  file_path: string;
  mime_type: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  videoUrl?: string;
  imgUrl?: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  views: number;
  attachments: Attachment[];
} 