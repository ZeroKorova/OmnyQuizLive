import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, HelpCircle } from "lucide-react";
import * as XLSX from 'xlsx';

export const InstructionsDialog = () => {
    const handleDownloadTemplate = () => {
        const wb = XLSX.utils.book_new();
        const headers = ['Categoria', 'Punteggio', 'Domanda', 'Risposta', 'Opzione 1', 'Opzione 2', 'Opzione 3', 'Opzione 4'];

        const exampleStandard = [
            'Storia',
            100,
            'Chi ha scoperto l\'America?',
            'Cristoforo Colombo',
            '', '', '', ''
        ];

        const exampleMulti = [
            'Scienza',
            200,
            'Qual è il simbolo chimico dell\'acqua?',
            'H2O',
            'H2O', 'CO2', 'O2', 'NaCl'
        ];

        const wsData = [headers, exampleStandard, exampleMulti];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths for better readability
        ws['!cols'] = [
            { wch: 15 }, // Categoria
            { wch: 10 }, // Punteggio
            { wch: 40 }, // Domanda
            { wch: 20 }, // Risposta
            { wch: 15 }, // Opzione 1
            { wch: 15 }, // Opzione 2
            { wch: 15 }, // Opzione 3
            { wch: 15 }, // Opzione 4
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Template Quiz");
        XLSX.writeFile(wb, "template_quiz.xlsx");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Guida & Template
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Guida Formato Excel</DialogTitle>
                    <DialogDescription>
                        Segui queste istruzioni per creare il tuo file quiz personalizzato.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            Struttura delle Colonne
                        </h3>
                        <div className="grid gap-4 text-sm border rounded-lg p-4 bg-muted/50">
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                                <span className="font-mono font-bold bg-background px-2 py-1 rounded border">Colonna A</span>
                                <span><span className="font-semibold">Categoria</span> (es. Storia, Scienze)</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                                <span className="font-mono font-bold bg-background px-2 py-1 rounded border">Colonna B</span>
                                <span><span className="font-semibold">Punteggio</span> (es. 100, 200, 300)</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                                <span className="font-mono font-bold bg-background px-2 py-1 rounded border">Colonna C</span>
                                <span><span className="font-semibold">Domanda</span> (Il testo della domanda)</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                                <span className="font-mono font-bold bg-background px-2 py-1 rounded border">Colonna D</span>
                                <span><span className="font-semibold">Risposta</span> (La risposta corretta)</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-start pt-2 border-t mt-2">
                                <span className="font-mono font-bold bg-background px-2 py-1 rounded border">Colonna E-H</span>
                                <div>
                                    <span className="font-semibold">Opzioni (Facoltativo)</span>
                                    <p className="text-muted-foreground text-xs mt-1">
                                        Inserisci qui 4 possibili risposte per creare una domanda a scelta multipla.
                                        <br />
                                        <strong>Importante:</strong> Una delle opzioni DEVE essere identica alla risposta corretta (Colonna D).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-semibold mb-1">Nota Bene:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>La prima riga del file viene ignorata (usala per le intestazioni).</li>
                            <li>Puoi lasciare vuote le colonne E-H per le domande classiche (senza opzioni).</li>
                        </ul>
                    </div>

                    <Button onClick={handleDownloadTemplate} className="w-full gap-2" size="lg">
                        <Download className="h-5 w-5" />
                        Scarica File Template
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
