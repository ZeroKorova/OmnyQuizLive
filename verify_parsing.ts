import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'QUIZ SET', '1 set quiz standard scelta multipla.xls');

try {
    console.log(`Reading file: ${filePath}`);
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('File read successfully.');
    console.log(`Total rows: ${jsonData.length}`);

    // Check first few rows for options
    // Columns E, F, G, H are indices 4, 5, 6, 7
    for (let i = 1; i < Math.min(jsonData.length, 6); i++) {
        const row = jsonData[i];
        const category = row[0];
        const question = row[2];
        const options = [];
        [4, 5, 6, 7].forEach(index => {
            if (row[index]) options.push(row[index]);
        });

        console.log(`\nRow ${i + 1}:`);
        console.log(`Category: ${category}`);
        console.log(`Question: ${question}`);
        console.log(`Options found: ${options.length}`);
        if (options.length > 0) {
            console.log(`Options: ${JSON.stringify(options)}`);
        } else {
            console.log('No options found.');
        }
    }

} catch (error) {
    console.error('Error:', error.message);
}
