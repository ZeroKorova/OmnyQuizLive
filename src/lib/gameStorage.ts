import { QuizData, Team } from '@/types/quiz';

const STORAGE_KEY = 'omni-quiz-saved-games';

export interface SavedGame {
  id: string;
  gameName: string;
  teams: Team[];
  quizData: QuizData;
  savedAt: string;
}

export const saveGame = (gameName: string, teams: Team[], quizData: QuizData): void => {
  const savedGames = getSavedGames();
  const existingGameIndex = savedGames.findIndex(game => game.gameName === gameName);
  
  const gameData: SavedGame = {
    id: Date.now().toString(),
    gameName,
    teams,
    quizData,
    savedAt: new Date().toISOString(),
  };

  if (existingGameIndex !== -1) {
    // Update existing game
    savedGames[existingGameIndex] = gameData;
  } else {
    // Add new game
    savedGames.push(gameData);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGames));
};

export const getSavedGames = (): SavedGame[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const loadGame = (gameName: string): SavedGame | null => {
  const savedGames = getSavedGames();
  return savedGames.find(game => game.gameName === gameName) || null;
};

export const deleteGame = (gameName: string): void => {
  const savedGames = getSavedGames();
  const filtered = savedGames.filter(game => game.gameName !== gameName);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
