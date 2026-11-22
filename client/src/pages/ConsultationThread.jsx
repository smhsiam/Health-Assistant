import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const readMessage = (err, fallback) =>
  (err.response && err.response.data && err.response.data.message) || fallback;

function ConsultationThread() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);

  const loadedRef = useRef(false);
  const endRef = useRef(null);
  const count = data ? data.messages.length : 0;

  const load = () =>
    api
      .get(`/consultations/${id}`)
      .then((response) => {
        loadedRef.current = true;
        setData(response.data);
        setError('');
      })
      .catch((err) => {
        const status = err.response && err.response.status;

        if (status === 404 || !loadedRef.current) {
          setError(status === 404 ? 'tcNotFound' : 'errNetwork');
        }
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    loadedRef.current = false;
    setLoading(true);
    load();

    const timer = setInterval(load, 8000);
    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [count]);

  const handleSend = async (e) => {
    e.preventDefault();

    const body = text.trim();

    if (!body) {
      return;
    }

    setSendError('');
    setSending(true);

    try {
      await api.post(`/consultations/${id}/messages`, { body });
      setText('');
      await load();
    } catch (err) {
      setSendError(readMessage(err, t('errNetwork')));
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    setSendError('');

    try {
      await api.put(`/consultations/${id}/close`);
      setConfirmClose(false);
      await load();
    } catch (err) {
      setSendError(readMessage(err, t('errNetwork')));
    }
  };

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
          <i className="fa-solid fa-comment-slash empty-icon"></i>
          <h3>{t(error)}</h3>
          <div className="result-actions center">
            <Link to="/consultations" className="btn-outline">
              {t('tcBack')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { consultation, messages } = data;
  const isOpen = consultation.status === 'open';
  const isPatient = consultation.myRole === 'patient';
  const otherName = isPatient
    ? `${consultation.doctorName} (${consultation.specialty})`
    : consultation.patientName;

  return (
    <div className="container page">
      <Link to="/consultations" className="back-link">
        <i className="fa-solid fa-arrow-left"></i>
        {t('tcBack')}
      </Link>

      <div className="thread-head">
        <div>
          <h1 className="page-title">{otherName}</h1>
          <span
            className={`status-badge ${
              isOpen ? 'status-verified' : 'status-pending'
            }`}
          >
            {isOpen ? t('tcOpenStatus') : t('tcClosedStatus')}
          </span>
        </div>

        {isOpen && !confirmClose && (
          <button
            type="button"
            className="btn-reject"
            onClick={() => setConfirmClose(true)}
          >
            {t('tcClose')}
          </button>
        )}
      </div>

      {confirmClose && (
        <div className="confirm-box" role="alertdialog">
          <p>{t('tcCloseConfirm')}</p>
          <div className="result-actions">
            <button type="button" className="btn-danger" onClick={handleClose}>
              {t('tcCloseYes')}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setConfirmClose(false)}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {isPatient && <div className="thread-notice">{t('tcPatientNotice')}</div>}

      <div className="chat-box" aria-live="polite">
        {messages.length === 0 && <p className="hint">{t('tcNoMessages')}</p>}

        {messages.map((item) => (
          <div
            key={item.id}
            className={`bubble ${item.mine ? 'mine' : 'theirs'}`}
          >
            <small>
              {item.senderRole === 'doctor'
                ? t('tcDoctorLabel')
                : t('tcPatientLabel')}
              {' | '}
              {new Date(item.createdAt).toLocaleString('en-GB')}
            </small>
            {item.body}
          </div>
        ))}

        <div ref={endRef}></div>
      </div>

      {sendError && (
        <div className="error-banner" role="alert">
          {sendError}
        </div>
      )}

      {isOpen ? (
        <>
          {!isPatient && (
            <div className="thread-warning">{t('tcDoctorWarning')}</div>
          )}
          <form className="composer" onSubmit={handleSend}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('tcWritePlaceholder')}
              aria-label={t('tcWritePlaceholder')}
              maxLength="2000"
              disabled={sending}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={sending || !text.trim()}
            >
              {sending ? t('tcSending') : t('tcSend')}
            </button>
          </form>
        </>
      ) : (
        <div className="thread-warning">{t('tcClosedNote')}</div>
      )}
    </div>
  );
}

export default ConsultationThread;