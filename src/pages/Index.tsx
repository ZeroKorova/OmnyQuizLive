import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Users, Upload, Play, Trash2, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuiz } from '@/contexts/QuizContext';
import { getSavedGames, deleteGame, SavedGame } from '@/lib/gameStorage';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { loadSavedGame } = useQuiz();
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);

  useEffect(() => {
    setSavedGames(getSavedGames());
  }, []);

  const handleLoadGame = (gameName: string) => {
    const success = loadSavedGame(gameName);
    if (success) {
      toast.success('Partita caricata!');
      navigate('/game');
    } else {
      toast.error('Errore nel caricamento della partita');
    }
  };

  const handleDeleteGame = (gameName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteGame(gameName);
    setSavedGames(getSavedGames());
    toast.success('Partita eliminata');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme}`}>
      <Card className="w-full max-w-2xl p-8 space-y-8 animate-slide-up">
        <div className="text-center space-y-4">
          <h1 className={`text-6xl font-bold ${theme === 'lcars' ? 'text-[hsl(var(--lcars-orange))] uppercase tracking-wider' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'} animate-glow`}>
            OMNI QUIZ
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema interattivo per quiz a squadre
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6 bg-card/50 border-2 border-primary/20 hover:border-primary transition-all">
            <div className="flex items-start gap-4">
              <Users className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Configura Squadre</h3>
                <p className="text-sm text-muted-foreground">
                  Scegli il numero di squadre, assegna colori e personalizza i nomi
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-2 border-secondary/20 hover:border-secondary transition-all">
            <div className="flex items-start gap-4">
              <Upload className="h-8 w-8 text-secondary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Carica Quiz Excel</h3>
                <p className="text-sm text-muted-foreground">
                  Il tabellone si adatta automaticamente alle categorie e domande del file
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-2 border-accent/20 hover:border-accent transition-all">
            <div className="flex items-start gap-4">
              <Trophy className="h-8 w-8 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Gioca e Vinci</h3>
                <p className="text-sm text-muted-foreground">
                  Gestisci le risposte, assegna punti e monitora la classifica in tempo reale
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Button
          variant="hero"
          size="lg"
          onClick={() => navigate('/setup')}
          className="w-full text-xl py-8"
        >
          Inizia Nuovo Gioco
        </Button>

        {savedGames.length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="font-semibold text-lg text-center">Partite Salvate</h3>
            <div className="grid gap-3 max-h-80 overflow-y-auto">
              {savedGames.map((game) => (
                <Card
                  key={game.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleLoadGame(game.gameName)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{game.gameName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(game.savedAt).toLocaleDateString('it-IT')} {new Date(game.savedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - {game.teams.length} squadre
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadGame(game.gameName);
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDeleteGame(game.gameName, e)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Index;
