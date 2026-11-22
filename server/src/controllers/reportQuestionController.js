const reportModel = require('../models/reportModel');
const valueModel = require('../models/valueModel');
const { isEnabled } = require('../services/aiClient');
const { answerQuestion } = require('../services/questionService');
const { urgencyMessage } = require('../services/triageService');

const MAX_QUESTION = 300;

const readId = (input) => {
  const id = Number(input);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const askAboutReport = async (req, res, next) => {
  try {
    const id = readId(req.params.id);

    if (!id) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = await reportModel.findOwned(id, req.user.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!isEnabled()) {
      return res
        .status(503)
        .json({ message: 'Questions are not available right now' });
    }

    const question = String((req.body && req.body.question) || '').trim();

    if (!question || question.length > MAX_QUESTION) {
      return res.status(400).json({
        message: `Write a question of up to ${MAX_QUESTION} characters`,
      });
    }

    const lang = req.body.lang === 'bn' ? 'bn' : 'en';
    const rows = await valueModel.listByReport(id);

    try {
      const result = await answerQuestion(rows, question, lang);
      const hasCritical = rows.some((row) => row.is_critical);

      res.json({
        ...result,
        urgencyMessage: hasCritical ? urgencyMessage : null,
      });
    } catch (error) {
      console.error('Question failed:', error.message);
      res
        .status(502)
        .json({ message: 'Could not answer right now. Please try again later' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { askAboutReport };