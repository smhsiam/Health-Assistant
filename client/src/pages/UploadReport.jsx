import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const MAX_MB = 5;

const formatSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function UploadReport() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [profileId, setProfileId] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    api
      .get('/profiles')
      .then((response) => {
        setProfiles(response.data.profiles);
        if (response.data.profiles.length > 0) {
          setProfileId(String(response.data.profiles[0].id));
        }
      })
      .catch(() => setError(t('errNetwork')));
  }, []);

  const chooseFile = (picked) => {
    setError('');

    if (!picked) {
      return;
    }

    const isPdf =
      picked.type === 'application/pdf' &&
      picked.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setFile(null);
      setError(t('errNotPdf'));
      return;
    }

    if (picked.size > MAX_MB * 1024 * 1024) {
      setFile(null);
      setError(t('errTooLarge'));
      return;
    }

    setFile(picked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!profileId) {
      setError(t('errChooseProfile'));
      return;
    }

    if (!file) {
      setError(t('errChooseFile'));
      return;
    }

    const form = new FormData();
    form.append('profileId', profileId);
    if (reportDate) {
      form.append('reportDate', reportDate);
    }
    form.append('file', file);

    setUploading(true);
    setProgress(0);

    try {
      const response = await api.post('/reports', form, {
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      });

      showToast(t('reportReady'), 'success');
      navigate(`/reports/${response.data.report.id}`);
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message;
      setError(message || t('errNetwork'));
      setUploading(false);
    }
  };

  return (
    <div className="container page">
      <div className="upload-wrap">
        <h1 className="page-title">{t('uploadTitle')}</h1>
        <p className="page-subtitle">{t('uploadSub')}</p>

        <form className="card upload-card" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="profile">{t('profileLabel')}</label>
            <select
              id="profile"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              disabled={uploading}
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reportDate">{t('dateLabel')}</label>
            <input
              id="reportDate"
              type="date"
              max={today}
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              disabled={uploading}
            />
            <p className="hint">{t('dateHint')}</p>
          </div>

          <div className="drop-wrap">
            <label
              className={`drop-area ${dragOver ? 'over' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (!uploading) {
                  chooseFile(e.dataTransfer.files[0]);
                }
              }}
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => chooseFile(e.target.files[0])}
                disabled={uploading}
              />
              <span className="drop-icon">
                <i className={file ? 'fa-solid fa-file-pdf' : 'fa-solid fa-cloud-arrow-up'}></i>
              </span>
              {file ? (
                <>
                  <strong>{file.name}</strong>
                  <small>{formatSize(file.size)}</small>
                </>
              ) : (
                <>
                  <strong>{t('dropTitle')}</strong>
                  <small>{t('dropHint')}</small>
                </>
              )}
            </label>
          </div>

          {uploading && (
            <div className="processing">
              <div className="spinner"></div>
              <p>{progress < 100 ? t('uploading') : t('checkingValues')}</p>
              <div className="progress">
                <span style={{ width: `${progress}%` }}></span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={uploading}
          >
            <i className="fa-solid fa-file-circle-check"></i>
            {t('submitReport')}
          </button>
        </form>

        <div className="privacy-line">
          <i className="fa-solid fa-lock"></i>
          <p>
            {t('privacyLine')} {t('scanNote')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default UploadReport;