import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import ValueTable from '../components/ValueTable';

function SharedReportView() {
  const { id } = useParams();
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');

    api
      .get(`/shares/incoming/${id}`)
      .then((response) => setData(response.data))
      .catch((err) => {
        const status = err.response && err.response.status;
        setError(status === 404 ? 'reportNotFound' : 'reportLoadFailed');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container page">
        <div className="skeleton skeleton-title"></div>
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
            <Link to="/doctor/shared" className="btn-outline">
              {t('tsBackShared')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { report, patient, values } = data;

  const dateText = report.reportDate
    ? `${t('reportDateLabel')}: ${report.reportDate}`
    : `${t('uploadedOn')}: ${new Date(report.createdAt).toLocaleDateString('en-GB')}`;

  return (
    <div className="container page">
      <Link to="/doctor/shared" className="back-link">
        <i className="fa-solid fa-arrow-left"></i>
        {t('tsBackShared')}
      </Link>
      <h1 className="page-title">{report.fileName}</h1>
      <p className="page-subtitle">{dateText}</p>

      <div className="readonly-note">{t('tsReadOnly')}</div>

      <div className="patient-strip">
        <span>
          {t('tsPatient')}: <strong>{patient.name}</strong>
        </span>
        {patient.sex && (
          <span>
            {t('tsSex')}: <strong>{patient.sex}</strong>
          </span>
        )}
        {patient.birthYear && (
          <span>
            {t('tsBirthYear')}: <strong>{patient.birthYear}</strong>
          </span>
        )}
      </div>

      {report.hasCritical && (
        <div className="error-banner" role="alert">
          {t('tsCriticalNote')}
        </div>
      )}

      <ValueTable values={values} />
    </div>
  );
}

export default SharedReportView;