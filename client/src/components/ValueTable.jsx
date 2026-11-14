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

function ValueTable({ values }) {
  const { t } = useLanguage();

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

  return (
    <div className="value-table" role="table" aria-label={t('resultsTitle')}>
      <div className="value-row value-head" role="row">
        <span role="columnheader">{t('colTest')}</span>
        <span role="columnheader">{t('colResult')}</span>
        <span role="columnheader">{t('colRange')}</span>
        <span role="columnheader">{t('colStatus')}</span>
      </div>

      {values.map((item) => (
        <div
          className={`value-row ${item.isCritical ? 'row-critical' : ''}`}
          role="row"
          key={item.id}
        >
          <div className="cell-test" role="cell">
            <strong>{item.testName}</strong>
            {item.needsReview && (
              <small className="verify-note">
                <i className="fa-solid fa-magnifying-glass"></i>
                {t('verifyNote')}
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
              <i className={`fa-solid ${flagIcons[item.flag] || 'fa-question'}`}></i>
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
  );
}

export default ValueTable;