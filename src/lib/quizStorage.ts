import { QuizData } from '@/types/quiz';

const STORAGE_KEY = 'omni-quiz-saved-files';

export interface SavedQuiz {
  id: string;
  title: string;
  data: QuizData;
  savedAt: string;
}

export const saveQuizFile = (title: string, data: QuizData): void => {
  const savedQuizzes = getSavedQuizzes();
  const newQuiz: SavedQuiz = {
    id: Date.now().toString(),
    title,
    data,
    savedAt: new Date().toISOString(),
  };
  savedQuizzes.push(newQuiz);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedQuizzes));
};

export const getSavedQuizzes = (): SavedQuiz[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const deleteQuizFile = (id: string): void => {
  const savedQuizzes = getSavedQuizzes();
  const filtered = savedQuizzes.filter(quiz => quiz.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
