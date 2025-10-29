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
        
        // Prima riga: categorie
        const categories = jsonData[0].filter(Boolean).map(String);
        
        // Righe successive: domande organizzate per valore
        const questions: any[][] = categories.map(() => []);
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          for (let j = 0; j < categories.length; j++) {
            if (row[j]) {
              questions[j].push({
                category: categories[j],
                value: (i) * 100, // Valore incrementale
                question: row[j],
                answer: row[j + categories.length] || '', // Risposta nella colonna successiva
                answered: false,
              });
            }
          }
        }
        
        resolve({ categories, questions });
      } catch (error) {
        reject(new Error('Errore nella lettura del file Excel: ' + error));
      }
    };
    
    reader.onerror = () => reject(new Error('Errore nella lettura del file'));
    reader.readAsArrayBuffer(file);
  });
};
