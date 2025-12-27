import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';

const LeaderboardLive = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();

    // Robust data retrieval: defaults to empty array if state is missing
    const rawTeams = location.state?.teams;
    const teams = Array.isArray(rawTeams) ? rawTeams : [];

    // Sort safely handling potential missing scores
    const sortedTeams = [...teams].sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

    const getMedalIcon = (index: number) => {
        if (index === 0) return <Trophy className="h-8 w-8 text-yellow-400" />;
        if (index === 1) return <Medal className="h-8 w-8 text-gray-400" />;
        if (index === 2) return <Medal className="h-8 w-8 text-orange-600" />;
        return null;
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${theme}`}>
            <Card className="w-full max-w-3xl p-8 space-y-8 animate-slide-up">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/live')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Torna alla Live
                </Button>

                <div className="text-center space-y-2">
                    <h1 className={`text-5xl font-bold ${theme === 'lcars' ? 'text-[hsl(var(--lcars-orange))] uppercase tracking-wider' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}`}>
                        Classifica Live
                    </h1>
                    <p className="text-muted-foreground text-lg">Punteggi in tempo reale</p>
                </div>

                <div className="space-y-4">
                    {sortedTeams.length > 0 ? (
                        sortedTeams.map((team: any, index: number) => (
                            <Card
                                key={team?.id || index}
                                className="p-6 transition-all hover:scale-102"
                                style={{
                                    borderColor: `hsl(var(--${team?.color || 'primary'}))`,
                                    borderWidth: '3px',
                                    boxShadow: index === 0 ? `0 0 20px hsl(var(--${team?.color || 'primary'}) / 0.3)` : 'none',
                                }}
                            >
                                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                                    <div className="flex items-center gap-3 flex-1 w-full md:w-auto">
                                        <span className="text-3xl md:text-4xl font-bold w-8 md:w-12 text-center">{index + 1}</span>
                                        {getMedalIcon(index)}
                                        <div
                                            className="w-8 h-8 rounded-full shrink-0"
                                            style={{ backgroundColor: `hsl(var(--${team?.color || 'primary'}))` }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xl md:text-2xl font-bold truncate">{team?.name || 'Squadra'}</p>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-right w-full md:w-auto">
                                        <p
                                            className="text-4xl md:text-5xl font-bold"
                                            style={{ color: `hsl(var(--${team?.color || 'primary'}))` }}
                                        >
                                            {team?.score ?? 0}
                                        </p>
                                        <p className="text-sm text-muted-foreground">punti</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center p-8 opacity-50">
                            <p>Nessuna squadra in classifica.</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="hero"
                        size="lg"
                        onClick={() => navigate('/live')}
                        className="w-full"
                    >
                        Torna alla Live
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default LeaderboardLive;
