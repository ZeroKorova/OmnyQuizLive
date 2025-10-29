import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuiz } from '@/contexts/QuizContext';
import { parseExcelFile } from '@/lib/excelParser';
import { Upload, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const UploadPage = () => {
  const navigate = useNavigate();
  const { setQuizData, teams } = useQuiz();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const data = await parseExcelFile(file);
      setQuizData(data);
      toast.success('File caricato con successo!');
      setTimeout(() => navigate('/game'), 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore nel caricamento del file');
      setFileName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Carica Quiz
          </h1>
          <p className="text-muted-foreground text-lg">
            Carica un file Excel con le categorie e le domande
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg">Formato del file Excel:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Prima riga: nomi delle categorie</li>
              <li>Righe successive: domande per ogni categoria (una per riga)</li>
              <li>Colonne successive alle categorie: risposte corrispondenti</li>
              <li>I punti saranno assegnati automaticamente (100, 200, 300...)</li>
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
        </div>
      </Card>
    </div>
  );
};

export default UploadPage;
