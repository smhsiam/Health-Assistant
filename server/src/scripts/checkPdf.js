const fs = require('fs');
const { extractPdfText } = require('../services/pdfTextService');

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node src/scripts/checkPdf.js path-to-file.pdf');
  process.exit(1);
}

const run = async () => {
  const buffer = fs.readFileSync(filePath);
  const result = await extractPdfText(buffer);

  console.log('Pages:', result.pageCount);
  console.log('Characters:', result.charCount);
  console.log('Lines:', result.lineCount);
  console.log('Likely scanned:', result.likelyScanned);
  console.log('----- text (column gaps shown as |) -----');

  result.text.split('\n').forEach((line, index) => {
    const number = String(index + 1).padStart(2, '0');
    console.log(`${number}  ${line.replace(/ {2,}/g, ' | ')}`);
  });
};

run().catch((error) => {
  console.error('Could not read the PDF:', error.message);
  process.exit(1);
});