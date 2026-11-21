import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const statusKey = {
  pending: 'tmStatusPending',
  verified: 'tmStatusVerified',
  rejected: 'tmStatusRejected',
};

function DoctorProfile() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({
    specialty: '',
    experienceYears: '',
    bio: '',
    fee: '0',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fillForm = (data) => {
    setDoctor(data);
    setForm({
      specialty: data.specialty || '',
      experienceYears:
        data.experienceYears === null ? '' : String(data.experienceYears),
      bio: data.bio || '',
      fee: String(data.fee),
    });
  };

  useEffect(() => {
    api
      .get('/doctors/me')
      .then((response) => fillForm(response.data.doctor))
      .catch((err) => {
        const message =
          err.response && err.response.data && err.response.data.message;
        setError(message || t('errNetwork'));
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await api.put('/doctors/me', {
        specialty: form.specialty,
        experienceYears: form.experienceYears,
        bio: form.bio,
        fee: form.fee,
      });
      fillForm(response.data.doctor);
      showToast(t('tmSaved'), 'success');
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message;
      setError(message || t('errNetwork'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container page">
      <div className="upload-wrap">
        <h1 className="page-title">{t('tmMyProfileTitle')}</h1>
        <p className="page-subtitle">{t('tmMyProfileSub')}</p>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {doctor && (
          <form className="card upload-card" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>{t('tmStatus')}</label>
              <p>
                <span className={`status-badge status-${doctor.status}`}>
                  {t(statusKey[doctor.status])}
                </span>
              </p>
            </div>

            <div className="form-group">
              <label>{t('name')}</label>
              <input type="text" value={doctor.name} disabled />
            </div>

            <div className="form-group">
              <label>{t('bmdcNumber')}</label>
              <input type="text" value={doctor.bmdcNumber} disabled />
            </div>

            <div className="form-group">
              <label htmlFor="specialty">{t('specialty')}</label>
              <input
                id="specialty"
                name="specialty"
                type="text"
                value={form.specialty}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="experienceYears">{t('tmExperienceLabel')}</label>
              <input
                id="experienceYears"
                name="experienceYears"
                type="number"
                min="0"
                max="70"
                value={form.experienceYears}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fee">{t('tmFeeLabel')}</label>
              <input
                id="fee"
                name="fee"
                type="number"
                min="0"
                max="100000"
                value={form.fee}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">{t('tmBioLabel')}</label>
              <textarea
                id="bio"
                name="bio"
                maxLength="1000"
                value={form.bio}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-block"
              disabled={saving}
            >
              {saving ? t('tmSaving') : t('tmSave')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default DoctorProfile;