import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

function Doctors() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(null);

  const load = (specialty) => {
    setLoading(true);
    setError('');

    api
      .get('/doctors', { params: specialty ? { specialty } : {} })
      .then((response) => setDoctors(response.data.doctors))
      .catch((err) => {
        const message =
          err.response && err.response.data && err.response.data.message;
        setError(message || t('errNetwork'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load('');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(query.trim());
  };

  const startConsultation = async (doctorId) => {
    setError('');
    setStarting(doctorId);

    try {
      const response = await api.post('/consultations', { doctorId });
      navigate(`/consultations/${response.data.consultation.id}`);
    } catch (err) {
      const status = err.response && err.response.status;

      if (status === 409) {
        navigate('/consultations');
        return;
      }

      const message =
        err.response && err.response.data && err.response.data.message;
      setError(message || t('errNetwork'));
      setStarting(null);
    }
  };

  return (
    <div className="container page">
      <h1 className="page-title">{t('tmDoctorsTitle')}</h1>
      <p className="page-subtitle">{t('tmDoctorsSub')}</p>

      <form className="search-row" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('tmSearchSpecialty')}
          aria-label={t('tmSearchSpecialty')}
        />
        <button type="submit" className="btn-primary">
          <i className="fa-solid fa-magnifying-glass"></i> {t('tmSearchBtn')}
        </button>
      </form>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="hint">{t('tmLoadingText')}</p>}

      {!loading && !error && doctors.length === 0 && (
        <div className="empty-state">
          <i className="fa-solid fa-user-doctor empty-icon"></i>
          <p>{t('tmNoDoctors')}</p>
        </div>
      )}

      <div className="doctor-grid">
        {doctors.map((doctor) => (
          <div className="doctor-card" key={doctor.id}>
            <h3>{doctor.name}</h3>
            <p className="doctor-meta">{doctor.specialty}</p>
            {doctor.experienceYears !== null && (
              <p className="doctor-meta">
                {doctor.experienceYears} {t('tmExperienceYears')}
              </p>
            )}
            <p className="doctor-meta">
              {t('tmBmdcShort')}: {doctor.bmdcNumber}
            </p>
            {doctor.bio && <p className="doctor-bio">{doctor.bio}</p>}
            <p className="doctor-fee">
              {t('tmFee')}: {doctor.fee} {t('tmBdt')}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => startConsultation(doctor.id)}
              disabled={starting !== null}
            >
              {starting === doctor.id ? t('tcStarting') : t('tcStart')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Doctors;