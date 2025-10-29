import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuiz } from '@/contexts/QuizContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Home, X, Check } from 'lucide-react';

const Game = () => {
  const navigate = useNavigate();
  const { teams, quizData, updateTeamScore, markQuestionAnswered } = useQuiz();
  const [selectedQuestion, setSelectedQuestion] = useState<{
    categoryIndex: number;
    questionIndex: number;
  } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!quizData) {
    navigate('/upload');
    return null;
  }

  const currentQuestion = selectedQuestion
    ? quizData.questions[selectedQuestion.categoryIndex][selectedQuestion.questionIndex]
    : null;

  const handleQuestionClick = (categoryIndex: number, questionIndex: number) => {
    const question = quizData.questions[categoryIndex][questionIndex];
    if (!question.answered) {
      setSelectedQuestion({ categoryIndex, questionIndex });
      setShowAnswer(false);
    }
  };

  const handleCorrectAnswer = (teamId: number) => {
    if (selectedQuestion && currentQuestion) {
      updateTeamScore(teamId, currentQuestion.value);
      markQuestionAnswered(selectedQuestion.categoryIndex, selectedQuestion.questionIndex);
      setSelectedQuestion(null);
      setShowAnswer(false);
    }
  };

  const handleWrongAnswer = () => {
    setSelectedQuestion(null);
    setShowAnswer(false);
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Quiz Game
        </h1>
        <Button variant="game" onClick={() => navigate('/leaderboard')}>
          <Trophy className="mr-2 h-4 w-4" />
          Classifica
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {teams.map((team) => (
          <Card
            key={team.id}
            className="px-6 py-4 flex items-center gap-4 min-w-[200px]"
            style={{ borderColor: `hsl(var(--${team.color}))`, borderWidth: '2px' }}
          >
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: `hsl(var(--${team.color}))` }}
            />
            <div className="flex-1">
              <p className="font-semibold">{team.name}</p>
              <p className="text-2xl font-bold" style={{ color: `hsl(var(--${team.color}))` }}>
                {team.score}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${quizData.categories.length}, 1fr)` }}>
        {quizData.categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-3">
            <Card className="p-4 bg-primary text-primary-foreground text-center font-bold">
              <h3 className="text-lg uppercase">{category}</h3>
            </Card>
            {quizData.questions[categoryIndex].map((question, questionIndex) => (
              <Card
                key={questionIndex}
                className={`p-6 text-center cursor-pointer transition-all ${
                  question.answered
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:scale-105 hover:shadow-lg animate-glow'
                }`}
                onClick={() => handleQuestionClick(categoryIndex, questionIndex)}
                style={{
                  backgroundColor: question.answered ? 'hsl(var(--muted))' : 'hsl(var(--card))',
                }}
              >
                <p className="text-3xl font-bold">{question.value}</p>
              </Card>
            ))}
          </div>
        ))}
      </div>

      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {currentQuestion?.category} - {currentQuestion?.value} punti
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card className="p-8 bg-primary/10">
              <p className="text-2xl text-center font-semibold">
                {currentQuestion?.question}
              </p>
            </Card>

            {!showAnswer ? (
              <Button
                variant="game"
                size="lg"
                onClick={() => setShowAnswer(true)}
                className="w-full"
              >
                Mostra Risposta
              </Button>
            ) : (
              <div className="space-y-4">
                <Card className="p-8 bg-secondary/10">
                  <p className="text-xl text-center font-semibold">
                    {currentQuestion?.answer}
                  </p>
                </Card>

                <div className="space-y-3">
                  <p className="text-center font-semibold">Chi ha risposto correttamente?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {teams.map((team) => (
                      <Button
                        key={team.id}
                        variant="game"
                        onClick={() => handleCorrectAnswer(team.id)}
                        className="h-auto py-4"
                        style={{ backgroundColor: `hsl(var(--${team.color}))` }}
                      >
                        <Check className="mr-2 h-5 w-5" />
                        {team.name}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleWrongAnswer}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Nessuno
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
