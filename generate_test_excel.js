import * as XLSX from 'xlsx';
import fs from 'fs';

const data = [
  ['Categoria', 'Punteggio', 'Domanda', 'Risposta'],
  ['Scienza', 100, 'Qual è il simbolo chimico dell\'acqua?', 'H2O'],
  ['Scienza', 200, 'Quanti pianeti ci sono nel sistema solare?', '8'],
  ['Storia', 100, 'In che anno è stata scoperta l\'America?', '1492'],
  ['Storia', 200, 'Chi fu il primo imperatore romano?', 'Augusto'],
  ['Sport', 100, 'In che sport si usa la racchetta?', 'Tennis'],
  ['Sport', 200, 'Quanto dura una partita di calcio?', '90 minuti']
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, 'Quiz');

XLSX.writeFile(wb, 'test_quiz.xlsx');
console.log('test_quiz.xlsx created');
