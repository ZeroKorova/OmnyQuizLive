import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, QuizData } from '@/types/quiz';
import { saveGame, loadGame, SavedGame } from '@/lib/gameStorage';

interface QuizContextType {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  quizData: QuizData | null;
  setQuizData: (data: QuizData) => void;
  gameName: string;
  setGameName: (name: string) => void;
  updateTeamScore: (teamId: number, points: number) => void;
  markQuestionAnswered: (categoryIndex: number, questionIndex: number, teamId: number | null, isCorrect: boolean, customScore?: number) => void;
  resetGame: () => void;
  saveCurrentGame: () => void;
  loadSavedGame: (gameName: string) => boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = sessionStorage.getItem('omni-quiz-current-teams');
    return saved ? JSON.parse(saved) : [];
  });
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [gameName, setGameName] = useState<string>(() => {
    return sessionStorage.getItem('omni-quiz-current-game-name') || '';
  });

  useEffect(() => {
    sessionStorage.setItem('omni-quiz-current-teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    sessionStorage.setItem('omni-quiz-current-game-name', gameName);
  }, [gameName]);

  const updateTeamScore = (teamId: number, points: number) => {
    setTeams(prev =>
      prev.map(team =>
        team.id === teamId ? { ...team, score: team.score + points } : team
      )
    );
  };

  const markQuestionAnswered = (categoryIndex: number, questionIndex: number, teamId: number | null, isCorrect: boolean, customScore?: number) => {
    setQuizData(prev => {
      if (!prev) return null;
      const newQuestions = [...prev.questions];
      newQuestions[categoryIndex][questionIndex].answered = true;
      newQuestions[categoryIndex][questionIndex].answeredBy = teamId;
      newQuestions[categoryIndex][questionIndex].answeredCorrectly = isCorrect;
      if (customScore !== undefined) {
        newQuestions[categoryIndex][questionIndex].customScore = customScore;
      }
      return { ...prev, questions: newQuestions };
    });
  };

  const resetGame = () => {
    setTeams([]);
    setQuizData(null);
    setGameName('');
  };

  const saveCurrentGame = () => {
    if (quizData && teams.length > 0 && gameName) {
      saveGame(gameName, teams, quizData);
    }
  };

  const loadSavedGame = (name: string): boolean => {
    const savedGame = loadGame(name);
    if (savedGame) {
      setTeams(savedGame.teams);
      setQuizData(savedGame.quizData);
      setGameName(savedGame.gameName);
      return true;
    }
    return false;
  };

  return (
    <QuizContext.Provider value={{
      teams,
      setTeams,
      quizData,
      setQuizData,
      gameName,
      setGameName,
      updateTeamScore,
      markQuestionAnswered,
      resetGame,
      saveCurrentGame,
      loadSavedGame
    }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
};
