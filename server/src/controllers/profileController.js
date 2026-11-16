const profileModel = require('../models/profileModel');

const MAX_PROFILES = 10;
const RELATIONS = ['mother', 'father', 'spouse', 'child', 'sibling', 'other'];
const SEXES = ['male', 'female'];

const formatProfile = (row) => ({
  id: row.id,
  name: row.name,
  relation: row.relation,
  birthYear: row.birth_year,
  sex: row.sex,
  isSelf: row.is_self,
});

const readId = (input) => {
  const id = Number(input);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const readFields = (body, isSelf) => {
  const name = String(body.name || '').trim();

  if (!name || name.length > 100) {
    return { error: 'Enter a name of up to 100 characters' };
  }

  let relation = 'self';

  if (!isSelf) {
    relation = String(body.relation || 'other').trim().toLowerCase();

    if (!RELATIONS.includes(relation)) {
      return { error: 'Choose a valid relation' };
    }
  }

  const yearText = String(
    body.birthYear === undefined || body.birthYear === null ? '' : body.birthYear
  ).trim();
  let birthYear = null;

  if (yearText !== '') {
    if (!/^\d{4}$/.test(yearText)) {
      return { error: 'Enter the birth year as four digits, for example 1990' };
    }

    birthYear = Number(yearText);
    const thisYear = new Date().getFullYear();

    if (birthYear < 1900 || birthYear > thisYear) {
      return { error: `Enter a birth year between 1900 and ${thisYear}` };
    }
  }

  const sexText = String(
    body.sex === undefined || body.sex === null ? '' : body.sex
  )
    .trim()
    .toLowerCase();
  let sex = null;

  if (sexText !== '') {
    if (!SEXES.includes(sexText)) {
      return { error: 'Choose male, female or leave it empty' };
    }

    sex = sexText;
  }

  return { name, relation, birthYear, sex };
};

const listProfiles = async (req, res, next) => {
  try {
    const rows = await profileModel.listByUser(req.user.id);
    res.json({ profiles: rows.map(formatProfile) });
  } catch (error) {
    next(error);
  }
};

const createProfile = async (req, res, next) => {
  try {
    const total = await profileModel.countByUser(req.user.id);

    if (total >= MAX_PROFILES) {
      return res
        .status(400)
        .json({ message: `You can keep up to ${MAX_PROFILES} profiles` });
    }

    const fields = readFields(req.body || {}, false);

    if (fields.error) {
      return res.status(400).json({ message: fields.error });
    }

    const row = await profileModel.create({ userId: req.user.id, ...fields });
    res.status(201).json({ profile: formatProfile(row) });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const id = readId(req.params.id);

    if (!id) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const existing = await profileModel.findOwned(id, req.user.id);

    if (!existing) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const fields = readFields(req.body || {}, existing.is_self);

    if (fields.error) {
      return res.status(400).json({ message: fields.error });
    }

    const row = await profileModel.update({
      id,
      userId: req.user.id,
      ...fields,
    });

    res.json({ profile: formatProfile(row) });
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const id = readId(req.params.id);

    if (!id) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const existing = await profileModel.findOwned(id, req.user.id);

    if (!existing) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (existing.is_self) {
      return res
        .status(400)
        .json({ message: 'Your own profile cannot be deleted' });
    }

    await profileModel.removeOther(id, req.user.id);
    res.json({ message: 'Profile deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
};