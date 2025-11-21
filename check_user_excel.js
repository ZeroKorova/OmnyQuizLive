import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const files = [
    'quiz set/1 set quiz standard.xlsx',
    'quiz set/Super Mega Quiz UNO.exel.xls'
];

files.forEach(filePath => {
    console.log(`\nChecking file: ${filePath}`);
    try {
        if (!fs.existsSync(filePath)) {
            console.error('File not found!');
            return;
        }
        const buf = fs.readFileSync(filePath);
        const workbook = XLSX.read(buf, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
            console.error('Error: File has fewer than 2 rows.');
            return;
        }

        const header = jsonData[0];
        console.log('Header:', header);

        const firstRow = jsonData[1];
        console.log('First Data Row:', firstRow);

        // Basic validation check based on excelParser.ts logic
        // Col 0: Category, Col 1: Value, Col 2: Question, Col 3: Answer
        const category = firstRow[0];
        const value = firstRow[1];
        const question = firstRow[2];
        const answer = firstRow[3];

        console.log(`Parsed Sample -> Category: "${category}", Value: ${value}, Question: "${question}", Answer: "${answer}"`);

        if (!category || !question) {
            console.warn("WARNING: Category or Question appears empty in the first row.");
        }

    } catch (error) {
        console.error('Error reading file:', error.message);
    }
});
