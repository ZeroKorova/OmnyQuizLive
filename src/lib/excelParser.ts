import * as XLSX from 'xlsx';
import { QuizData } from '@/types/quiz';

export const parseExcelFile = (file: File): Promise<QuizData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          reject(new Error('Il file Excel deve contenere almeno 2 righe (intestazione e dati)'));
          return;
        }

        // Formato: Colonna 1 = Categoria, Colonna 2 = Punteggio, Colonna 3 = Domanda, Colonna 4 = Risposta
        const categoryMap: { [key: string]: any[] } = {};
        const categories: string[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const category = String(row[0] || '').trim();
          const value = Number(row[1]) || 0;
          const question = String(row[2] || '').trim();
          const answer = String(row[3] || '').trim();

          // Parse options from columns E, F, G, H (indices 4, 5, 6, 7)
          const options: string[] = [];
          [4, 5, 6, 7].forEach(index => {
            const opt = String(row[index] || '').trim();
            if (opt) options.push(opt);
          });

          if (category && question) {
            if (!categoryMap[category]) {
              categoryMap[category] = [];
              categories.push(category);
            }

            categoryMap[category].push({
              category,
              value,
              question,
              answer,
              options,
              answered: false,
              answeredBy: null,
            });
          }
        }

        const questions = categories.map(cat => categoryMap[cat]);

        resolve({ categories, questions });
      } catch (error) {
        reject(new Error('Errore nella lettura del file Excel: ' + error));
      }
    };

    reader.onerror = (e) => {
      console.error('FileReader Error:', e);
      reject(new Error('Errore nella lettura del file: ' + (reader.error?.message || 'Errore sconosciuto')));
    };

    const readFile = (method: 'arrayBuffer' | 'binaryString') => {
      try {
        if (method === 'arrayBuffer') {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsBinaryString(file);
        }
      } catch (e) {
        console.error('FileReader Exception:', e);
        reject(new Error('Impossibile avviare la lettura del file. Prova a copiare il file nella memoria interna del dispositivo.'));
      }
    };

    reader.onerror = (e) => {
      console.error('FileReader Error:', e);
      // If ArrayBuffer failed, try BinaryString as fallback
      if (reader.error?.name === 'NotReadableError' || e.type === 'error') {
        // We can't easily retry here because the reader is in error state, 
        // but we can reject with a specific message.
        reject(new Error('Errore di permessi. SU ANDROID: Copia il file nella cartella "Download" o "Documenti" interna e riprova. Non aprirlo da "Recenti" o "Drive".'));
      } else {
        reject(new Error('Errore nella lettura del file: ' + (reader.error?.message || 'Errore sconosciuto')));
      }
    };

    readFile('arrayBuffer');
  });
};
