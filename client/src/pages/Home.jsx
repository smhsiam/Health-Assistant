import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const slides = [
  { icon: 'fa-file-arrow-up', title: 'slide1Title', text: 'slide1Text' },
  { icon: 'fa-language', title: 'slide2Title', text: 'slide2Text' },
  { icon: 'fa-chart-line', title: 'slide3Title', text: 'slide3Text' },
];

const stats = [
  { end: 2, suffix: '', label: 'statLanguages' },
  { end: 7, suffix: '', label: 'statCategories' },
  { end: 100, suffix: '%', label: 'statRules' },
  { end: 3, suffix: '', label: 'statPromises' },
];

const steps = [
  { icon: 'fa-cloud-arrow-up', title: 'step1Title', text: 'step1Text' },
  { icon: 'fa-eye', title: 'step2Title', text: 'step2Text' },
  { icon: 'fa-scale-balanced', title: 'step3Title', text: 'step3Text' },
  { icon: 'fa-comment-medical', title: 'step4Title', text: 'step4Text' },
];

const safety = [
  { icon: 'fa-ban', title: 'noDiagnosis', text: 'safe1Text' },
  { icon: 'fa-pills', title: 'noMedicine', text: 'safe2Text' },
  { icon: 'fa-user-doctor', title: 'consultDoctor', text: 'safe3Text' },
];

const sampleRows = [
  { name: 'Hemoglobin', value: '12.4 g/dL', flag: 'normal' },
  { name: 'Fasting Glucose', value: '128 mg/dL', flag: 'high' },
  { name: 'Total Cholesterol', value: '176 mg/dL', flag: 'normal' },
  { name: 'Vitamin D', value: '18 ng/mL', flag: 'low' },
];

const flagIcons = {
  normal: 'fa-check',
  high: 'fa-arrow-up',
  low: 'fa-arrow-down',
};

const flagKeys = {
  normal: 'flagNormal',
  high: 'flagHigh',
  low: 'flagLow',
};

function Counter({ end, suffix }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    let timer;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      let current = 0;
      const step = Math.max(1, Math.ceil(end / 40));

      timer = setInterval(() => {
        current += step;
        if (current >= end) {
          current = end;
          clearInterval(timer);
        }
        setValue(current);
      }, 30);
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [end]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

function Home() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [index]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  const goPrev = () => setIndex((index - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((index + 1) % slides.length);

  return (
    <div className="container landing">
      <section className="hero-box">
        <div className="hero-content fade-up">
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            {t('heroBadge')}
          </div>
          <h1 className="hero-title">
            {t('heroLine1')}{' '}
            <span className="gradient-text">{t('heroLine2')}</span>
          </h1>
          <p className="hero-text">{t('heroText')}</p>

          <div className="hero-buttons">
            <Link to="/upload" className="btn-navy">
              <i className="fa-solid fa-file-arrow-up"></i>
              {t('startUpload')}
            </Link>
            <Link to="/register" className="btn-outline">
              {t('register')}
            </Link>
          </div>

          <div className="hero-chips">
            <span className="chip">
              <i className="fa-solid fa-language"></i>
              {t('chipLang')}
            </span>
            <span className="chip">
              <i className="fa-solid fa-scale-balanced"></i>
              {t('chipRules')}
            </span>
            <span className="chip">
              <i className="fa-solid fa-file-lines"></i>
              {t('chipOriginal')}
            </span>
          </div>
        </div>

        <div className="hero-visual fade-up-delay">
          <div className="hero-glow"></div>

          <div className="float-badge float-one">
            <i className="fa-solid fa-circle-check"></i>
            {t('floatChecked')}
          </div>

          <div className="phone">
            <div className="phone-notch"></div>
            <div className="phone-screen">
              <div className="phone-head">
                <h4>{t('phoneTitle')}</h4>
                <span className="phone-sample">{t('phoneSample')}</span>
              </div>

              {sampleRows.map((row) => (
                <div className="phone-row" key={row.name}>
                  <div>
                    <strong>{row.name}</strong>
                    <small>{row.value}</small>
                  </div>
                  <span className={`badge badge-${row.flag}`}>
                    <i className={`fa-solid ${flagIcons[row.flag]}`}></i>
                    {t(flagKeys[row.flag])}
                  </span>
                </div>
              ))}

              <div className="phone-note">{t('phoneExplain')}</div>
            </div>
          </div>

          <div className="float-badge float-two">
            <i className="fa-solid fa-triangle-exclamation"></i>
            {t('floatAttention')}
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="section-head">
          <h2>{t('slidesTitle')}</h2>
          <p>{t('slidesSub')}</p>
        </div>

        <div className="slider">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, i) => (
              <div className="slide" key={slide.title} aria-hidden={i !== index}>
                <div>
                  <div className="slide-step">0{i + 1}</div>
                  <h3>{t(slide.title)}</h3>
                  <p>{t(slide.text)}</p>
                </div>
                <div className="slide-visual">
                  <div className="slide-icon">
                    <i className={`fa-solid ${slide.icon}`}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="slider-controls">
            <button
              type="button"
              className="slider-btn"
              onClick={goPrev}
              aria-label={t('prevSlide')}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="dots">
              {slides.map((slide, i) => (
                <button
                  type="button"
                  key={slide.title}
                  className={`dot ${i === index ? 'active' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`${i + 1}`}
                ></button>
              ))}
            </div>
            <button
              type="button"
              className="slider-btn"
              onClick={goNext}
              aria-label={t('nextSlide')}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="stats">
          {stats.map((item, i) => (
            <div
              className="stat reveal"
              key={item.label}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="stat-number">
                <Counter end={item.end} suffix={item.suffix} />
              </div>
              <p>{t(item.label)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head reveal">
          <h2>{t('howTitle')}</h2>
          <p>{t('howSub')}</p>
        </div>

        <div className="steps">
          {steps.map((step, i) => (
            <div
              className="card card-lift step reveal"
              key={step.title}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span className="step-number">0{i + 1}</span>
              <div className="step-icon">
                <i className={`fa-solid ${step.icon}`}></i>
              </div>
              <h3>{t(step.title)}</h3>
              <p>{t(step.text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head reveal">
          <h2>{t('safetyTitle')}</h2>
          <p>{t('safetySub')}</p>
        </div>

        <div className="safety-grid">
          {safety.map((item, i) => (
            <div
              className="card card-lift safety-card reveal"
              key={item.title}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="safety-icon">
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <h3>{t(item.title)}</h3>
              <p>{t(item.text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta reveal">
        <h2>{t('ctaTitle')}</h2>
        <p>{t('ctaText')}</p>
        <div className="cta-buttons">
          <Link to="/register" className="btn-white">
            {t('register')}
          </Link>
          <Link to="/upload" className="btn-ghost-light">
            {t('startUpload')}
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;