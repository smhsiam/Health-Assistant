import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const features = [
  { icon: 'fa-language', text: 'feat1' },
  { icon: 'fa-scale-balanced', text: 'feat2' },
  { icon: 'fa-chart-line', text: 'feat3' },
  { icon: 'fa-lock', text: 'feat4' },
];

function AuthLayout({ title, subtitle, children }) {
  const { lang, changeLanguage, t } = useLanguage();

  return (
    <div className="auth-page">
      <aside className="auth-panel">
        <span className="circle circle-one"></span>
        <span className="circle circle-two"></span>
        <span className="circle circle-three"></span>

        <Link to="/" className="auth-logo">
          <span className="logo-mark">
            <i className="fa-solid fa-heart-pulse"></i>
          </span>
          <span>{t('appName')}</span>
        </Link>

        <div className="auth-panel-body">
          <h2>{t('authWelcome')}</h2>
          <p>{t('authWelcomeText')}</p>
          <ul className="auth-features">
            {features.map((item) => (
              <li key={item.text}>
                <span>
                  <i className={`fa-solid ${item.icon}`}></i>
                </span>
                {t(item.text)}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-panel-foot">{t('doctorNotice')}</p>
      </aside>

      <main className="auth-form-side">
        <div className="auth-topbar">
          <Link to="/" className="back-link">
            <i className="fa-solid fa-arrow-left"></i>
            {t('goHome')}
          </Link>
          <button
            type="button"
            className="lang-pill"
            onClick={() => changeLanguage(lang === 'en' ? 'bn' : 'en')}
            aria-label={t('changeLanguage')}
          >
            {lang === 'en' ? 'বাংলা' : 'EN'}
          </button>
        </div>

        <div className="auth-card">
          <Link to="/" className="logo auth-mobile-logo">
            <span className="logo-mark">
              <i className="fa-solid fa-heart-pulse"></i>
            </span>
            <span>{t('appName')}</span>
          </Link>
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;