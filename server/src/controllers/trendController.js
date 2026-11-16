const profileModel = require('../models/profileModel');
const valueModel = require('../models/valueModel');
const { groupRows, summarize, analyze } = require('../services/trendService');
const { urgencyMessage } = require('../services/triageService');

const readProfileId = (input) => {
  const id = Number(input);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const loadGroups = async (req, res) => {
  const profileId = readProfileId(req.query.profileId);

  if (!profileId) {
    res.status(400).json({ message: 'Choose a profile' });
    return null;
  }

  const profile = await profileModel.findOwned(profileId, req.user.id);

  if (!profile) {
    res.status(404).json({ message: 'Profile not found' });
    return null;
  }

  const rows = await valueModel.listForTrends(req.user.id, profileId);
  return groupRows(rows);
};

const listTrends = async (req, res, next) => {
  try {
    const groups = await loadGroups(req, res);

    if (!groups) {
      return;
    }

    res.json({ tests: summarize(groups) });
  } catch (error) {
    next(error);
  }
};

const getTrend = async (req, res, next) => {
  try {
    const key = String(req.params.testKey || '');

    if (!/^[a-z0-9_]{1,220}$/.test(key)) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const groups = await loadGroups(req, res);

    if (!groups) {
      return;
    }

    const points = groups[key];

    if (!points) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const last = points[points.length - 1];

    res.json({
      key,
      name: last.testName,
      unit: last.unit,
      points,
      analysis: analyze(points),
      urgencyMessage: last.isCritical ? urgencyMessage : null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listTrends, getTrend };