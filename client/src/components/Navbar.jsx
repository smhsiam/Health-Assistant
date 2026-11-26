import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AnimatedLogo from './AnimatedLogo';

const patientLinks = [
  { to: '/dashboard', label: 'dbNav' },
  { to: '/upload', label: 'upload' },
  { to: '/history', label: 'history' },
  { to: '/trends', label: 'trends' },
  { to: '/doctors', label: 'tmNavDoctors' },
  { to: '/consultations', label: 'tcNavConsult' },
];

const adminLinks = [
  { to: '/admin/doctors', label: 'tmNavVerify' },
  { to: '/dashboard', label: 'dbNav' },
  { to: '/doctors', label: 'tmNavDoctors' },
  { to: '/consultations', label: 'tcNavConsult' },
  { to: '/upload', label: 'upload' },
  { to: '/history', label: 'history' },
  { to: '/trends', label: 'trends' },
];

const doctorLinks = [
  { to: '/doctor/shared', label: 'tsNavShared' },
  { to: '/consultations', label: 'tcNavConsult' },
  { to: '/doctor/profile', label: 'tmNavMyProfile' },
];

const linksFor = (role) => {
  if (role === 'doctor') {
    return doctorLinks;
  }

  if (role === 'admin') {
    return adminLinks;
  }

  return patientLinks;
};

const chipTarget = (role) => {
  if (role === 'doctor') {
    return '/doctor/profile';
  }

  if (role === 'admin') {
    return '/admin/doctors';
  }

  return '/profiles';
};

function Navbar() {
  const { lang, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const role = user ? user.role || 'patient' : null;
  const menu = linksFor(role);

  const closeMenu = () => setOpen(false);
  const linkClass = ({ isActive }) => (isActive ? 'active' : '');

  const handleLogout = () => {
    logout();
    closeMenu();
    showToast(t('loggedOut'), 'success');
    navigate('/');
  };

  return (
    <header className="site-header">
      <nav className="navbar">
        <div className="container navbar-inner">
          <AnimatedLogo />

          <div className={`nav-links ${open ? 'open' : ''}`}>
            <NavLink to="/" end className={linkClass} onClick={closeMenu}>
              {t('home')}
            </NavLink>
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={closeMenu}
              >
                {t(item.label)}
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            <button
              type="button"
              className="lang-pill"
              onClick={() => changeLanguage(lang === 'en' ? 'bn' : 'en')}
              aria-label={t('changeLanguage')}
            >
              {lang === 'en' ? 'বাংলা' : 'EN'}
            </button>

            {user ? (
              <>
                <Link
                  to={chipTarget(role)}
                  className="user-chip"
                  aria-label={t('profilesTitle')}
                >
                  <i className="fa-solid fa-user"></i>
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  type="button"
                  className="btn-signin"
                  onClick={handleLogout}
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-signin">
                {t('login')}
              </Link>
            )}

            <button
              type="button"
              className="icon-btn menu-btn"
              onClick={() => setOpen(!open)}
              aria-label={t('menu')}
              aria-expanded={open}
            >
              <i className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}></i>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;