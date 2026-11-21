const doctorModel = require('../models/doctorModel');

const formatDoctor = (row, withEmail) => {
  const doctor = {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    bmdcNumber: row.bmdc_number,
    experienceYears: row.experience_years,
    bio: row.bio,
    fee: row.fee,
    status: row.status,
  };

  if (withEmail) {
    doctor.email = row.email;
  }

  return doctor;
};

const readId = (input) => {
  const id = Number(input);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const readWhole = (input, min, max) => {
  if (input === null || String(input).trim() === '') {
    return false;
  }

  const number = Number(input);
  return Number.isInteger(number) && number >= min && number <= max
    ? number
    : false;
};

const listVerified = async (req, res, next) => {
  try {
    const specialty = String(req.query.specialty || '').trim().slice(0, 100);
    const rows = await doctorModel.listVerified(specialty || null);
    res.json({ doctors: rows.map((row) => formatDoctor(row, false)) });
  } catch (error) {
    next(error);
  }
};

const getVerified = async (req, res, next) => {
  try {
    const id = readId(req.params.id);

    if (!id) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const row = await doctorModel.findVerified(id);

    if (!row) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ doctor: formatDoctor(row, false) });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const row = await doctorModel.findByUserId(req.user.id);

    if (!row) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({ doctor: formatDoctor(row, true) });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const current = await doctorModel.findByUserId(req.user.id);

    if (!current) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    let specialty = current.specialty;
    let experienceYears = current.experience_years;
    let bio = current.bio;
    let fee = current.fee;

    if (req.body.specialty !== undefined) {
      specialty = String(req.body.specialty).trim();

      if (!specialty || specialty.length > 100) {
        return res.status(400).json({ message: 'Enter your specialty' });
      }
    }

    if (req.body.experienceYears !== undefined) {
      if (
        req.body.experienceYears === null ||
        String(req.body.experienceYears).trim() === ''
      ) {
        experienceYears = null;
      } else {
        const years = readWhole(req.body.experienceYears, 0, 70);

        if (years === false) {
          return res
            .status(400)
            .json({ message: 'Experience must be between 0 and 70 years' });
        }

        experienceYears = years;
      }
    }

    if (req.body.bio !== undefined) {
      bio = String(req.body.bio || '').trim();

      if (bio.length > 1000) {
        return res
          .status(400)
          .json({ message: 'The bio can have at most 1000 characters' });
      }

      bio = bio || null;
    }

    if (req.body.fee !== undefined) {
      const amount = readWhole(req.body.fee, 0, 100000);

      if (amount === false) {
        return res
          .status(400)
          .json({ message: 'Fee must be between 0 and 100000 BDT' });
      }

      fee = amount;
    }

    const row = await doctorModel.updateProfile(req.user.id, {
      specialty,
      experienceYears,
      bio,
      fee,
    });

    res.json({ doctor: formatDoctor(row, true) });
  } catch (error) {
    next(error);
  }
};

const listForAdmin = async (req, res, next) => {
  try {
    const status = String(req.query.status || 'pending');
    const allowed = ['pending', 'verified', 'rejected', 'all'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const rows = await doctorModel.listByStatus(status === 'all' ? null : status);
    res.json({ doctors: rows.map((row) => formatDoctor(row, true)) });
  } catch (error) {
    next(error);
  }
};

const setDoctorStatus = async (req, res, next) => {
  try {
    const id = readId(req.params.id);
    const status = String(req.body.status || '');

    if (!id) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!['verified', 'rejected'].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Status must be verified or rejected' });
    }

    const row = await doctorModel.setStatus(id, status);

    if (!row) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ doctor: formatDoctor(row, true) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listVerified,
  getVerified,
  getMyProfile,
  updateMyProfile,
  listForAdmin,
  setDoctorStatus,
};