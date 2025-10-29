import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuiz } from '@/contexts/QuizContext';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';

const Leaderboard = () => {
  const navigate = useNavigate();
  const { teams } = useQuiz();

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-8 w-8 text-yellow-400" />;
    if (index === 1) return <Medal className="h-8 w-8 text-gray-400" />;
    if (index === 2) return <Medal className="h-8 w-8 text-orange-600" />;
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-8 space-y-8 animate-slide-up">
        <Button
          variant="ghost"
          onClick={() => navigate('/game')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna al Gioco
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Classifica
          </h1>
          <p className="text-muted-foreground text-lg">Punteggi delle squadre</p>
        </div>

        <div className="space-y-4">
          {sortedTeams.map((team, index) => (
            <Card
              key={team.id}
              className="p-6 transition-all hover:scale-102"
              style={{
                borderColor: `hsl(var(--${team.color}))`,
                borderWidth: '3px',
                boxShadow: index === 0 ? `0 0 20px hsl(var(--${team.color}) / 0.3)` : 'none',
              }}
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-4xl font-bold w-12">{index + 1}</span>
                  {getMedalIcon(index)}
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: `hsl(var(--${team.color}))` }}
                  />
                  <div className="flex-1">
                    <p className="text-2xl font-bold">{team.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-5xl font-bold"
                    style={{ color: `hsl(var(--${team.color}))` }}
                  >
                    {team.score}
                  </p>
                  <p className="text-sm text-muted-foreground">punti</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate('/game')}
            className="flex-1"
          >
            Continua il Gioco
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/')}
            className="flex-1"
          >
            Nuovo Gioco
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard;
