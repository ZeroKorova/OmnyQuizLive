export interface Team {
  id: number;
  name: string;
  color: string;
  score: number;
}

export interface Question {
  category: string;
  value: number;
  question: string;
  answer: string;
  answered: boolean;
  answeredBy: number | null;
}

export interface QuizData {
  categories: string[];
  questions: Question[][];
}
