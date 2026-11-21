import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const readMessage = (err, fallback) =>
  (err.response && err.response.data && err.response.data.message) || fallback;

function ShareDoctors({ reportId }) {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [doctors, setDoctors] = useState([]);
  const [shares, setShares] = useState([]);
  const [chosen, setChosen] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadShares = async () => {
    const response = await api.get(`/shares/report/${reportId}`);
    setShares(response.data.shares);
  };

  useEffect(() => {
    Promise.all([api.get('/doctors'), loadShares()])
      .then(([doctorResponse]) => setDoctors(doctorResponse.data.doctors))
      .catch((err) => setError(readMessage(err, t('errNetwork'))));
  }, [reportId]);

  const sharedIds = shares.map((item) => item.doctorId);
  const available = doctors.filter((doctor) => !sharedIds.includes(doctor.id));

  const handleShare = async () => {
    if (!chosen) {
      return;
    }

    setError('');
    setBusy(true);

    try {
      await api.post('/shares', {
        reportId: Number(reportId),
        doctorId: Number(chosen),
      });
      await loadShares();
      setChosen('');
      showToast(t('tsShareDone'), 'success');
    } catch (err) {
      setError(readMessage(err, t('errNetwork')));
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async (shareId) => {
    setError('');
    setBusy(true);

    try {
      await api.delete(`/shares/${shareId}`);
      await loadShares();
      showToast(t('tsStopped'), 'success');
    } catch (err) {
      setError(readMessage(err, t('errNetwork')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="share-box">
      <h3>
        <i className="fa-solid fa-user-doctor"></i> {t('tsShareTitle')}
      </h3>
      <p className="hint">{t('tsShareSub')}</p>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {available.length === 0 && shares.length === 0 ? (
        <p className="hint">{t('tsNoVerifiedDoctors')}</p>
      ) : (
        <div className="share-row">
          <select
            value={chosen}
            onChange={(e) => setChosen(e.target.value)}
            disabled={busy || available.length === 0}
            aria-label={t('tsChooseDoctor')}
          >
            <option value="">{t('tsChooseDoctor')}</option>
            {available.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} ({doctor.specialty})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-primary"
            onClick={handleShare}
            disabled={busy || !chosen}
          >
            {busy ? t('tsSharing') : t('tsShareBtn')}
          </button>
        </div>
      )}

      {shares.length === 0 ? (
        <p className="hint">{t('tsNobodyYet')}</p>
      ) : (
        <ul className="share-list">
          {shares.map((item) => (
            <li className="share-item" key={item.id}>
              <span>
                <strong>{item.doctorName}</strong> ({item.specialty})
              </span>
              <button
                type="button"
                className="btn-reject"
                onClick={() => handleStop(item.id)}
                disabled={busy}
              >
                {t('tsStopShare')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShareDoctors;