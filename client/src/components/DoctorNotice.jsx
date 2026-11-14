import { useLanguage } from '../context/LanguageContext';

function DoctorNotice() {
  const { t } = useLanguage();

  return (
    <div className="doctor-notice">
      <i className="fa-solid fa-user-doctor"></i>
      <p>{t('doctorNotice')}</p>
    </div>
  );
}

export default DoctorNotice;