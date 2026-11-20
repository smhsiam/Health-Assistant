const { createWorker } = require('tesseract.js');

const MIN_TEXT_LENGTH = 50;

const cleanText = (raw) =>
  raw
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const extractImageText = async (filePath) => {
  const worker = await createWorker('eng');

  try {
    const result = await worker.recognize(filePath);
    const text = cleanText(result.data.text || '');

    return {
      text,
      confidence: Number(result.data.confidence) || 0,
      charCount: text.length,
      tooShort: text.length < MIN_TEXT_LENGTH,
    };
  } finally {
    await worker.terminate();
  }
};

module.exports = { extractImageText };