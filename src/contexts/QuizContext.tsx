import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Team, QuizData } from '@/types/quiz';

interface QuizContextType {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  quizData: QuizData | null;
  setQuizData: (data: QuizData) => void;
  updateTeamScore: (teamId: number, points: number) => void;
  markQuestionAnswered: (categoryIndex: number, questionIndex: number) => void;
  resetGame: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  const updateTeamScore = (teamId: number, points: number) => {
    setTeams(prev => 
      prev.map(team => 
        team.id === teamId ? { ...team, score: team.score + points } : team
      )
    );
  };

  const markQuestionAnswered = (categoryIndex: number, questionIndex: number) => {
    setQuizData(prev => {
      if (!prev) return null;
      const newQuestions = [...prev.questions];
      newQuestions[categoryIndex][questionIndex].answered = true;
      return { ...prev, questions: newQuestions };
    });
  };

  const resetGame = () => {
    setTeams([]);
    setQuizData(null);
  };

  return (
    <QuizContext.Provider value={{ 
      teams, 
      setTeams, 
      quizData, 
      setQuizData,
      updateTeamScore,
      markQuestionAnswered,
      resetGame
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
