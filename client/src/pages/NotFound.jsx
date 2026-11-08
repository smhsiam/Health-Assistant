import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function NotFound() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const text = query.trim();
    navigate(text ? `/history?q=${encodeURIComponent(text)}` : '/history');
  };

  return (
    <div className="container notfound">
      <div className="notfound-code">404</div>
      <i className="fa-solid fa-circle-question float notfound-icon"></i>
      <h2>{t('notFoundTitle')}</h2>
      <p>{t('notFoundText')}</p>

      <form className="notfound-search" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
        />
        <button type="submit" className="btn-primary">
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </form>

      <div className="notfound-links">
        <Link to="/" className="btn-primary">
          {t('goHome')}
        </Link>
        <Link to="/upload" className="btn-outline">
          {t('upload')}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;