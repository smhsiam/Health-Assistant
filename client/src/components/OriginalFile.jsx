import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

function OriginalFile({ path }) {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [kind, setKind] = useState('pdf');
  const [state, setState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    setState('loading');

    api
      .get(path, { responseType: 'blob' })
      .then((response) => {
        if (cancelled) {
          return;
        }

        const type = response.data.type || '';
        objectUrl = URL.createObjectURL(response.data);
        setKind(type.startsWith('image/') ? 'image' : 'pdf');
        setUrl(objectUrl);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setState('error');
        }
      });

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [path]);

  if (state === 'loading') {
    return (
      <aside className="orig-panel">
        <div className="skeleton skeleton-block"></div>
      </aside>
    );
  }

  if (state === 'error') {
    return (
      <aside className="orig-panel">
        <p className="hint">{t('ogError')}</p>
      </aside>
    );
  }

  return (
    <aside className="orig-panel" aria-label={t('ogTitle')}>
      <div className="orig-head">
        <h3>{t('ogTitle')}</h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="dbd-link"
        >
          {t('ogOpen')}
        </a>
      </div>
      <p className="hint">{t('ogHint')}</p>
      {kind === 'image' ? (
        <img className="orig-img" src={url} alt={t('ogAlt')} />
      ) : (
        <iframe className="orig-frame" src={url} title={t('ogTitle')}></iframe>
      )}
    </aside>
  );
}

export default OriginalFile;