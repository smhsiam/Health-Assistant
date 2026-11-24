import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AnimatedText from './AnimatedText';

const items = [
  { key: 'blood', icon: 'fa-droplet', count: 4 },
  { key: 'kidney', icon: 'fa-filter', count: 4 },
  { key: 'lipid', icon: 'fa-heart-pulse', count: 4 },
  { key: 'liver', icon: 'fa-vial', count: 3 },
  { key: 'sugar', icon: 'fa-cube', count: 2 },
  { key: 'thyroid', icon: 'fa-bolt', count: 1 },
];

const sets = [items.slice(0, 3), items.slice(3, 6)];

function CategoryCards() {
  const { t } = useLanguage();
  const [reduce] = useState(
    () =>
      Boolean(window.matchMedia) &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [setIndex, setSetIndex] = useState(0);
  const [out, setOut] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) {
      return undefined;
    }

    let swap;

    const timer = setTimeout(() => {
      setOut(true);
      swap = setTimeout(() => {
        setSetIndex((current) => (current + 1) % sets.length);
        setOut(false);
      }, 450);
    }, 5500);

    return () => {
      clearTimeout(timer);
      clearTimeout(swap);
      setOut(false);
    };
  }, [setIndex, paused, reduce]);

  const visible = reduce ? items : sets[setIndex];

  return (
    <section
      className="cc"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container">
        <AnimatedText text={t('ccTitle')} />
        <p className="cc-sub">{t('ccSub')}</p>

        <div className={`cc-row ${out ? 'cc-out' : ''}`}>
          {visible.map((item) => (
            <div className="cc-card" key={item.key} tabIndex={0}>
              <span className="cc-shine" aria-hidden="true"></span>
              <span className="cc-icon">
                <i className={`fa-solid ${item.icon}`}></i>
              </span>
              <h3>{t(`cc_${item.key}`)}</h3>
              <p>{t(`cc_${item.key}_text`)}</p>
              <small>
                {item.count} {t('ccTests')}
              </small>
            </div>
          ))}
        </div>

        {!reduce && (
          <div className="cc-dots">
            {sets.map((group, i) => (
              <button
                type="button"
                key={group[0].key}
                className={`cc-dot ${i === setIndex ? 'on' : ''}`}
                onClick={() => {
                  setOut(false);
                  setSetIndex(i);
                }}
                aria-label={`${i + 1}`}
                aria-current={i === setIndex}
              ></button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CategoryCards;