import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>
            <i className="fa-solid fa-heart-pulse"></i> {t('appName')}
          </h4>
          <p>{t('footerAbout')}</p>
        </div>

        <div>
          <h4>{t('quickLinks')}</h4>
          <ul>
            <li>
              <Link to="/">{t('home')}</Link>
            </li>
            <li>
              <Link to="/upload">{t('upload')}</Link>
            </li>
            <li>
              <Link to="/history">{t('history')}</Link>
            </li>
            <li>
              <Link to="/trends">{t('trends')}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>{t('safety')}</h4>
          <ul>
            <li>{t('noDiagnosis')}</li>
            <li>{t('noMedicine')}</li>
            <li>{t('consultDoctor')}</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>{t('disclaimer')}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;