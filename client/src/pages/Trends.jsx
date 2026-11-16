import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import TrendChart from '../components/TrendChart';
import UrgencyBanner from '../components/UrgencyBanner';
import DoctorNotice from '../components/DoctorNotice';

const flagIcons = {
  normal: 'fa-check',
  high: 'fa-arrow-up',
  low: 'fa-arrow-down',
  unknown: 'fa-question',
};

const flagKeys = {
  normal: 'flagNormal',
  high: 'flagHigh',
  low: 'flagLow',
  unknown: 'flagUnknown',
};

const directionNames = {
  rising: 'Rising',
  falling: 'Falling',
  stable: 'Stable',
  mixed: 'Mixed',
};

const rangeKeys = {
  closer: 'trendCloser',
  further: 'trendFurther',
  within: 'trendWithin',
  same: 'trendSame',
};

const formatNumber = (number) => Number(number).toLocaleString('en-US');

const fill = (text, values) =>
  Object.keys(values).reduce(
    (out, key) => out.replace(`{${key}}`, values[key]),
    text
  );

const badgeClass = (flag) => `badge-${flag === 'unknown' ? 'review' : flag}`;

const buildLines = (detail, t) => {
  const analysis = detail.analysis;

  if (analysis.status !== 'ok') {
    return [];
  }

  const values = {
    test: detail.name,
    n: analysis.count,
    from: formatNumber(analysis.firstValue),
    to: formatNumber(analysis.lastValue),
  };

  const prefix = analysis.enoughForTrend ? 'trend' : 'trendTwo';
  const lines = [fill(t(`${prefix}${directionNames[analysis.direction]}`), values)];

  if (analysis.rangeMove) {
    lines.push(t(rangeKeys[analysis.rangeMove]));
  }

  return lines;
};

function TrendDetail({ detail }) {
  const { t } = useLanguage();
  const { analysis, points } = detail;
  const latest = points[points.length - 1];
  const lines = buildLines(detail, t);
  const hasBand = points.some(
    (point) => point.refLow !== null || point.refHigh !== null
  );

  return (
    <>
      <div className="trend-card">
        <UrgencyBanner message={detail.urgencyMessage} />

        <div className="trend-head">
          <div>
            <h2>{detail.name}</h2>
            <p className="trend-sub">
              {t('trendLatest')}: <b>{formatNumber(latest.value)}</b>{' '}
              {detail.unit || ''} ({latest.date})
            </p>
          </div>
          <span className={`badge ${badgeClass(latest.flag)}`}>
            <i className={`fa-solid ${flagIcons[latest.flag] || 'fa-question'}`}></i>
            {t(flagKeys[latest.flag] || 'flagUnknown')}
          </span>
        </div>

        {analysis.status === 'ok' && (
          <>
            <TrendChart
              points={points}
              unit={detail.unit}
              label={fill(t('trendChartLabel'), { test: detail.name })}
            />
            {hasBand && <p className="chart-note">{t('trendBandNote')}</p>}
          </>
        )}

        <div className="trend-notes">
          <h3>{t('trendNarrationTitle')}</h3>
          {analysis.status === 'ok' ? (
            lines.map((line) => <p key={line}>{line}</p>)
          ) : (
            <p>{fill(t('trendNeedMore'), { n: analysis.count })}</p>
          )}
          <p className="trend-doctor">{t('trendDoctorLine')}</p>
        </div>

        <table className="trend-table">
          <thead>
            <tr>
              <th>{t('colDate')}</th>
              <th>{t('colResult')}</th>
              <th>{t('colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {[...points].reverse().map((point) => (
              <tr key={point.id}>
                <td>{point.date}</td>
                <td>
                  <b>{formatNumber(point.value)}</b> <small>{point.unit || ''}</small>
                </td>
                <td>
                  <span className={`badge ${badgeClass(point.flag)}`}>
                    <i
                      className={`fa-solid ${flagIcons[point.flag] || 'fa-question'}`}
                    ></i>
                    {t(flagKeys[point.flag] || 'flagUnknown')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DoctorNotice />
    </>
  );
}

function Trends() {
  const { t } = useLanguage();

  const [profiles, setProfiles] = useState([]);
  const [profileId, setProfileId] = useState('');
  const [tests, setTests] = useState([]);
  const [testKey, setTestKey] = useState('');
  const [detail, setDetail] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    api
      .get('/profiles')
      .then((response) => {
        setProfiles(response.data.profiles);
        if (response.data.profiles.length > 0) {
          setProfileId(String(response.data.profiles[0].id));
        } else {
          setListLoading(false);
        }
      })
      .catch(() => {
        setError(true);
        setListLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!profileId) {
      return undefined;
    }

    let cancelled = false;

    setListLoading(true);
    setError(false);
    setDetail(null);

    api
      .get('/trends', { params: { profileId } })
      .then((response) => {
        if (cancelled) {
          return;
        }
        const list = response.data.tests;
        setTests(list);
        const pick = list.find((item) => item.count >= 3) || list[0];
        setTestKey(pick ? pick.key : '');
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setListLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profileId, attempt]);

  useEffect(() => {
    if (!profileId || !testKey) {
      setDetail(null);
      return undefined;
    }

    let cancelled = false;

    setDetailLoading(true);

    api
      .get(`/trends/${testKey}`, { params: { profileId } })
      .then((response) => {
        if (!cancelled) {
          setDetail(response.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profileId, testKey, attempt]);

  const labelFor = (item) => {
    const clash = tests.filter((other) => other.name === item.name).length > 1;
    const unit = clash && item.unit ? ` (${item.unit})` : '';
    return `${item.name}${unit} · ${item.count}`;
  };

  return (
    <div className="container page">
      <h1 className="page-title">{t('trendsTitle')}</h1>
      <p className="page-subtitle">{t('trendsSub')}</p>

      {profiles.length > 1 && (
        <div className="history-tools">
          <select
            className="tool-select"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            aria-label={t('profileFilter')}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="empty-state">
          <i className="fa-solid fa-triangle-exclamation empty-icon"></i>
          <h3>{t('trendLoadFailed')}</h3>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setAttempt(attempt + 1)}
          >
            {t('tryAgain')}
          </button>
        </div>
      )}

      {!error && listLoading && (
        <>
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-block"></div>
        </>
      )}

      {!error && !listLoading && tests.length === 0 && (
        <div className="empty-state">
          <i className="fa-solid fa-chart-line empty-icon"></i>
          <h3>{t('trendNoData')}</h3>
          <p>{t('trendNoDataText')}</p>
          <Link to="/upload" className="btn-primary">
            <i className="fa-solid fa-file-arrow-up"></i>
            {t('startUpload')}
          </Link>
        </div>
      )}

      {!error && !listLoading && tests.length > 0 && (
        <>
          <p className="result-count">{t('pickTest')}</p>
          <div className="chip-row">
            {tests.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`filter-chip ${testKey === item.key ? 'active' : ''}`}
                onClick={() => setTestKey(item.key)}
                aria-pressed={testKey === item.key}
              >
                {labelFor(item)}
              </button>
            ))}
          </div>

          {detailLoading && <div className="skeleton skeleton-block"></div>}
          {!detailLoading && detail && <TrendDetail detail={detail} />}
        </>
      )}
    </div>
  );
}

export default Trends;