const fs = require('fs/promises');
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const MAX_PAGES = 10;
const MIN_TEXT_LENGTH = 50;
const SAME_LINE_TOLERANCE = 2;
const COLUMN_GAP = 15;

const hasPdfHeader = async (filePath) => {
  const handle = await fs.open(filePath, 'r');

  try {
    const buffer = Buffer.alloc(5);
    await handle.read(buffer, 0, 5, 0);
    return buffer.toString('latin1') === '%PDF-';
  } finally {
    await handle.close();
  }
};

const renderPage = async (pageData) => {
  const content = await pageData.getTextContent({
    normalizeWhitespace: true,
    disableCombineTextItems: false,
  });

  let text = '';
  let last = null;

  for (const item of content.items) {
    const piece = String(item.str || '').trim();

    if (!piece) {
      continue;
    }

    const x = item.transform[4];
    const y = item.transform[5];

    if (last === null) {
      text += piece;
    } else if (Math.abs(y - last.y) > SAME_LINE_TOLERANCE) {
      text += `\n${piece}`;
    } else {
      const gap = last.end === null ? 5 : x - last.end;

      if (gap < 0.5) {
        text += piece;
      } else if (gap > COLUMN_GAP) {
        text += `   ${piece}`;
      } else {
        text += ` ${piece}`;
      }
    }

    last = {
      y,
      end: Number.isFinite(item.width) ? x + item.width : null,
    };
  }

  return text;
};

const cleanText = (raw) =>
  raw
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const extractPdfText = async (buffer) => {
  const data = await pdfParse(buffer, {
    max: MAX_PAGES,
    pagerender: renderPage,
  });

  const text = cleanText(data.text || '');

  return {
    text,
    pageCount: data.numpages,
    charCount: text.length,
    lineCount: text ? text.split('\n').length : 0,
    likelyScanned: text.length < MIN_TEXT_LENGTH,
  };
};

module.exports = { hasPdfHeader, extractPdfText };