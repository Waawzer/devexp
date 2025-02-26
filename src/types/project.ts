export interface Project {
  _id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: Date;
}

export interface ProjectInput {
  title: string;
  description: string;
} 