import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

function SharedReports() {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/shares/incoming')
      .then((response) => setReports(response.data.reports))
      .catch((err) => {
        const message =
          err.response && err.response.data && err.response.data.message;
        setError(message || t('errNetwork'));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <h1 className="page-title">{t('tsSharedTitle')}</h1>
      <p className="page-subtitle">{t('tsSharedSub')}</p>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="hint">{t('tmLoadingText')}</p>}

      {!loading && !error && reports.length === 0 && (
        <div className="empty-state">
          <i className="fa-solid fa-file-medical empty-icon"></i>
          <p>{t('tsNoShared')}</p>
        </div>
      )}

      {reports.map((item) => (
        <div className="shared-card" key={item.shareId}>
          <div>
            <h3>
              {t('tsPatient')}: {item.patientName}
            </h3>
            <p className="doctor-meta">
              {item.reportDate
                ? `${t('reportDateLabel')}: ${item.reportDate}`
                : ''}
            </p>
            <p className="doctor-meta">
              {t('tsSharedOn')}:{' '}
              {new Date(item.sharedAt).toLocaleDateString('en-GB')}
            </p>
            <p className="doctor-meta">
              {item.valueCount} {t('tsValuesCount')}, {item.abnormalCount}{' '}
              {t('tsAbnormalCount')}
            </p>
            {item.hasCritical && (
              <span className="status-badge status-rejected">
                {t('tsCriticalNote')}
              </span>
            )}
          </div>
          <Link to={`/doctor/shared/${item.reportId}`} className="btn-primary">
            {t('tsOpen')}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default SharedReports;