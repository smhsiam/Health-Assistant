import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import UrgencyBanner from '../components/UrgencyBanner';
import DoctorNotice from '../components/DoctorNotice';

const flagIcons = {
  normal: 'fa-check',
  high: 'fa-arrow-up',
  low: 'fa-arrow-down',
  unknown: 'fa-question',
};

const flagKeys = {
  normal: 'flagNormal',
  high: 'flagHigh',
  low: 'flagLow',
  unknown: 'flagUnknown',
};

const quick = [
  { to: '/upload', icon: 'fa-file-arrow-up', label: 'startUpload', main: true },
  { to: '/history', icon: 'fa-clock-rotate-left', label: 'history' },
  { to: '/trends', icon: 'fa-chart-line', label: 'trends' },
  { to: '/doctors', icon: 'fa-user-doctor', label: 'tmNavDoctors' },
  { to: '/consultations', icon: 'fa-comments', label: 'tcNavConsult' },
  { to: '/profiles', icon: 'fa-users', label: 'profilesTitle' },
];

const dateText = (item) =>
  item.reportDate || new Date(item.createdAt).toLocaleDateString('en-GB');

function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [profiles, setProfiles] = useState([]);
  const [profileId, setProfileId] = useState('');
  const [reports, setReports] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    api
      .get('/profiles')
      .then((response) => {
        const list = response.data.profiles;
        setProfiles(list);
        const own = list.find((item) => item.isSelf) || list[0];

        if (own) {
          setProfileId(String(own.id));
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setError('errNetwork');
        setLoading(false);
      });
  }, [attempt]);

  useEffect(() => {
    if (!profileId) {
      return undefined;
    }

    let cancelled = false;

    setLoading(true);
    setError('');

    api
      .get('/reports', { params: { profileId } })
      .then(async (response) => {
        const list = response.data.reports;
        let detail = null;

        if (list.length > 0) {
          const full = await api.get(`/reports/${list[0].id}`);
          detail = full.data;
        }

        if (!cancelled) {
          setReports(list);
          setLatest(detail);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('errNetwork');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profileId, attempt]);

  const values = latest ? latest.values : [];
  const attention = values
    .filter((item) => item.flag === 'high' || item.flag === 'low')
    .sort((a, b) => Number(b.isCritical) - Number(a.isCritical));
  const toVerify = values.filter((item) => item.needsReview).length;
  const urgentReports = reports.filter((item) => item.hasCritical).length;
  const firstName = user && user.name ? user.name.split(' ')[0] : '';

  if (loading) {
    return (
      <div className="container page">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-block"></div>
        <div className="skeleton skeleton-block"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <div className="empty-state">
          <i className="fa-solid fa-file-circle-exclamation empty-icon"></i>
          <h3>{t(error)}</h3>
          <div className="result-actions center">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setAttempt(attempt + 1)}
            >
              {t('tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="dbd-head">
        <div>
          <h1 className="page-title">
            {t('dbWelcome')} {firstName}
          </h1>
          <p className="page-subtitle">{t('dbSub')}</p>
        </div>

        {profiles.length > 1 && (
          <div className="form-group dbd-select">
            <label htmlFor="dbProfile">{t('dbProfile')}</label>
            <select
              id="dbProfile"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
            >
              {profiles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {latest && <UrgencyBanner message={latest.urgencyMessage} />}

      {reports.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-file-circle-plus empty-icon"></i>
          <h3>{t('dbEmptyTitle')}</h3>
          <p>{t('noReportsText')}</p>
          <div className="result-actions center">
            <Link to="/upload" className="btn-primary">
              <i className="fa-solid fa-file-arrow-up"></i>
              {t('startUpload')}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <b>{reports.length}</b>
              <span>{t('dbCardReports')}</span>
            </div>
            <div className="summary-card attention">
              <b>{urgentReports}</b>
              <span>{t('dbCardUrgent')}</span>
            </div>
            <div className="summary-card attention">
              <b>{attention.length}</b>
              <span>{t('dbCardAttention')}</span>
            </div>
            <div className="summary-card verify">
              <b>{toVerify}</b>
              <span>{t('dbCardVerify')}</span>
            </div>
          </div>

          <div className="dbd-cols">
            <div className="dbd-card">
              <div className="dbd-card-head">
                <h3>{t('dbNeedsTitle')}</h3>
                <Link
                  to={`/reports/${latest.report.id}`}
                  className="dbd-link"
                >
                  {t('tcOpenBtn')}
                </Link>
              </div>

              {attention.length === 0 ? (
                <p className="hint">{t('dbNeedsNone')}</p>
              ) : (
                <div className="dbd-list">
                  {attention.slice(0, 6).map((item) => (
                    <div className="dbd-row" key={item.id}>
                      <div>
                        <div className="dbd-name">{item.testName}</div>
                        <div className="dbd-meta">
                          {Number(item.value).toLocaleString('en-US')}{' '}
                          {item.unit || ''}
                        </div>
                      </div>
                      <div className="dbd-val">
                        <span className={`badge badge-${item.flag}`}>
                          <i
                            className={`fa-solid ${flagIcons[item.flag] || 'fa-question'}`}
                          ></i>
                          {t(flagKeys[item.flag] || 'flagUnknown')}
                        </span>
                        {item.isCritical && (
                          <span className="badge badge-critical">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            {t('flagUrgent')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="dbd-note">{t('dbNeedsHint')}</p>
            </div>

            <div className="dbd-card">
              <div className="dbd-card-head">
                <h3>{t('dbRecentTitle')}</h3>
                <Link to="/history" className="dbd-link">
                  {t('dbViewAll')}
                </Link>
              </div>

              <div className="dbd-list">
                {reports.slice(0, 5).map((item) => (
                  <div className="dbd-row" key={item.id}>
                    <div>
                      <Link to={`/reports/${item.id}`} className="dbd-name">
                        {dateText(item)}
                      </Link>
                      <div className="dbd-meta">
                        {item.valueCount} {t('tsValuesCount')},{' '}
                        {item.abnormalCount} {t('tsAbnormalCount')}
                      </div>
                    </div>
                    {item.hasCritical && (
                      <span className="badge badge-critical">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        {t('flagUrgent')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <h3 className="dbd-note">{t('dbQuickTitle')}</h3>
      <div className="dbd-quick">
        {quick.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`dbd-q ${item.main ? 'main' : ''}`}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            {t(item.label)}
          </Link>
        ))}
      </div>

      <DoctorNotice />
    </div>
  );
}

export default Dashboard;