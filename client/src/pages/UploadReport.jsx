import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const MAX_MB = 8;

const allowed = {
  pdf: ['application/pdf'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
};

const getExtension = (name) => name.toLowerCase().split('.').pop();

const isImageFile = (item) =>
  ['jpg', 'jpeg', 'png'].includes(getExtension(item.name));

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
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [useAi, setUseAi] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const imageSelected = Boolean(file) && isImageFile(file);

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

    api
      .get('/health')
      .then((response) => setAiAvailable(Boolean(response.data.ai)))
      .catch(() => setAiAvailable(false));
  }, []);

  useEffect(() => {
    if (!file || !isImageFile(file)) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const chooseFile = (picked) => {
    setError('');

    if (!picked) {
      return;
    }

    const mimeList = allowed[getExtension(picked.name)];

    if (!mimeList || !mimeList.includes(picked.type)) {
      setFile(null);
      setError(t('errNotSupported'));
      return;
    }

    if (picked.size > MAX_MB * 1024 * 1024) {
      setFile(null);
      setError(t('errBigFile'));
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
      setError(t('errChooseAny'));
      return;
    }

    const form = new FormData();
    form.append('profileId', profileId);
    if (reportDate) {
      form.append('reportDate', reportDate);
    }
    form.append('useAi', useAi && aiAvailable ? 'true' : 'false');
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

  const processingText =
    progress < 100
      ? t('uploading')
      : imageSelected
        ? t('readingImage')
        : t('checkingValues');

  return (
    <div className="container page">
      <div className="upload-wrap">
        <h1 className="page-title">{t('uploadTitle')}</h1>
        <p className="page-subtitle">{t('uploadSubAny')}</p>

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
                accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
                onChange={(e) => chooseFile(e.target.files[0])}
                disabled={uploading}
              />
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  style={{
                    maxHeight: 160,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: 8,
                  }}
                />
              ) : (
                <span className="drop-icon">
                  <i
                    className={
                      file
                        ? 'fa-solid fa-file-pdf'
                        : 'fa-solid fa-cloud-arrow-up'
                    }
                  ></i>
                </span>
              )}
              {file ? (
                <>
                  <strong>{file.name}</strong>
                  <small>{formatSize(file.size)}</small>
                </>
              ) : (
                <>
                  <strong>{t('dropTitleAny')}</strong>
                  <small>{t('dropHintAny')}</small>
                </>
              )}
            </label>
            {imageSelected && <p className="hint">{t('photoTip')}</p>}
          </div>

          <div className="ai-option">
            <label className="check">
              <input
                type="checkbox"
                checked={useAi && aiAvailable}
                onChange={(e) => setUseAi(e.target.checked)}
                disabled={uploading || !aiAvailable}
              />
              {t('aiOptionLabel')}
            </label>
            <p className="hint">
              {aiAvailable ? t('aiOptionHint') : t('aiOptionOff')}
            </p>
          </div>

          {uploading && (
            <div className="processing">
              <div className="spinner"></div>
              <p>{processingText}</p>
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
            {t('privacyLine')} {t('photoNote')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default UploadReport;