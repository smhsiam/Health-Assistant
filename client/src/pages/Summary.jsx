import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import UrgencyBanner from '../components/UrgencyBanner';
import ValueTable from '../components/ValueTable';

const formatNumber = (number) => Number(number).toLocaleString('en-US');

function Summary() {
  const { id } = useParams();
  const { lang, changeLanguage, t } = useLanguage();

  const [data, setData] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    Promise.all([api.get(`/reports/${id}`), api.get('/profiles')])
      .then(([reportResponse, profileResponse]) => {
        if (cancelled) {
          return;
        }

        setData(reportResponse.data);

        const owner = profileResponse.data.profiles.find(
          (profile) => profile.id === reportResponse.data.report.profileId
        );
        setProfileName(owner ? owner.name : '');
      })
      .catch((err) => {
        if (!cancelled) {
          const status = err.response && err.response.status;
          setError(status === 404 ? 'reportNotFound' : 'reportLoadFailed');
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
  }, [id]);

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
          <Link to="/history" className="btn-outline">
            {t('history')}
          </Link>
        </div>
      </div>
    );
  }

  const { report, values, urgencyMessage } = data;

  const attention = values.filter(
    (item) => item.flag === 'high' || item.flag === 'low' || item.isCritical
  );
  const unchecked = values.filter(
    (item) => item.flag === 'unknown' && !item.isCritical
  );
  const inRange = values.filter(
    (item) => item.flag === 'normal' && !item.isCritical
  );

  const dateText = report.reportDate
    ? report.reportDate
    : new Date(report.createdAt).toLocaleDateString('en-GB');

  return (
    <div className="container page">
      <div className="sheet-tools no-print">
        <Link to={`/reports/${id}`} className="back-link">
          <i className="fa-solid fa-arrow-left"></i>
          {t('backToReport')}
        </Link>
        <div className="sheet-tool-buttons">
          <button
            type="button"
            className="lang-pill"
            onClick={() => changeLanguage(lang === 'en' ? 'bn' : 'en')}
            aria-label={t('changeLanguage')}
          >
            {lang === 'en' ? 'বাংলা' : 'EN'}
          </button>
          <button
            type="button"
            className="btn-primary btn-small"
            onClick={() => window.print()}
          >
            <i className="fa-solid fa-print"></i>
            {t('print')}
          </button>
        </div>
      </div>

      <div className="summary-sheet">
        <div className="sheet-head">
          <div>
            <h1>{t('sumTitle')}</h1>
            <p>{t('sumFrom')}</p>
          </div>
          <div className="sheet-brand">
            <i className="fa-solid fa-heart-pulse"></i> {t('appName')}
          </div>
        </div>

        <div className="sheet-meta">
          {profileName && (
            <div>
              <span>{t('sumPatient')}</span>
              <b>{profileName}</b>
            </div>
          )}
          <div>
            <span>{t('reportDateLabel')}</span>
            <b>{dateText}</b>
          </div>
          <div>
            <span>{t('sumPrepared')}</span>
            <b>{new Date().toLocaleDateString('en-GB')}</b>
          </div>
        </div>

        <UrgencyBanner message={urgencyMessage} />

        <section className="sheet-section">
          <h2>{t('sumAttention')}</h2>
          {attention.length > 0 ? (
            <ValueTable values={attention} />
          ) : (
            <p className="hint">{t('sumNone')}</p>
          )}
        </section>

        {unchecked.length > 0 && (
          <section className="sheet-section">
            <h2>{t('sumUnchecked')}</h2>
            <ValueTable values={unchecked} />
          </section>
        )}

        <section className="sheet-section">
          <h2>{t('sumInRange')}</h2>
          {inRange.length > 0 ? (
            <ul className="inrange-list">
              {inRange.map((item) => (
                <li key={item.id}>
                  {item.testName} {formatNumber(item.value)} {item.unit || ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint">{t('sumNone')}</p>
          )}
        </section>

        <p className="sheet-note">{t('sumNote')}</p>
        <p className="sheet-note">{t('doctorNotice')}</p>
      </div>
    </div>
  );
}

export default Summary;