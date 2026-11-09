import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Navbar() {
  const { lang, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

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
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-mark">
              <i className="fa-solid fa-heart-pulse"></i>
            </span>
            <span>{t('appName')}</span>
          </Link>

          <div className={`nav-links ${open ? 'open' : ''}`}>
            <NavLink to="/" end className={linkClass} onClick={closeMenu}>
              {t('home')}
            </NavLink>
            <NavLink to="/upload" className={linkClass} onClick={closeMenu}>
              {t('upload')}
            </NavLink>
            <NavLink to="/history" className={linkClass} onClick={closeMenu}>
              {t('history')}
            </NavLink>
            <NavLink to="/trends" className={linkClass} onClick={closeMenu}>
              {t('trends')}
            </NavLink>
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
                <span className="user-chip">
                  <i className="fa-solid fa-user"></i>
                  {user.name.split(' ')[0]}
                </span>
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