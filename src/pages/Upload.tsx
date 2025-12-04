import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuiz } from '@/contexts/QuizContext';
import { useTheme } from '@/contexts/ThemeContext';
import { parseExcelFile } from '@/lib/excelParser';
import { saveQuizFile, getSavedQuizzes, deleteQuizFile, SavedQuiz, isLibraryInitialized, initializeLibrary } from '@/lib/quizStorage';
import { Upload, FileSpreadsheet, ArrowLeft, Trash2, Play, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { InstructionsDialog } from '@/components/InstructionsDialog';

const UploadPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { setQuizData, setGameName, teams } = useQuiz();

  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [gameName, setGameNameInput] = useState<string>('');
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [isManageMode, setIsManageMode] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      if (!isLibraryInitialized()) {
        setInitializing(true);
        try {
          const defaults = [
            { name: 'Quiz Standard', path: '/quizzes/standard_quiz.xlsx' },
            { name: 'Quiz Scelta Multipla', path: '/quizzes/standard_quiz_multichoice.xls' },
            { name: 'Super Mega Quiz', path: '/quizzes/super_mega_quiz.xls' },
          ];

          const processedQuizzes: SavedQuiz[] = [];

          for (const quiz of defaults) {
            try {
              const response = await fetch(quiz.path);
              const blob = await response.blob();
              const file = new File([blob], quiz.path.split('/').pop() || 'quiz.xlsx');
              const data = await parseExcelFile(file);

              processedQuizzes.push({
                id: Date.now().toString() + Math.random().toString(),
                title: quiz.name,
                data,
                savedAt: new Date().toISOString()
              });
            } catch (e) {
              console.error(`Failed to load default quiz: ${quiz.name}`, e);
            }
          }

          initializeLibrary(processedQuizzes);
          toast.success('Libreria inizializzata con i quiz predefiniti!');
        } catch (error) {
          console.error('Initialization error', error);
        } finally {
          setInitializing(false);
        }
      }
      setSavedQuizzes(getSavedQuizzes());
    };

    init();

    if (teams.length === 0) {
      toast.error('Devi prima configurare le squadre!');
      navigate('/setup');
    }
  }, [teams, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const data = await parseExcelFile(file);

      // Ask for title if user wants to save
      const title = quizTitle || file.name.replace('.xlsx', '').replace('.xls', '');

      // Create game name with date and custom name
      const today = new Date().toLocaleDateString('it-IT');
      const finalGameName = gameName ? `${today} - ${gameName}` : `${today} - ${title}`;

      // Save to localStorage
      saveQuizFile(title, data);
      setSavedQuizzes(getSavedQuizzes());

      setQuizData(data);
      setGameName(finalGameName);
      toast.success('File caricato e salvato con successo!');
      setTimeout(() => navigate('/game'), 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore nel caricamento del file');
      setFileName('');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSaved = (quiz: SavedQuiz) => {
    setQuizData(quiz.data);

    // Set game name for autosave
    const today = new Date().toLocaleDateString('it-IT');
    const finalGameName = gameName ? `${today} - ${gameName}` : `${today} - ${quiz.title}`;
    setGameName(finalGameName);

    toast.success(`Quiz "${quiz.title}" caricato!`);
    setTimeout(() => navigate('/game'), 500);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteQuizFile(id);
    setSavedQuizzes(getSavedQuizzes());
    toast.success('Quiz eliminato');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme}`}>
      <Card className="w-full max-w-4xl p-8 space-y-8 animate-slide-up">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/setup')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>
          <div className="flex gap-2">
            <InstructionsDialog />
            <Button
              variant={isManageMode ? "secondary" : "outline"}
              onClick={() => setIsManageMode(!isManageMode)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              {isManageMode ? 'Fatto' : 'Gestisci Libreria'}
            </Button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className={`text-5xl font-bold ${theme === 'lcars' ? 'text-[hsl(var(--lcars-orange))] uppercase tracking-wider' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}`}>
            OMNI QUIZ
          </h1>
          <p className="text-muted-foreground text-lg">
            {initializing ? 'Inizializzazione libreria...' : (isManageMode ? 'Gestisci la tua libreria di quiz' : 'Scegli un quiz per iniziare')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
              style={{ borderColor: `hsl(var(--${team.color}))` }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: `hsl(var(--${team.color}))` }}
              />
              <span className="font-semibold">{team.name}</span>
            </div>
          ))}
        </div>

        {/* Upload Section - Only visible in Manage Mode */}
        {isManageMode && (
          <div className="space-y-6 border-b pb-8 animate-in fade-in slide-in-from-top-4">
            <div className="bg-muted/50 p-6 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg">Aggiungi Nuovo Quiz</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Input
                      placeholder="Titolo del quiz (opzionale)"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Nome della partita (opzionale)"
                      value={gameName}
                      onChange={(e) => setGameNameInput(e.target.value)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-semibold">Formato Excel richiesto:</p>
                    <ul className="list-disc list-inside">
                      <li>Colonna 1: Categoria</li>
                      <li>Colonna 2: Punteggio</li>
                      <li>Colonna 3: Domanda</li>
                      <li>Colonna 4: Risposta</li>
                    </ul>
                  </div>
                </div>

                <div
                  className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-primary transition-colors bg-background"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.ods"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {fileName ? (
                    <div className="space-y-3">
                      <FileSpreadsheet className="mx-auto h-12 w-12 text-secondary" />
                      <p className="font-semibold">{fileName}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="font-semibold">
                        {loading ? 'Caricamento...' : 'Carica File Excel'}
                      </p>
                      <p className="text-xs text-muted-foreground">.xlsx, .xls, .ods</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Name Input */}
        <div className="max-w-md mx-auto space-y-2">
          <label className="text-sm font-medium ml-1">Nome della Partita (Opzionale)</label>
          <Input
            placeholder="Es. Partita di Natale"
            value={gameName}
            onChange={(e) => setGameNameInput(e.target.value)}
            className="text-center text-lg"
          />
        </div>

        {/* Unified Quiz Library */}
        <div className="space-y-4">
          <h3 className="font-semibold text-xl text-center">Libreria Quiz</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {savedQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="p-4 flex flex-col gap-4 hover:bg-muted/50 cursor-pointer transition-all"
                onClick={() => !isManageMode && handleLoadSaved(quiz)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <FileSpreadsheet className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold line-clamp-1">{quiz.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(quiz.savedAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  {isManageMode ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={(e) => handleDeleteSaved(quiz.id, e)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina
                    </Button>
                  ) : (
                    <Button size="sm" className="w-full" variant="secondary">
                      <Play className="h-4 w-4 mr-2" />
                      Gioca
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {!isManageMode && savedQuizzes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Non hai ancora caricato nessun quiz personalizzato.</p>
              <Button variant="link" onClick={() => setIsManageMode(true)}>
                Clicca su Gestisci per aggiungerne uno
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UploadPage;
