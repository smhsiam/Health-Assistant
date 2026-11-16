import { useState } from 'react';
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

function ExplanationCard({ item }) {
  const { lang, t } = useLanguage();
  const [showOther, setShowOther] = useState(false);

  const other = lang === 'en' ? 'bn' : 'en';
  const flag = flagIcons[item.flag] ? item.flag : 'unknown';
  const text = item.explanation || {};
  const readByAi = item.confidence !== null && item.confidence !== undefined;

  return (
    <article className={`expl-card ${item.isCritical ? 'critical' : ''}`}>
      <div className="expl-head">
        <strong>{item.testName}</strong>
        <span className="expl-badges">
          {readByAi && (
            <span className="badge badge-ai">
              <i className="fa-solid fa-robot"></i>
              {t('readByAi')}
            </span>
          )}
          <span className={`badge badge-${flag === 'unknown' ? 'review' : flag}`}>
            <i className={`fa-solid ${flagIcons[flag]}`}></i>
            {t(flagKeys[flag])}
          </span>
        </span>
      </div>

      <p className="expl-text" lang={lang}>
        {text[lang] || ''}
      </p>

      {showOther && (
        <p className="expl-text expl-other" lang={other}>
          {text[other] || ''}
        </p>
      )}

      <button
        type="button"
        className="expl-toggle"
        onClick={() => setShowOther(!showOther)}
        aria-expanded={showOther}
      >
        <i className="fa-solid fa-language"></i>
        {showOther ? t('explHide') : t('explOther')}
      </button>
    </article>
  );
}

export default ExplanationCard;