import { Fragment, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

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

const formatNumber = (number) => Number(number).toLocaleString('en-US');

const toInput = (number) =>
  number === null || number === undefined ? '' : String(number);

const cleanText = (text) => String(text).replace(/,/g, '').trim();

const isNumber = (text) => /^\d+(\.\d+)?$/.test(cleanText(text));

function ValueTable({ values, editable = false, onSave }) {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    value: '',
    unit: '',
    refLow: '',
    refHigh: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const formatRange = (low, high) => {
    if (low !== null && high !== null) {
      return `${formatNumber(low)} - ${formatNumber(high)}`;
    }
    if (high !== null) {
      return `${t('rangeUpTo')} ${formatNumber(high)}`;
    }
    if (low !== null) {
      return `${t('rangeFrom')} ${formatNumber(low)}`;
    }
    return t('rangeNone');
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      value: toInput(item.value),
      unit: item.unit || '',
      refLow: toInput(item.refLow),
      refHigh: toInput(item.refHigh),
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!isNumber(form.value)) {
      return t('errValueNumber');
    }

    const low = cleanText(form.refLow);
    const high = cleanText(form.refHigh);

    if ((low && !isNumber(low)) || (high && !isNumber(high))) {
      return t('errRangeNumber');
    }

    if (low && high && Number(low) > Number(high)) {
      return t('errRangeOrder');
    }

    return '';
  };

  const handleSave = async (e, item) => {
    e.preventDefault();

    const problem = validate();

    if (problem) {
      setError(problem);
      return;
    }

    setError('');
    setSaving(true);

    try {
      await onSave(item.id, form);
      setEditingId(null);
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message;
      setError(message || t('errNetwork'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="value-table" role="table" aria-label={t('resultsTitle')}>
      <div className="value-row value-head" role="row">
        <span role="columnheader">{t('colTest')}</span>
        <span role="columnheader">{t('colResult')}</span>
        <span role="columnheader">{t('colRange')}</span>
        <span role="columnheader">{t('colStatus')}</span>
      </div>

      {values.map((item) => (
        <Fragment key={item.id}>
          <div
            className={`value-row ${item.isCritical ? 'row-critical' : ''}`}
            role="row"
          >
            <div className="cell-test" role="cell">
              <strong>{item.testName}</strong>
              {item.needsReview && (
                <small className="verify-note">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  {t('verifyNote')}
                </small>
              )}
              {item.isCorrected && (
                <small className="corrected-note">
                  <i className="fa-solid fa-pen"></i>
                  {t('correctedNote')}
                </small>
              )}
            </div>

            <div className="cell-result" role="cell">
              <span className="cell-label">{t('colResult')}</span>
              <b>{formatNumber(item.value)}</b> <small>{item.unit || ''}</small>
            </div>

            <div className="cell-range" role="cell">
              <span className="cell-label">{t('colRange')}</span>
              {formatRange(item.refLow, item.refHigh)}
            </div>

            <div className="cell-status" role="cell">
              <span
                className={`badge badge-${item.flag === 'unknown' ? 'review' : item.flag}`}
              >
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
              {editable && editingId !== item.id && (
                <button
                  type="button"
                  className="icon-edit"
                  onClick={() => startEdit(item)}
                  aria-label={`${t('editValue')}: ${item.testName}`}
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
              )}
            </div>
          </div>

          {editable && editingId === item.id && (
            <form
              className="edit-panel"
              onSubmit={(e) => handleSave(e, item)}
              noValidate
            >
              {error && (
                <div className="error-banner" role="alert">
                  {error}
                </div>
              )}
              <p className="hint">{t('editHint')}</p>

              <div className="edit-grid">
                <div className="edit-field">
                  <label htmlFor={`value-${item.id}`}>{t('colResult')}</label>
                  <input
                    id={`value-${item.id}`}
                    name="value"
                    type="text"
                    inputMode="decimal"
                    value={form.value}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
                <div className="edit-field">
                  <label htmlFor={`unit-${item.id}`}>{t('unitLabel')}</label>
                  <input
                    id={`unit-${item.id}`}
                    name="unit"
                    type="text"
                    value={form.unit}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
                <div className="edit-field">
                  <label htmlFor={`low-${item.id}`}>{t('refLowLabel')}</label>
                  <input
                    id={`low-${item.id}`}
                    name="refLow"
                    type="text"
                    inputMode="decimal"
                    value={form.refLow}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
                <div className="edit-field">
                  <label htmlFor={`high-${item.id}`}>{t('refHighLabel')}</label>
                  <input
                    id={`high-${item.id}`}
                    name="refHigh"
                    type="text"
                    inputMode="decimal"
                    value={form.refHigh}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="edit-actions">
                <button
                  type="submit"
                  className="btn-primary btn-small"
                  disabled={saving}
                >
                  {saving ? t('saving') : t('save')}
                </button>
                <button
                  type="button"
                  className="btn-outline btn-small"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          )}
        </Fragment>
      ))}
    </div>
  );
}

export default ValueTable;