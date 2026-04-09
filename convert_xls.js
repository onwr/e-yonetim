const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = xlsx.readFile('./src/utils/sgk_meslek_kodlari.xls');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const results = [];
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (row.length >= 3) {
    const kod = row[0] ? row[0].toString().trim() : '';
    const ad = row[2] ? row[2].toString().trim() : '';
    if (kod && ad && ad !== '-' && kod !== 'MESLEK KODLARI') {
      results.push({ kod, ad });
    }
  }
}

fs.writeFileSync('./src/utils/sgk_meslek_kodlari.json', JSON.stringify(results, null, 2));
console.log('Converted', results.length, 'records.');
