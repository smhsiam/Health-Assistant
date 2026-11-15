import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const categoryOrder = ['blood', 'sugar', 'lipid', 'liver', 'kidney', 'thyroid'];

const categoryKeys = {
  blood: 'catBlood',
  sugar: 'catSugar',
  lipid: 'catLipid',
  liver: 'catLiver',
  kidney: 'catKidney',
  thyroid: 'catThyroid',
};

const fill = (text, values) =>
  Object.keys(values).reduce(
    (out, key) => out.replace(`{${key}}`, values[key]),
    text
  );

const readView = () => {
  try {
    return localStorage.getItem('reportView') === 'list' ? 'list' : 'grid';
  } catch (error) {
    return 'grid';
  }
};

const saveView = (value) => {
  try {
    localStorage.setItem('reportView', value);
  } catch (error) {
    return;
  }
};

function History() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';

  const [profiles, setProfiles] = useState([]);
  const [profileId, setProfileId] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [onlyAttention, setOnlyAttention] = useState(false);
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState(readView);

  useEffect(() => {
    api
      .get('/profiles')
      .then((response) => setProfiles(response.data.profiles))
      .catch(() => setProfiles([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    const params = profileId === 'all' ? {} : { profileId };

    api
      .get('/reports', { params })
      .then((response) => {
        if (!cancelled) {
          setReports(response.data.reports);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profileId, attempt]);

  const setQuery = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set('q', value);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  };

  const setCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete('category');
    } else {
      next.set('category', value);
    }
    setSearchParams(next, { replace: true });
  };

  const changeView = (value) => {
    setView(value);
    saveView(value);
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
    setOnlyAttention(false);
  };

  const profileNames = {};
  profiles.forEach((profile) => {
    profileNames[profile.id] = profile.name;
  });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const list = reports.filter((report) => {
      if (category !== 'all' && !report.categories.includes(category)) {
        return false;
      }

      if (onlyAttention && report.abnormalCount === 0 && !report.hasCritical) {
        return false;
      }

      if (needle) {
        const text = [report.fileName, report.reportDate || '']
          .concat(report.testNames)
          .join(' ')
          .toLowerCase();

        if (!text.includes(needle)) {
          return false;
        }
      }

      return true;
    });

    return sort === 'oldest' ? [...list].reverse() : list;
  }, [reports, query, category, onlyAttention, sort]);

  const hasFilters = query.trim() !== '' || category !== 'all' || onlyAttention;
  const showProfile = profiles.length > 1 && profileId === 'all';
  const layoutClass = view === 'list' ? 'report-list' : 'report-grid';

  const dateText = (report) =>
    report.reportDate
      ? report.reportDate
      : `${t('uploadedOn')} ${new Date(report.createdAt).toLocaleDateString('en-GB')}`;

  return (
    <div className="container page">
      <h1 className="page-title">{t('historyTitle')}</h1>
      <p className="page-subtitle">{t('historySub')}</p>

      <div className="history-tools">
        <div className="history-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
          />
        </div>

        <div className="tool-group">
          {profiles.length > 1 && (
            <select
              className="tool-select"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              aria-label={t('profileFilter')}
            >
              <option value="all">{t('allProfiles')}</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          )}

          <select
            className="tool-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label={t('sortLabel')}
          >
            <option value="newest">{t('sortNewest')}</option>
            <option value="oldest">{t('sortOldest')}</option>
          </select>

          <div className="view-toggle">
            <button
              type="button"
              className={view === 'grid' ? 'active' : ''}
              onClick={() => changeView('grid')}
              aria-label={t('viewGrid')}
              aria-pressed={view === 'grid'}
            >
              <i className="fa-solid fa-table-cells-large"></i>
            </button>
            <button
              type="button"
              className={view === 'list' ? 'active' : ''}
              onClick={() => changeView('list')}
              aria-label={t('viewList')}
              aria-pressed={view === 'list'}
            >
              <i className="fa-solid fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="chip-row">
        <button
          type="button"
          className={`filter-chip ${category === 'all' ? 'active' : ''}`}
          onClick={() => setCategory('all')}
          aria-pressed={category === 'all'}
        >
          {t('filterAll')}
        </button>
        {categoryOrder.map((item) => (
          <button
            type="button"
            key={item}
            className={`filter-chip ${category === item ? 'active' : ''}`}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
          >
            {t(categoryKeys[item])}
          </button>
        ))}
      </div>

      <label className="check attention-check">
        <input
          type="checkbox"
          checked={onlyAttention}
          onChange={(e) => setOnlyAttention(e.target.checked)}
        />
        {t('onlyAttention')}
      </label>

      {loading && (
        <div className={layoutClass}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div className="card report-card" key={n}>
              <div className="skeleton skeleton-line" style={{ width: '40%' }}></div>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-line"></div>
              <div className="skeleton skeleton-line" style={{ width: '70%' }}></div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <i className="fa-solid fa-cloud-exclamation empty-icon"></i>
          <h3>{t('listLoadFailed')}</h3>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setAttempt(attempt + 1)}
          >
            {t('tryAgain')}
          </button>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="empty-state">
          <i className="fa-solid fa-folder-open empty-icon"></i>
          <h3>{t('noReportsTitle')}</h3>
          <p>{t('noReportsText')}</p>
          <Link to="/upload" className="btn-primary">
            <i className="fa-solid fa-file-arrow-up"></i>
            {t('startUpload')}
          </Link>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <>
          <p className="result-count">
            {fill(t('showing'), { n: visible.length, total: reports.length })}
          </p>

          {visible.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-magnifying-glass empty-icon"></i>
              <h3>{t('noMatchTitle')}</h3>
              <p>{t('noMatchText')}</p>
              {hasFilters && (
                <button type="button" className="btn-outline" onClick={clearFilters}>
                  {t('clearFilters')}
                </button>
              )}
            </div>
          ) : (
            <div className={layoutClass}>
              {visible.map((report) => (
                <Link
                  to={`/reports/${report.id}`}
                  className={`report-card card-lift ${report.hasCritical ? 'critical' : ''}`}
                  key={report.id}
                >
                  <div className="report-top">
                    <span className="report-date">
                      <i className="fa-regular fa-calendar"></i>
                      {dateText(report)}
                    </span>
                    {showProfile && (
                      <span className="report-owner">{profileNames[report.profileId]}</span>
                    )}
                  </div>

                  <h3>{report.fileName}</h3>
                  <p className="report-meta">
                    {fill(t('cardTests'), { n: report.valueCount })}
                  </p>

                  <div className="report-badges">
                    {report.hasCritical && (
                      <span className="badge badge-critical">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        {t('flagUrgent')}
                      </span>
                    )}
                    {report.abnormalCount > 0 && (
                      <span className="badge badge-high">
                        <i className="fa-solid fa-arrow-up-right-dots"></i>
                        {report.abnormalCount} {t('summaryAttention')}
                      </span>
                    )}
                    {report.reviewCount > 0 && (
                      <span className="badge badge-review">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        {report.reviewCount} {t('summaryVerify')}
                      </span>
                    )}
                    {!report.hasCritical &&
                      report.abnormalCount === 0 &&
                      report.reviewCount === 0 && (
                        <span className="badge badge-normal">
                          <i className="fa-solid fa-check"></i>
                          {t('allInRange')}
                        </span>
                      )}
                  </div>

                  <div className="report-cats">
                    {report.categories.map((item) => (
                      <span className="mini-chip" key={item}>
                        {t(categoryKeys[item])}
                      </span>
                    ))}
                  </div>

                  <span className="report-open">
                    {t('openReport')} <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default History;