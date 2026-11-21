import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const filters = [
  { value: 'pending', label: 'tmFilterPending' },
  { value: 'verified', label: 'tmFilterVerified' },
  { value: 'rejected', label: 'tmFilterRejected' },
  { value: 'all', label: 'tmFilterAll' },
];

const statusLabel = {
  pending: 'tmFilterPending',
  verified: 'tmFilterVerified',
  rejected: 'tmFilterRejected',
};

function AdminDoctors() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [status, setStatus] = useState('pending');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (filter) => {
    setLoading(true);
    setError('');

    api
      .get('/admin/doctors', { params: { status: filter } })
      .then((response) => setDoctors(response.data.doctors))
      .catch((err) => {
        const message =
          err.response && err.response.data && err.response.data.message;
        setError(message || t('errNetwork'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(status);
  }, [status]);

  const changeStatus = async (id, next) => {
    setError('');

    try {
      await api.put(`/admin/doctors/${id}/status`, { status: next });
      showToast(t('tmDoctorUpdated'), 'success');
      load(status);
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message;
      setError(message || t('errNetwork'));
    }
  };

  return (
    <div className="container page">
      <h1 className="page-title">{t('tmAdminTitle')}</h1>
      <p className="page-subtitle">{t('tmAdminSub')}</p>

      <div className="filter-row">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`filter-btn ${status === item.value ? 'active' : ''}`}
            onClick={() => setStatus(item.value)}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="hint">{t('tmLoadingText')}</p>}

      {!loading && !error && doctors.length === 0 && (
        <div className="empty-state">
          <i className="fa-solid fa-user-doctor empty-icon"></i>
          <p>{t('tmNoneInList')}</p>
        </div>
      )}

      {doctors.map((doctor) => (
        <div className="admin-card" key={doctor.id}>
          <div>
            <h3>{doctor.name}</h3>
            <p className="doctor-meta">{doctor.email}</p>
            <p className="doctor-meta">
              {doctor.specialty} | {t('tmBmdcShort')}: {doctor.bmdcNumber}
            </p>
            <span className={`status-badge status-${doctor.status}`}>
              {t(statusLabel[doctor.status])}
            </span>
          </div>

          <div className="admin-actions">
            {doctor.status !== 'verified' && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => changeStatus(doctor.id, 'verified')}
              >
                {t('tmVerify')}
              </button>
            )}
            {doctor.status !== 'rejected' && (
              <button
                type="button"
                className="btn-reject"
                onClick={() => changeStatus(doctor.id, 'rejected')}
              >
                {t('tmReject')}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDoctors;