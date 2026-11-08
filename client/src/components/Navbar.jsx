import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function Navbar() {
  const { lang, changeLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);
  const linkClass = ({ isActive }) => (isActive ? 'active' : '');

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
            <Link to="/login" className="btn-signin">
              {t('login')}
            </Link>
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