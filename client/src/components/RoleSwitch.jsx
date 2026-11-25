import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const options = [
  {
    key: 'patient',
    to: '/register',
    icon: 'fa-user',
    title: 'rsPatient',
    text: 'rsPatientText',
  },
  {
    key: 'doctor',
    to: '/register-doctor',
    icon: 'fa-user-doctor',
    title: 'rsDoctor',
    text: 'rsDoctorText',
  },
];

function RoleSwitch({ active }) {
  const { t } = useLanguage();

  return (
    <div className="rs" role="group" aria-label={t('rsLabel')}>
      {options.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          replace
          className={`rs-opt ${active === item.key ? 'on' : ''}`}
          aria-current={active === item.key ? 'page' : undefined}
        >
          <i className={`fa-solid ${item.icon}`}></i>
          <strong>{t(item.title)}</strong>
          <small>{t(item.text)}</small>
        </Link>
      ))}
    </div>
  );
}

export default RoleSwitch;