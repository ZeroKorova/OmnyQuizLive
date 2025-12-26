
import { useEffect, useState, useMemo } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Trophy, Home, X, Clock, QrCode } from "lucide-react";
import { useQuiz } from "@/contexts/QuizContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import QRCode from 'react-qr-code';

interface GameState {
    status: 'WAITING' | 'ACTIVE' | 'FINISHED' | 'QUESTION' | 'ANSWER_REVEALED';
    currentQuestion?: {
        category: string;
        question: string;
        value: number;
        options?: string[];
        shuffledOptions?: string[];
    };
    gridState?: {
        category: string;
        questions: {
            value: number;
            answered: boolean;
            answeredCorrectly?: boolean;
            answeredColor?: string | null;
        }[];
    }[];
    scores: { id: number; name: string; score: number; color: string }[];
    buzzedTeam: string | null;
    lastEventTimestamp?: number;
    timer: number;
    lastEvent?: { type: 'CORRECT' | 'WRONG' | 'ADJUST'; teamId?: number; teamName?: string; amount?: number } | null;
}

export default function Live() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const { theme } = useTheme();
    useWakeLock();
    const navigate = useNavigate();
    const [showQr, setShowQr] = useState(false);

    // Popup State
    const [popup, setPopup] = useState<{ show: boolean; data: NonNullable<GameState['lastEvent']> | null }>({ show: false, data: null });

    // Listen to Firebase game state changes
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "games", "current"), (doc) => {
            if (doc.exists()) {
                const data = doc.data() as GameState;
                setGameState(prev => {
                    if (data.lastEvent && data.lastEventTimestamp !== prev?.lastEventTimestamp) {
                        triggerPopup(data.lastEvent);
                    }
                    return data;
                });
            }
        });
        return () => unsubscribe();
    }, []);

    const triggerPopup = (event: NonNullable<GameState['lastEvent']>) => {
        setPopup({ show: true, data: event });
        setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 3000);
    };

    if (!gameState) return <div className="min-h-screen flex items-center justify-center text-white bg-black">Connecting to Live Feed...</div>;

    const teams = Array.isArray(gameState.scores) ? gameState.scores : [];

    const getBuzzedTeamInfo = () => {
        if (!gameState.buzzedTeam) return null;
        return teams.find(t => String(t.id) === String(gameState.buzzedTeam));
    };
    const buzzedTeamInfo = getBuzzedTeamInfo();

    return (
        <div className={`min-h-screen flex flex-col p-4 space-y-6 ${theme === 'lcars' ? 'bg-black text-[#ff9900]' : 'bg-background text-foreground'}`}>

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 font-sans">
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                        <Home className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowQr(true)} className="ml-2">
                        <QrCode className="h-6 w-6" />
                    </Button>
                </div>

                <h1 className={`text-3xl md:text-4xl font-bold ${theme === 'lcars' ? 'text-[hsl(var(--lcars-orange))] uppercase tracking-wider' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}`}>
                    OMNI QUIZ LIVE
                </h1>

                <div className="flex items-center gap-2">
                    {(gameState.status === 'QUESTION' || gameState.status === 'ACTIVE') && (
                        <div className="text-red-500 animate-pulse font-bold flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full">
                            <span>●</span> LIVE
                        </div>
                    )}
                </div>
            </div>

            {/* Scores */}
            <div className="flex flex-wrap gap-3 justify-center">
                {teams.map((team) => (
                    <Card
                        key={team.id}
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
                ))}
            </div>

            {/* Waiting State: The Grid */}
            {gameState.status === 'WAITING' && gameState.gridState && (
                <div className="flex w-full pb-4 justify-center items-center flex-1">
                    {gameState.gridState.length > 0 ? (
                        <div className="flex gap-2 md:gap-4 px-2 md:px-4 m-auto">
                            {gameState.gridState.map((col, i) => (
                                <div key={i} className="flex flex-col gap-2 md:gap-4 w-[75px] md:w-[150px]">
                                    {/* Category Header */}
                                    <Card className="p-1 md:p-3 bg-primary text-primary-foreground text-center font-bold h-[50px] md:h-[60px] flex items-center justify-center">
                                        <h3 className="text-[9px] md:text-xs lg:text-sm uppercase break-words hyphens-auto leading-tight line-clamp-2" style={{ wordBreak: 'break-word' }}>
                                            {col.category}
                                        </h3>
                                    </Card>

                                    {/* Questions Loop - Strictly copying Game.tsx structure */}
                                    {[...col.questions].reverse().map((q, j) => (
                                        <Card
                                            key={j}
                                            className={`p-3 md:p-4 lg:p-6 flex items-center justify-center text-center transition-all relative ${q.answered ? 'opacity-70' : ''} ${theme === 'lcars' ? 'rounded-full' : ''}`}
                                            style={{
                                                backgroundColor: q.answered && q.answeredColor
                                                    ? `hsl(var(--${q.answeredColor}))`
                                                    : q.answered
                                                        ? 'hsl(var(--muted))'
                                                        : theme === 'lcars'
                                                            ? 'black'
                                                            : 'hsl(var(--card))',
                                                // Ensure uniform height if content is small, but use padding primarily like Game.tsx
                                                // Adding minHeight to be safe against shrinking content
                                                minHeight: '80px'
                                            }}
                                        >
                                            <p className={`text-[0.6rem] md:text-xs uppercase mb-1 opacity-80 font-semibold truncate w-full px-1 ${theme === 'lcars' ? 'text-[hsl(var(--lcars-orange))]' : 'text-muted-foreground'}`}>
                                                {col.category}
                                            </p>

                                            <p className={`text-xl md:text-2xl lg:text-3xl font-bold ${theme === 'lcars' ? 'text-white' : ''}`}>
                                                {/* Show value ALWAYS unless covered by X overlay? Game.tsx shows it underneath. */}
                                                {q.value}
                                            </p>

                                            {/* X Overlay for Wrong Answers */}
                                            {q.answered && q.answeredCorrectly === false && (
                                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                                    <X className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-black opacity-80" strokeWidth={4} />
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <h2 className="text-2xl md:text-4xl font-bold opacity-50">IN ATTESA DELL'INIZIO...</h2>
                            <p className="opacity-50">Il Quiz Master sta preparando la partita.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Active Question View */}
            {(gameState.status === 'QUESTION' || gameState.status === 'ANSWER_REVEALED') && gameState.currentQuestion && (
                <div className="flex-1 flex flex-col justify-center items-center gap-6 overflow-y-auto w-full p-4 relative z-0">

                    {/* Timer */}
                    <div className={`w-full max-w-4xl flex items-center justify-center gap-3 p-4 rounded-lg ${theme === 'lcars' ? 'bg-[hsl(var(--lcars-orange))]' : 'bg-primary/10'}`}>
                        <Clock className={`h-6 w-6 ${theme === 'lcars' ? 'text-black' : 'text-primary'} ${gameState.timer <= 10 ? 'animate-pulse' : ''}`} />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-lg font-bold ${theme === 'lcars' ? 'text-black' : 'text-primary'}`}>
                                    {gameState.timer}s
                                </span>
                            </div>
                            {theme === 'lcars' ? (
                                <div className="w-full h-3 bg-black rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ${gameState.timer <= 10 ? 'bg-[hsl(var(--lcars-red))]' : 'bg-[hsl(var(--lcars-blue))]'}`}
                                        style={{ width: `${(gameState.timer / 100) * 100}%` }} />
                                </div>
                            ) : (
                                <Progress value={(gameState.timer / 100) * 100} className={`h-3 ${gameState.timer <= 10 ? '[&>div]:bg-destructive' : ''}`} />
                            )}
                        </div>
                    </div>

                    {/* Question Card */}
                    <Card className={`w-full max-w-4xl p-6 md:p-8 ${theme === 'lcars' ? 'bg-[hsl(var(--lcars-blue))]' : 'bg-primary/10'}`}>
                        <p className={`text-xl md:text-3xl text-center font-semibold ${theme === 'lcars' ? 'text-white' : ''}`}>
                            {gameState.currentQuestion.question}
                        </p>
                    </Card>

                    {/* Options */}
                    {gameState.currentQuestion.options && gameState.currentQuestion.options.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                            {(gameState.currentQuestion.shuffledOptions || gameState.currentQuestion.options).map((opt, idx) => (
                                <Card key={idx} className={`p-4 text-center flex items-center justify-center min-h-[80px] ${theme === 'lcars'
                                    ? 'bg-black border-[hsl(var(--lcars-blue))] text-[hsl(var(--lcars-blue))]'
                                    : 'bg-muted/50'}`}>
                                    <p className="text-lg font-medium">{opt}</p>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Answer Reveal */}
                    {gameState.status === 'ANSWER_REVEALED' && (
                        <Card className={`w-full max-w-4xl p-6 md:p-8 ${theme === 'lcars' ? 'bg-[hsl(var(--lcars-pink))]' : 'bg-secondary/10'}`}>
                            <p className={`text-xl md:text-3xl text-center font-semibold ${theme === 'lcars' ? 'text-white' : ''}`}>
                                {/* We don't have answer text in basic stream, only question. 
                                  If Game sends 'answer' in currentQuestion, show it.
                                  For now hiding or showing question again if answer missing.
                               */ }
                                RISPOSTA SVELATA SUL BROADCASTER
                            </p>
                        </Card>
                    )}

                    {/* Buzzer Overlay */}
                    {buzzedTeamInfo && (
                        <div className="mt-8 animate-pulse text-center">
                            <div className="inline-block px-6 py-3 rounded-xl text-white font-bold text-xl shadow-lg transform scale-110 transition-transform"
                                style={{ backgroundColor: `hsl(var(--${buzzedTeamInfo.color}))` }}>
                                🔔 {buzzedTeamInfo.name} HA PREMUTO!
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Popup Overlay */}
            <Dialog open={popup.show} onOpenChange={() => { }}>
                <DialogContent className={`border-4 rounded-xl shadow-2xl min-w-[300px] text-center p-8 bg-black ${popup.data?.type === 'CORRECT' ? 'border-green-500 text-green-500 shadow-[0_0_50px_green]' :
                    popup.data?.type === 'WRONG' ? 'border-red-500 text-red-500 shadow-[0_0_50px_red]' :
                        'border-yellow-500 text-yellow-500'
                    }`}>
                    <div className="text-4xl font-black mb-2 uppercase">{popup.data?.type === 'CORRECT' ? 'ESATTO!' : popup.data?.type === 'WRONG' ? 'ERRORE!' : 'PUNTI'}</div>
                    <div className="text-white text-2xl font-bold mb-4">{popup.data?.teamName || `SQUADRA ${popup.data?.teamId}`}</div>
                    <div className="text-6xl font-black">
                        {popup.data?.amount && popup.data.amount > 0 ? '+' : ''}{popup.data?.amount}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showQr} onOpenChange={setShowQr}>
                <DialogContent className="bg-white text-black flex flex-col items-center justify-center p-8 max-w-sm">
                    <h2 className="text-2xl font-bold mb-4">Scansiona per Giocare!</h2>
                    <div className="bg-white p-4 rounded-xl shadow-xl">
                        <QRCode value={`${window.location.origin}/#/live`} size={250} />
                    </div>
                    <p className="mt-4 text-center text-gray-500">
                        OmniQuiz Live
                    </p>
                </DialogContent>
            </Dialog>
        </div>
    );
}
