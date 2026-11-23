import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const specialties = [
  { key: 'fxSpec1', query: 'Medicine' },
  { key: 'fxSpec2', query: 'Endocrin' },
  { key: 'fxSpec3', query: 'Cardio' },
  { key: 'fxSpec4', query: 'Nephro' },
  { key: 'fxSpec5', query: 'Gastro' },
  { key: 'fxSpec6', query: 'Hemato' },
  { key: 'fxSpec7', query: 'Pediatric' },
  { key: 'fxSpec8', query: 'Gyn' },
  { key: 'fxSpec9', query: 'Neuro' },
  { key: 'fxSpec10', query: 'Pulmo' },
  { key: 'fxSpec11', query: 'Dermato' },
  { key: 'fxSpec12', query: 'Ortho' },
];

const careLinks = [
  { to: '/doctors', label: 'fxFindDoctor', roles: ['guest', 'patient', 'admin'] },
  { to: '/consultations', label: 'tcNavConsult', roles: ['patient', 'doctor', 'admin'] },
  { to: '/upload', label: 'upload', roles: ['guest', 'patient', 'admin'] },
  { to: '/history', label: 'history', roles: ['guest', 'patient', 'admin'] },
  { to: '/trends', label: 'trends', roles: ['guest', 'patient', 'admin'] },
  { to: '/profiles', label: 'profilesTitle', roles: ['patient', 'admin'] },
  { to: '/doctor/shared', label: 'tsNavShared', roles: ['doctor'] },
  { to: '/doctor/profile', label: 'tmNavMyProfile', roles: ['doctor'] },
  { to: '/admin/doctors', label: 'tmNavVerify', roles: ['admin'] },
  { to: '/register-doctor', label: 'imDoctor', roles: ['guest'] },
];

function Footer() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const role = user ? user.role || 'patient' : 'guest';
  const showSpecialties = role !== 'doctor';
  const visibleLinks = careLinks.filter((item) => item.roles.includes(role));

  const scrollTop = () => {
    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <footer className="fx-wrap">
      <div
        className={`container fx-main ${showSpecialties ? '' : 'fx-main-3'}`}
      >
        <div>
          <p className="fx-brand">Health Assistant</p>
          <p className="fx-tag">{t('fxTagline')}</p>
        </div>

        {showSpecialties && (
          <nav aria-label={t('fxDepartments')}>
            <h3 className="fx-title">{t('fxDepartments')}</h3>
            <ul className="fx-list fx-two">
              {specialties.map((item) => (
                <li key={item.key}>
                  <Link
                    to={`/doctors?specialty=${encodeURIComponent(item.query)}`}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <nav aria-label={t('fxPatientCare')}>
          <h3 className="fx-title">{t('fxPatientCare')}</h3>
          <ul className="fx-list">
            {visibleLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{t(item.label)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="fx-title">{t('fxContact')}</h3>
          <ul className="fx-contact">
            <li>
              <i className="fa-solid fa-phone"></i>
              <a href="tel:999">{t('ftEmergency')}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="fx-bottom">
        <div className="container fx-bottom-inner">
          <div>
            <p className="fx-small">
              &copy; {new Date().getFullYear()} Health Assistant. {t('ftRights')}
            </p>
            <p className="fx-small">{t('ftNotSubstitute')}</p>
          </div>
          <button
            type="button"
            className="fx-up"
            onClick={scrollTop}
            aria-label={t('ftBack')}
          >
            <i className="fa-solid fa-angles-up"></i>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;