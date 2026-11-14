import { useLanguage } from '../context/LanguageContext';

function UrgencyBanner({ message }) {
  const { lang, t } = useLanguage();

  if (!message) {
    return null;
  }

  return (
    <div className="urgency" role="alert">
      <span className="urgency-icon">
        <i className="fa-solid fa-triangle-exclamation"></i>
      </span>
      <div>
        <strong>{t('urgentTitle')}</strong>
        <p>{message[lang]}</p>
      </div>
    </div>
  );
}

export default UrgencyBanner;