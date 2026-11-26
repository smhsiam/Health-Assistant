import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import useInView from '../hooks/useInView';
import AnimatedText from './AnimatedText';
import Reveal from './Reveal';

const slides = [
  { src: '/images/report-reading.jpg', icon: 'fa-file-lines', label: 'stImg1' },
  { src: '/images/lab-tubes.jpg', icon: 'fa-vial', label: 'stImg2' },
  { src: '/images/family-care.jpg', icon: 'fa-users', label: 'stImg3' },
  { src: '/images/soft-wellness.jpg', icon: 'fa-leaf', label: 'stImg4' },
];

function StorySection() {
  const { t } = useLanguage();
  const [ref, shown] = useInView(0.2);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visited, setVisited] = useState([0]);

  const go = (target) => {
    const next = (target + slides.length) % slides.length;
    setIndex(next);
    setVisited((current) =>
      current.includes(next) ? current : [...current, next]
    );
  };

  useEffect(() => {
    if (!shown) {
      return undefined;
    }

    const preload = new Image();
    preload.src = slides[(index + 1) % slides.length].src;

    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || paused) {
      return undefined;
    }

    const timer = setTimeout(() => go(index + 1), 5000);

    return () => clearTimeout(timer);
  }, [index, paused, shown]);

  return (
    <section className="st" ref={ref}>
      <div className="container st-grid">
        <div className="st-copy">
          <span className="st-kicker">{t('stKicker')}</span>
          <AnimatedText
            text={t('stTitle')}
            center={false}
            className="st-title"
          />
          <Reveal delay={150}>
            <p>{t('stP1')}</p>
          </Reveal>
          <Reveal delay={300}>
            <p>{t('stP2')}</p>
          </Reveal>
          <Reveal delay={450}>
            <p>{t('stP3')}</p>
          </Reveal>
        </div>

        <div
          className="st-stage"
          role="group"
          aria-roledescription="carousel"
          aria-label={t('stKicker')}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {slides.map(
            (slide, i) =>
              visited.includes(i) && (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt=""
                  className={`st-img ${i === index ? 'on' : ''}`}
                  loading="lazy"
                  decoding="async"
                />
              )
          )}

          <button
            type="button"
            className="st-arrow st-prev"
            onClick={() => go(index - 1)}
            aria-label={t('prevSlide')}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            type="button"
            className="st-arrow st-next"
            onClick={() => go(index + 1)}
            aria-label={t('nextSlide')}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          <span className="st-tag">
            <i className={`fa-solid ${slides[index].icon}`}></i>
            {t(slides[index].label)}
          </span>
          <span className="st-badge">
            <i className="fa-solid fa-shield-heart"></i>
            {t('stBadge')}
          </span>
        </div>
      </div>
    </section>
  );
}

export default StorySection;