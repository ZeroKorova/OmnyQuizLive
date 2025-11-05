import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useQuiz } from '@/contexts/QuizContext';
import { Team } from '@/types/quiz';
import { Minus, Plus, Edit2, Check } from 'lucide-react';

const TEAM_COLORS = [
  'team-1', 'team-2', 'team-3', 'team-4', 'team-5', 'team-6',
  'team-7', 'team-8', 'team-9', 'team-10', 'team-11', 'team-12',
  'team-13', 'team-14', 'team-15', 'team-16', 'team-17', 'team-18',
  'team-19', 'team-20', 'team-21', 'team-22', 'team-23', 'team-24',
  'team-25', 'team-26', 'team-27', 'team-28', 'team-29', 'team-30',
];

const Setup = () => {
  const navigate = useNavigate();
  const { setTeams } = useQuiz();
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState<string[]>(['1', '2']);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleNumTeamsChange = (delta: number) => {
    const newNum = Math.max(1, Math.min(30, numTeams + delta));
    setNumTeams(newNum);
    
    const newNames = [...teamNames];
    if (newNum > teamNames.length) {
      for (let i = teamNames.length; i < newNum; i++) {
        newNames.push(`${i + 1}`);
      }
    } else {
      newNames.splice(newNum);
    }
    setTeamNames(newNames);
  };

  const handleTeamNameChange = (index: number, name: string) => {
    const newNames = [...teamNames];
    newNames[index] = name;
    setTeamNames(newNames);
  };

  const handleContinue = () => {
    const teams: Team[] = teamNames.map((name, index) => ({
      id: index + 1,
      name,
      color: TEAM_COLORS[index],
      score: 0,
    }));
    setTeams(teams);
    navigate('/upload');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            OMNI QUIZ
          </h1>
          <p className="text-muted-foreground text-lg">Configura le squadre per iniziare</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-card rounded-lg border border-border">
            <span className="text-lg font-semibold">Numero di squadre</span>
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="game"
                onClick={() => handleNumTeamsChange(-1)}
                disabled={numTeams <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-3xl font-bold w-12 text-center">{numTeams}</span>
              <Button
                size="icon"
                variant="game"
                onClick={() => handleNumTeamsChange(1)}
                disabled={numTeams >= 30}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Nomi delle squadre</h3>
            {teamNames.map((name, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg border-2 transition-all"
                style={{ borderColor: `hsl(var(--${TEAM_COLORS[index]}))` }}
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `hsl(var(--${TEAM_COLORS[index]}))` }}
                />
                <span className="font-semibold w-20">{index + 1}</span>
                {editingIndex === index ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={name}
                      onChange={(e) => handleTeamNameChange(index, e.target.value)}
                      className="flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingIndex(null);
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingIndex(null)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-lg">{name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingIndex(index)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="hero"
          size="lg"
          onClick={handleContinue}
          className="w-full"
        >
          Continua
        </Button>
      </Card>
    </div>
  );
};

export default Setup;
