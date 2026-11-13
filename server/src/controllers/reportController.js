const fs = require('fs/promises');
const { hasPdfHeader, extractPdfText } = require('../services/pdfTextService');

const previewText = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Choose a PDF file to upload' });
  }

  const filePath = req.file.path;

  try {
    const validHeader = await hasPdfHeader(filePath);

    if (!validHeader) {
      return res.status(400).json({ message: 'This file is not a valid PDF' });
    }

    const buffer = await fs.readFile(filePath);

    let result;
    try {
      result = await extractPdfText(buffer);
    } catch (error) {
      return res.status(422).json({
        message:
          'This PDF could not be read. It may be damaged or protected by a password',
      });
    }

    if (result.likelyScanned) {
      return res.status(422).json({
        message:
          'No readable text was found. Scanned or photo reports are not supported yet',
      });
    }

    res.json({
      pageCount: result.pageCount,
      charCount: result.charCount,
      lineCount: result.lineCount,
      text: result.text,
    });
  } catch (error) {
    next(error);
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }
};

module.exports = { previewText };