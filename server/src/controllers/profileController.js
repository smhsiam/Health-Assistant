const profileModel = require('../models/profileModel');

const listProfiles = async (req, res, next) => {
  try {
    const rows = await profileModel.listByUser(req.user.id);

    res.json({
      profiles: rows.map((row) => ({
        id: row.id,
        name: row.name,
        relation: row.relation,
        birthYear: row.birth_year,
        sex: row.sex,
        isSelf: row.is_self,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listProfiles };