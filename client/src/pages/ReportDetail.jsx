import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import UrgencyBanner from '../components/UrgencyBanner';
import DoctorNotice from '../components/DoctorNotice';
import ShareDoctors from '../components/ShareDoctors';
import AskReport from '../components/AskReport';
import ValueTable from '../components/ValueTable';
import ExplanationSection from '../components/ExplanationSection';

function ReportDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');
    setData(null);

    api
      .get(`/reports/${id}`)
      .then((response) => {
        if (!cancelled) {
          setData(response.data);
        }
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
  }, [id, attempt]);

  const handleSave = async (valueId, form) => {
    const response = await api.put(`/reports/${id}/values/${valueId}`, {
      value: form.value,
      unit: form.unit,
      refLow: form.refLow,
      refHigh: form.refHigh,
    });

    setData(response.data);
    showToast(t('valueSaved'), 'success');
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await api.delete(`/reports/${id}`);
      showToast(t('reportDeleted'), 'success');
      navigate('/history');
    } catch (err) {
      showToast(t('deleteFailed'), 'error');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-block"></div>
        <div className="skeleton skeleton-block"></div>
        <div className="skeleton skeleton-line"></div>
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
            {error === 'reportLoadFailed' && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setAttempt(attempt + 1)}
              >
                {t('tryAgain')}
              </button>
            )}
            <Link to="/upload" className="btn-outline">
              {t('uploadAnother')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { report, values, urgencyMessage } = data;

  const counts = {
    total: values.length,
    normal: values.filter((item) => item.flag === 'normal').length,
    attention: values.filter(
      (item) => item.flag === 'high' || item.flag === 'low'
    ).length,
    verify: values.filter((item) => item.needsReview).length,
  };

  const dateText = report.reportDate
    ? `${t('reportDateLabel')}: ${report.reportDate}`
    : `${t('uploadedOn')}: ${new Date(report.createdAt).toLocaleDateString('en-GB')}`;

  return (
    <div className="container page">
      <div className="result-head">
        <div>
          <Link to="/history" className="back-link">
            <i className="fa-solid fa-arrow-left"></i>
            {t('history')}
          </Link>
          <h1 className="page-title">{report.fileName}</h1>
          <p className="page-subtitle">{dateText}</p>
        </div>
        <div className="result-check pop">
          <i className="fa-solid fa-circle-check"></i>
        </div>
      </div>

      <UrgencyBanner message={urgencyMessage} />

      <div className="summary-grid">
        <div className="summary-card">
          <b>{counts.total}</b>
          <span>{t('summaryTests')}</span>
        </div>
        <div className="summary-card good">
          <b>{counts.normal}</b>
          <span>{t('flagNormal')}</span>
        </div>
        <div className="summary-card attention">
          <b>{counts.attention}</b>
          <span>{t('summaryAttention')}</span>
        </div>
        <div className="summary-card verify">
          <b>{counts.verify}</b>
          <span>{t('summaryVerify')}</span>
        </div>
      </div>

      <ValueTable values={values} editable onSave={handleSave} />

      <ExplanationSection values={values} />

      <AskReport reportId={id} />

      <DoctorNotice />

      <ShareDoctors reportId={id} />

      {confirmDelete && (
        <div className="confirm-box" role="alertdialog" aria-labelledby="delete-title">
          <strong id="delete-title">{t('deleteTitle')}</strong>
          <p>{t('deleteText')}</p>
          <div className="result-actions">
            <button
              type="button"
              className="btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? t('deleting') : t('deleteConfirm')}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="result-actions">
        <Link to={`/reports/${id}/summary`} className="btn-primary">
          <i className="fa-solid fa-file-medical"></i>
          {t('sumButton')}
        </Link>
        <Link to="/upload" className="btn-outline">
          <i className="fa-solid fa-file-arrow-up"></i>
          {t('uploadAnother')}
        </Link>
        {!confirmDelete && (
          <button
            type="button"
            className="btn-quiet-danger"
            onClick={() => setConfirmDelete(true)}
          >
            <i className="fa-solid fa-trash"></i>
            {t('deleteReport')}
          </button>
        )}
      </div>
    </div>
  );
}

export default ReportDetail;