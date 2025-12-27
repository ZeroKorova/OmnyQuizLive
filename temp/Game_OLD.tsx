import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useQuiz } from '@/contexts/QuizContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trophy, Home, X, Check, Palette, Clock, Plus, Minus, Dices } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useWakeLock } from '@/hooks/useWakeLock';


const Game = () => {
  useWakeLock();
  const navigate = useNavigate();
  const { teams, quizData, updateTeamScore, markQuestionAnswered, saveCurrentGame } = useQuiz();
  const { theme, toggleTheme } = useTheme();
  const [selectedQuestion, setSelectedQuestion] = useState<{
    categoryIndex: number;
    questionIndex: number;
  } | null>(null);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [malusDialog, setMalusDialog] = useState<{ isOpen: boolean; teamId: number | null; teamName: string }>({
    isOpen: false,
    teamId: null,
    teamName: '',
  });
  const [malusScore, setMalusScore] = useState<string>('');
  const [timer, setTimer] = useState(100);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasPlayedBeepRef = useRef(false);

  // Auto-save every 40 seconds
  // Auto-save logic is now handled in QuizContext (event-driven)

  useEffect(() => {
    if (selectedQuestion) {
      setTimer(100);
      hasPlayedBeepRef.current = false;

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [selectedQuestion]);

  useEffect(() => {
    if (timer <= 10 && timer > 0 && selectedQuestion) {
      playBeep();
    }
  }, [timer, selectedQuestion]);

  const playBeep = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  if (!quizData) {
    navigate('/upload');
    return null;
  }

  const currentQuestion = selectedQuestion
    ? quizData.questions[selectedQuestion.categoryIndex][selectedQuestion.questionIndex]
    : null;

  const shuffledOptions = useMemo(() => {
    if (!currentQuestion?.options) return [];
    return [...currentQuestion.options].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  const handleQuestionClick = (categoryIndex: number, questionIndex: number) => {
    setSelectedQuestion({ categoryIndex, questionIndex });
  };

  const handleCorrectAnswer = (teamId: number) => {
    if (selectedQuestion && currentQuestion) {
      updateTeamScore(teamId, currentQuestion.value);
      markQuestionAnswered(selectedQuestion.categoryIndex, selectedQuestion.questionIndex, teamId, true);
      setSelectedQuestion(null);
    }
  };

  const adjustMalus = (amount: number) => {
    const current = parseInt(malusScore) || 0;
    setMalusScore((current + amount).toString());
  };

  const handleMalusClick = (teamId: number, teamName: string) => {
    setMalusDialog({ isOpen: true, teamId, teamName });
    setMalusScore('');
  };

  const confirmMalus = () => {
    if (malusDialog.teamId && selectedQuestion && currentQuestion) {
      const score = parseInt(malusScore) || 0;
      updateTeamScore(malusDialog.teamId, score);
      markQuestionAnswered(selectedQuestion.categoryIndex, selectedQuestion.questionIndex, malusDialog.teamId, true, score);
      setMalusDialog({ isOpen: false, teamId: null, teamName: '' });
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
      className="px-1 py-1 md:px-4 md:py-3 flex items-center gap-1 md:gap-3 min-w-[100px] md:min-w-[180px]"
      style={{ borderColor: `hsl(var(--${team.color}))`, borderWidth: '2px' }}
    >
      <div
        className="w-5 h-5 rounded-full"
        style={{ backgroundColor: `hsl(var(--${team.color}))` }}
      />
      <div className="flex-1">
        <p className="font-semibold text-[0.65rem] md:text-sm truncate">{team.name}</p>
        <p className="text-base md:text-xl font-bold leading-tight" style={{ color: `hsl(var(--${team.color}))` }}>
          {team.score}
        </p>
      </div>
    </Card>
  );

  return (
    <div className={`min-h-screen flex flex-col p-4 space-y-6 ${theme === 'lcars' ? 'bg-black' : ''}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowHomeConfirm(true)}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            variant={theme === 'lcars' ? 'default' : 'outline'}
            size="sm"
            onClick={toggleTheme}
          >
            <Palette className="h-4 w-4 mr-2" />
            {theme === 'white' ? 'LCARS' : 'Bianco'}
          </Button>
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold ${theme === 'lcars' ? 'text-[hsl(var(--lcars-orange))] uppercase tracking-wider' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}`}>
          OMNI QUIZ
        </h1>
        <Button variant="game" onClick={() => navigate('/leaderboard')}>
          <Trophy className="mr-2 h-4 w-4" />
          Classifica
        </Button>
        <Button variant="outline" onClick={() => navigate('/roulette')} className="ml-2 font-bold" title="Sorteggio">
          DADI?
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {teams.map((team) => (
          <TeamScoreCard key={team.id} team={team} />
        ))}
      </div>

      <div className="flex w-full pb-4">
        <div className="flex gap-2 md:gap-4 px-2 md:px-4 m-auto">
          {quizData.categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="flex flex-col gap-2 md:gap-4 w-[75px] md:w-[150px]">
              {/* Category Header */}
              <Card className="p-1 md:p-3 bg-primary text-primary-foreground text-center font-bold h-[50px] md:h-[60px] flex items-center justify-center">
                <h3 className="text-[9px] md:text-xs lg:text-sm uppercase break-words hyphens-auto leading-tight line-clamp-2" style={{ wordBreak: 'break-word' }}>
                  {category}
                </h3>
              </Card>

              {/* Questions */}
              {[...quizData.questions[categoryIndex]].reverse().map((question, reversedIndex) => {
                const questionIndex = quizData.questions[categoryIndex].length - 1 - reversedIndex;
                const answeredTeam = question.answeredBy ? teams.find(t => t.id === question.answeredBy) : null;
                return (
                  <Card
                    key={questionIndex}
                    className={`p-3 md:p-4 lg:p-6 flex items-center justify-center text-center cursor-pointer transition-all relative hover:scale-105 hover:shadow-lg ${question.answered ? 'opacity-70' : ''
                      } ${theme === 'lcars' ? 'rounded-full' : ''}`}
                    onClick={() => handleQuestionClick(categoryIndex, questionIndex)}
                    style={{
                      backgroundColor: answeredTeam
                        ? `hsl(var(--${answeredTeam.color}))`
                        : question.answered
                          ? 'hsl(var(--muted))'
                          : theme === 'lcars'
                            ? 'black'
                            : 'hsl(var(--card))',
                    }}
                  >
                    <p className={`text-[0.6rem] md:text-xs uppercase mb-1 opacity-80 font-semibold truncate w-full px-1 ${theme === 'lcars' ? 'text-[hsl(var(--lcars-orange))]' : 'text-muted-foreground'}`}>
                      {category}
                    </p>
                    <p className={`text-xl md:text-2xl lg:text-3xl font-bold ${theme === 'lcars' ? 'text-white' : ''}`}>
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

      <div className="flex flex-wrap gap-3 justify-center pt-4">
        {teams.map((team) => (
          <TeamScoreCard key={`bottom-${team.id}`} team={team} />
        ))}
      </div>

      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent
          className={`max-w-[95vw] md:max-w-4xl w-full max-h-[90vh] overflow-y-auto ${theme === 'lcars' ? 'bg-black border-[hsl(var(--lcars-orange))]' : ''}`}
        >
          <DialogHeader>
            <DialogTitle className={`text-2xl md:text-3xl ${theme === 'lcars' ? 'text-[hsl(var(--lcars-orange))]' : ''}`}>
              {currentQuestion?.category} - {currentQuestion?.value} punti
            </DialogTitle>
          </DialogHeader>

          {/* Timer */}
          <div className={`flex items-center justify-center gap-3 p-4 rounded-lg ${theme === 'lcars'
            ? 'bg-[hsl(var(--lcars-orange))]'
            : 'bg-primary/10'
            }`}>
            <Clock className={`h-6 w-6 ${theme === 'lcars' ? 'text-black' : 'text-primary'
              } ${timer <= 10 ? 'animate-pulse' : ''}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg font-bold ${theme === 'lcars' ? 'text-black' : 'text-primary'
                  } ${timer <= 10 ? 'animate-pulse' : ''}`}>
                  {timer}s
                </span>
                <span className={`text-sm ${theme === 'lcars' ? 'text-black/70' : 'text-muted-foreground'
                  }`}>
                  {Math.round((timer / 100) * 100)}%
                </span>
              </div>
              {theme === 'lcars' ? (
                <div className="w-full h-3 bg-black rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${timer <= 10 ? 'bg-[hsl(var(--lcars-red))]' : 'bg-[hsl(var(--lcars-blue))]'
                      }`}
                    style={{ width: `${(timer / 100) * 100}%` }}
                  />
                </div>
              ) : (
                <Progress
                  value={(timer / 100) * 100}
                  className={`h-3 ${timer <= 10 ? '[&>div]:bg-destructive' : ''}`}
                />
              )}
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <Card className={`p-6 md:p-8 ${theme === 'lcars' ? 'bg-[hsl(var(--lcars-blue))]' : 'bg-primary/10'}`}>
              <p className={`text-xl md:text-3xl text-center font-semibold ${theme === 'lcars' ? 'text-white' : ''}`}>
                {currentQuestion?.question}
              </p>
            </Card>

            {/* Options Display */}
            {currentQuestion?.options && currentQuestion.options.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shuffledOptions.map((option, index) => (
                  <Card
                    key={index}
                    className={`p-4 text-center flex items-center justify-center min-h-[80px] ${theme === 'lcars'
                      ? 'bg-black border-[hsl(var(--lcars-blue))] text-[hsl(var(--lcars-blue))]'
                      : 'bg-muted/50'
                      }`}
                  >
                    <p className="text-lg font-medium">{option}</p>
                  </Card>
                ))}
              </div>
            )}

            <Card className={`p-6 md:p-8 ${theme === 'lcars' ? 'bg-[hsl(var(--lcars-pink))]' : 'bg-secondary/10'}`}>
              <p className={`text-xl md:text-3xl text-center font-semibold ${theme === 'lcars' ? 'text-white' : ''}`}>
                {currentQuestion?.answer}
              </p>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Risposta Corretta */}
              <div className="space-y-3">
                <h3 className={`text-center font-bold text-base md:text-lg uppercase ${theme === 'lcars' ? 'text-[hsl(var(--lcars-blue))]' : 'text-green-700'}`}>
                  Risposta Corretta:
                </h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {teams.map((team) => (
                    <div key={team.id} className="space-y-2">
                      <Button
                        onClick={() => handleCorrectAnswer(team.id)}
                        className={`w-full h-auto py-3 md:py-4 text-white font-semibold ${theme === 'lcars' ? 'rounded-full' : ''}`}
                        style={{ backgroundColor: `hsl(var(--${team.color}))` }}
                      >
                        <span className="text-xs md:text-sm">{team.name}</span>
                      </Button>
                      <Button
                        onClick={() => handleMalusClick(team.id, team.name)}
                        variant="outline"
                        className={`w-full h-auto py-2 md:py-3 text-xs md:text-sm font-semibold border-2 ${theme === 'lcars' ? 'rounded-full' : ''}`}
                        style={{
                          borderColor: `hsl(var(--${team.color}))`,
                          color: `hsl(var(--${team.color}))`
                        }}
                      >
                        Malus / Bonus
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risposta Sbagliata */}
              <div className="space-y-3">
                <h3 className={`text-center font-bold text-base md:text-lg uppercase ${theme === 'lcars' ? 'text-[hsl(var(--lcars-red))]' : 'text-red-700'}`}>
                  Risposta Sbagliata:
                </h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {teams.map((team) => (
                    <Button
                      key={team.id}
                      onClick={() => handleWrongAnswer(team.id)}
                      className={`w-full h-auto py-3 md:py-4 border-2 font-semibold relative text-white ${theme === 'lcars' ? 'rounded-full' : ''}`}
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

      <Dialog open={malusDialog.isOpen} onOpenChange={(open) => !open && setMalusDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className={`${theme === 'lcars' ? 'bg-black border-[hsl(var(--lcars-orange))]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={theme === 'lcars' ? 'text-[hsl(var(--lcars-orange))]' : ''}>
              Assegna Punteggio a {malusDialog.teamName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Inserisci il punteggio da assegnare (usa il meno per i malus, es. -50)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 shrink-0"
                  onClick={() => adjustMalus(-1)}
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <Input
                  type="number"
                  value={malusScore}
                  onChange={(e) => setMalusScore(e.target.value)}
                  placeholder="0"
                  className="text-lg h-12 text-center"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmMalus();
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 shrink-0"
                  onClick={() => adjustMalus(1)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex justify-center gap-2 mt-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <Button
                    key={val}
                    variant="secondary"
                    size="sm"
                    onClick={() => adjustMalus(val)}
                    className="min-w-[3rem]"
                  >
                    {val > 0 ? '+' : ''}{val}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setMalusDialog(prev => ({ ...prev, isOpen: false }))}>
                Annulla
              </Button>
              <Button onClick={confirmMalus}>
                Conferma
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default Game;
