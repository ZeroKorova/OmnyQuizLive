import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuiz } from '@/contexts/QuizContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trophy, Home, X, Check } from 'lucide-react';

const Game = () => {
  const navigate = useNavigate();
  const { teams, quizData, updateTeamScore, markQuestionAnswered } = useQuiz();
  const [selectedQuestion, setSelectedQuestion] = useState<{
    categoryIndex: number;
    questionIndex: number;
  } | null>(null);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);

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
    }
  };

  const handleCorrectAnswer = (teamId: number) => {
    if (selectedQuestion && currentQuestion) {
      updateTeamScore(teamId, currentQuestion.value);
      markQuestionAnswered(selectedQuestion.categoryIndex, selectedQuestion.questionIndex, teamId, true);
      setSelectedQuestion(null);
    }
  };

  const handleMalusAnswer = (teamId: number, customScore: number) => {
    if (selectedQuestion && currentQuestion) {
      updateTeamScore(teamId, customScore);
      markQuestionAnswered(selectedQuestion.categoryIndex, selectedQuestion.questionIndex, teamId, true, customScore);
      setSelectedQuestion(null);
    }
  };

  const handleWrongAnswer = (teamId: number) => {
    if (selectedQuestion && currentQuestion) {
      updateTeamScore(teamId, -currentQuestion.value);
      markQuestionAnswered(selectedQuestion.categoryIndex, selectedQuestion.questionIndex, teamId, false);
      setSelectedQuestion(null);
    }
  };

  const TeamScoreCard = ({ team }: { team: typeof teams[0] }) => (
    <Card
      className="px-4 py-3 flex items-center gap-3 min-w-[180px]"
      style={{ borderColor: `hsl(var(--${team.color}))`, borderWidth: '2px' }}
    >
      <div
        className="w-5 h-5 rounded-full"
        style={{ backgroundColor: `hsl(var(--${team.color}))` }}
      />
      <div className="flex-1">
        <p className="font-semibold text-sm">{team.name}</p>
        <p className="text-xl font-bold" style={{ color: `hsl(var(--${team.color}))` }}>
          {team.score}
        </p>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setShowHomeConfirm(true)}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          OMNI QUIZ
        </h1>
        <Button variant="game" onClick={() => navigate('/leaderboard')}>
          <Trophy className="mr-2 h-4 w-4" />
          Classifica
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {teams.map((team) => (
          <TeamScoreCard key={team.id} team={team} />
        ))}
      </div>

      <div className="space-y-4">
        {/* Categories Header - Scrollable */}
        <div className="overflow-x-auto">
          <div className="grid gap-3 md:gap-4 min-w-max" style={{ gridTemplateColumns: `repeat(${quizData.categories.length}, minmax(100px, 150px))` }}>
            {quizData.categories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="p-2 md:p-3 bg-primary text-primary-foreground text-center font-bold">
                <h3 className="text-[10px] md:text-xs lg:text-sm uppercase break-words hyphens-auto leading-tight" style={{ wordBreak: 'break-word' }}>{category}</h3>
              </Card>
            ))}
          </div>
        </div>

        {/* Questions Grid - Scrollable */}
        <div className="overflow-x-auto">
          <div className="grid gap-3 md:gap-4 min-w-max" style={{ gridTemplateColumns: `repeat(${quizData.categories.length}, minmax(100px, 150px))` }}>
            {quizData.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-2 md:space-y-3">
                {[...quizData.questions[categoryIndex]].reverse().map((question, reversedIndex) => {
                  const questionIndex = quizData.questions[categoryIndex].length - 1 - reversedIndex;
                  const answeredTeam = question.answeredBy ? teams.find(t => t.id === question.answeredBy) : null;
                  return (
                    <Card
                      key={questionIndex}
                      className={`p-3 md:p-4 lg:p-6 text-center cursor-pointer transition-all relative ${
                        question.answered
                          ? 'opacity-70 cursor-not-allowed'
                          : 'hover:scale-105 hover:shadow-lg'
                      }`}
                      onClick={() => handleQuestionClick(categoryIndex, questionIndex)}
                      style={{
                        backgroundColor: answeredTeam 
                          ? `hsl(var(--${answeredTeam.color}))` 
                          : question.answered 
                            ? 'hsl(var(--muted))' 
                            : 'hsl(var(--card))',
                      }}
                    >
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold">
                        {question.customScore !== undefined ? (
                          <span className="text-yellow-500">
                            {question.customScore > 0 ? '+' : ''}{question.customScore}
                          </span>
                        ) : (
                          question.value
                        )}
                      </p>
                      {question.answered && question.answeredCorrectly === false && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-black opacity-80" strokeWidth={4} />
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center pt-4">
        {teams.map((team) => (
          <TeamScoreCard key={`bottom-${team.id}`} team={team} />
        ))}
      </div>

      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">
              {currentQuestion?.category} - {currentQuestion?.value} punti
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 md:space-y-6">
            <Card className="p-6 md:p-8 bg-primary/10">
              <p className="text-lg md:text-2xl text-center font-semibold">
                {currentQuestion?.question}
              </p>
            </Card>

            <Card className="p-6 md:p-8 bg-secondary/10">
              <p className="text-base md:text-xl text-center font-semibold">
                {currentQuestion?.answer}
              </p>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Risposta Corretta */}
              <div className="space-y-3">
                <h3 className="text-center font-bold text-base md:text-lg uppercase text-green-700">
                  Risposta Corretta:
                </h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {teams.map((team) => (
                    <div key={team.id} className="space-y-2">
                      <Button
                        onClick={() => handleCorrectAnswer(team.id)}
                        className="w-full h-auto py-3 md:py-4 text-white font-semibold"
                        style={{ backgroundColor: `hsl(var(--${team.color}))` }}
                      >
                        <span className="text-xs md:text-sm">{team.name}</span>
                      </Button>
                      <Button
                        onClick={() => {
                          const customScore = prompt(`Inserisci il punteggio per ${team.name} (può essere negativo):`, '0');
                          if (customScore !== null) {
                            handleMalusAnswer(team.id, parseInt(customScore) || 0);
                          }
                        }}
                        variant="outline"
                        className="w-full h-auto py-2 md:py-3 text-xs md:text-sm font-semibold border-2"
                        style={{ 
                          borderColor: `hsl(var(--${team.color}))`,
                          color: `hsl(var(--${team.color}))`
                        }}
                      >
                        Malus
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risposta Sbagliata */}
              <div className="space-y-3">
                <h3 className="text-center font-bold text-base md:text-lg uppercase text-red-700">
                  Risposta Sbagliata:
                </h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {teams.map((team) => (
                    <Button
                      key={team.id}
                      onClick={() => handleWrongAnswer(team.id)}
                      className="w-full h-auto py-3 md:py-4 border-2 font-semibold relative text-white"
                      style={{ 
                        backgroundColor: `hsl(var(--${team.color}))`,
                        borderColor: `hsl(var(--${team.color}))`
                      }}
                    >
                      <X className="absolute left-2 h-4 w-4" />
                      <span className="text-xs md:text-sm">{team.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showHomeConfirm} onOpenChange={setShowHomeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tornare alla Home?</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi davvero tornare alla home? Il gioco in corso non sarà salvato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowHomeConfirm(false);
              setShowSecondConfirm(true);
            }}>
              Continua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSecondConfirm} onOpenChange={setShowSecondConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa è l'ultima conferma. Tutti i dati del gioco corrente andranno persi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowHomeConfirm(false)}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/')} className="bg-destructive text-destructive-foreground">
              Confermo, torna alla Home
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Game;
