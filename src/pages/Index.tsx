import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Users, Upload } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 animate-slide-up">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-glow">
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
      </Card>
    </div>
  );
};

export default Index;
