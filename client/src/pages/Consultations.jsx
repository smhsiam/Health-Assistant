import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function Consultations() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/consultations')
      .then((response) => setItems(response.data.consultations))
      .catch((err) => {
        const message =
          err.response && err.response.data && err.response.data.message;
        setError(message || t('errNetwork'));
      })
      .finally(() => setLoading(false));
  }, []);

  const isDoctor = user && user.role === 'doctor';

  return (
    <div className="container page">
      <h1 className="page-title">{t('tcListTitle')}</h1>
      <p className="page-subtitle">{t('tcListSub')}</p>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="hint">{t('tmLoadingText')}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <i className="fa-solid fa-comments empty-icon"></i>
          <h3>{t('tcNone')}</h3>
          {!isDoctor && (
            <>
              <p>{t('tcNoneHint')}</p>
              <div className="result-actions center">
                <Link to="/doctors" className="btn-primary">
                  {t('tcFindDoctor')}
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {items.map((item) => {
        const otherName =
          item.myRole === 'patient'
            ? `${item.doctorName} (${item.specialty})`
            : item.patientName;
        const lastTime = item.lastMessageAt || item.createdAt;

        return (
          <div className="shared-card" key={item.id}>
            <div>
              <h3>
                {t('tcWith')}: {otherName}
              </h3>
              <p className="doctor-meta">
                {item.messageCount} {t('tcMessages')},{' '}
                {new Date(lastTime).toLocaleString('en-GB')}
              </p>
              <span
                className={`status-badge ${
                  item.status === 'open' ? 'status-verified' : 'status-pending'
                }`}
              >
                {item.status === 'open'
                  ? t('tcOpenStatus')
                  : t('tcClosedStatus')}
              </span>
            </div>
            <Link to={`/consultations/${item.id}`} className="btn-primary">
              {t('tcOpenBtn')}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default Consultations;