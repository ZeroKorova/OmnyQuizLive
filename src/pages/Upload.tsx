import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuiz } from '@/contexts/QuizContext';
import { useTheme } from '@/contexts/ThemeContext';
import { parseExcelFile } from '@/lib/excelParser';
import { saveQuizFile, getSavedQuizzes, deleteQuizFile, SavedQuiz } from '@/lib/quizStorage';
import { Upload, FileSpreadsheet, ArrowLeft, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const UploadPage = () => {
  const navigate = useNavigate();
  const { setQuizData, teams } = useQuiz();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSavedQuizzes(getSavedQuizzes());
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const data = await parseExcelFile(file);
      
      // Ask for title if user wants to save
      const title = quizTitle || file.name.replace('.xlsx', '').replace('.xls', '');
      
      // Save to localStorage
      saveQuizFile(title, data);
      setSavedQuizzes(getSavedQuizzes());
      
      setQuizData(data);
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
      <Card className="w-full max-w-2xl p-8 space-y-8 animate-slide-up">
        <Button
          variant="ghost"
          onClick={() => navigate('/setup')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Indietro
        </Button>

        <div className="text-center space-y-2">
          <h1 className={`text-5xl font-bold ${theme === 'lcars' ? 'text-[hsl(var(--lcars-orange))] uppercase tracking-wider' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}`}>
            OMNI QUIZ
          </h1>
          <p className="text-muted-foreground text-lg">
            Carica un file Excel con le categorie e le domande
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg">Formato del file Excel:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Colonna 1: Categoria</li>
              <li>Colonna 2: Punteggio</li>
              <li>Colonna 3: Domanda</li>
              <li>Colonna 4: Risposta</li>
            </ul>
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

          <div className="space-y-3">
            <Input
              placeholder="Titolo del quiz (opzionale)"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="text-center"
            />
          </div>

          <div
            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            {fileName ? (
              <div className="space-y-3">
                <FileSpreadsheet className="mx-auto h-16 w-16 text-secondary" />
                <p className="text-lg font-semibold">{fileName}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="mx-auto h-16 w-16 text-muted-foreground" />
                <p className="text-lg font-semibold">
                  {loading ? 'Caricamento...' : 'Clicca per caricare il file Excel'}
                </p>
                <p className="text-sm text-muted-foreground">Formato .xlsx o .xls</p>
              </div>
            )}
          </div>

          {savedQuizzes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-center">Quiz Salvati</h3>
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {savedQuizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleLoadSaved(quiz)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(quiz.savedAt).toLocaleDateString('it-IT')} - {quiz.data.categories.length} categorie
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadSaved(quiz);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDeleteSaved(quiz.id, e)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UploadPage;
