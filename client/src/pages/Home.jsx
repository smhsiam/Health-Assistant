import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SLIDE_MS = 6500;

const banners = [
  { id: 1, theme: 'theme-1', visual: 'upload' },
  { id: 2, theme: 'theme-2', visual: 'language' },
  { id: 3, theme: 'theme-3', visual: 'rules' },
  { id: 4, theme: 'theme-4', visual: 'trend' },
  { id: 5, theme: 'theme-5', visual: 'safety' },
];

const services = [
  { id: 1, icon: 'fa-file-arrow-up', to: '/upload' },
  { id: 2, icon: 'fa-language', to: '/upload' },
  { id: 3, icon: 'fa-scale-balanced', to: '/upload' },
  { id: 4, icon: 'fa-triangle-exclamation', to: '/history' },
  { id: 5, icon: 'fa-chart-line', to: '/trends' },
  { id: 6, icon: 'fa-file-medical', to: '/history' },
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

function Decor() {
  return (
    <>
      <svg
        className="banner-wave"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,200 C240,100 480,300 720,200 C960,100 1200,260 1440,170" />
        <path d="M0,230 C260,140 500,320 740,230 C980,140 1220,290 1440,210" />
        <path d="M0,260 C280,180 520,330 760,260 C1000,190 1240,310 1440,250" />
      </svg>
      <i className="fa-solid fa-plus banner-plus plus-a"></i>
      <i className="fa-solid fa-plus banner-plus plus-b"></i>
      <i className="fa-solid fa-plus banner-plus plus-c"></i>
      <i className="fa-solid fa-plus banner-plus plus-d"></i>
    </>
  );
}

function BannerVisual({ type, t }) {
  if (type === 'upload') {
    return (
      <div className="device device-tablet">
        <div className="device-bar">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="drop-zone">
          <div className="drop-icon">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <strong>{t('visDrop')}</strong>
          <small>{t('visFormats')}</small>
        </div>
        <div className="file-row">
          <i className="fa-solid fa-file-lines"></i>
          <div className="file-info">
            <span>blood-test.pdf</span>
            <div className="file-progress">
              <span></span>
            </div>
          </div>
          <em>
            <i className="fa-solid fa-circle-check"></i> {t('visReady')}
          </em>
        </div>
      </div>
    );
  }

  if (type === 'language') {
    return (
      <div className="device device-phone">
        <div className="device-notch"></div>
        <div className="chat">
          <span className="device-tag">{t('phoneSample')}</span>
          <div className="bubble bubble-en">
            <b>English</b>
            <p>Your hemoglobin is within the usual range.</p>
          </div>
          <div className="bubble bubble-bn">
            <b>বাংলা</b>
            <p>আপনার হিমোগ্লোবিন স্বাভাবিক সীমার মধ্যে আছে।</p>
          </div>
          <div className="bubble bubble-note">
            <i className="fa-solid fa-user-doctor"></i>
            <p>{t('consultDoctor')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'rules') {
    return (
      <div className="device device-tablet">
        <div className="device-bar">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="range-head">
          <strong>Fasting Glucose</strong>
          <span className="badge badge-high">
            <i className="fa-solid fa-arrow-up"></i>
            {t('flagHigh')}
          </span>
        </div>
        <div className="range-scale">
          <div className="range-marker">
            <span>128</span>
          </div>
        </div>
        <div className="range-ticks">
          <span style={{ left: '35%' }}>70</span>
          <span style={{ left: '50%' }}>100</span>
        </div>
        <div className="range-labels">
          <small>{t('visRange')}</small>
          <small>{t('visYourValue')}: 128 mg/dL</small>
        </div>
        <div className="range-foot">
          <i className="fa-solid fa-scale-balanced"></i>
          {t('visByCode')}
        </div>
      </div>
    );
  }

  if (type === 'trend') {
    return (
      <div className="device device-tablet">
        <div className="device-bar">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="trend-head">
          <strong>HbA1c</strong>
          <span className="badge badge-high">
            <i className="fa-solid fa-arrow-trend-up"></i>
            {t('visTrendNote')}
          </span>
        </div>
        <svg className="trend-svg" viewBox="0 0 300 120" aria-hidden="true">
          <polygon
            className="trend-area"
            points="10,95 150,70 290,30 290,115 10,115"
          />
          <polyline className="trend-line" points="10,95 150,70 290,30" />
          <circle cx="10" cy="95" r="5" />
          <circle cx="150" cy="70" r="5" />
          <circle cx="290" cy="30" r="5" />
        </svg>
        <div className="trend-labels">
          <small>5.6</small>
          <small>6.1</small>
          <small>6.8</small>
        </div>
      </div>
    );
  }

  return (
    <div className="device device-phone">
      <div className="device-notch"></div>
      <div className="safe-list">
        <div className="safe-shield">
          <i className="fa-solid fa-shield-heart"></i>
        </div>
        {['noDiagnosis', 'noMedicine', 'consultDoctor'].map((key) => (
          <div className="safe-row" key={key}>
            <i className="fa-solid fa-circle-check"></i>
            {t(key)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Home() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);

  const goPrev = () =>
    setIndex((current) => (current - 1 + banners.length) % banners.length);
  const goNext = () => setIndex((current) => (current + 1) % banners.length);

  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, SLIDE_MS);

    return () => clearTimeout(timer);
  }, [index, paused]);

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

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStart.current !== null) {
      const diff = e.changedTouches[0].clientX - touchStart.current;
      touchStart.current = null;
      if (diff > 50) goPrev();
      if (diff < -50) goNext();
    }
    setPaused(false);
  };

  return (
    <>
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
      </div>

      <section
        className="banner"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-roledescription="carousel"
      >
        <div className="banner-stage">
          {banners.map((item, i) => (
            <div
              key={item.id}
              className={`banner-slide ${item.theme} ${i === index ? 'active' : ''}`}
              aria-hidden={i !== index}
            >
              <Decor />
              <div className="container banner-inner">
                <div className="banner-copy">
                  <span className="banner-kicker">{t(`bannerKick${item.id}`)}</span>
                  <h2 className="banner-title">{t(`bannerTitle${item.id}`)}</h2>
                  <p className="banner-text">{t(`bannerText${item.id}`)}</p>
                  <div className="banner-buttons">
                    <Link to="/upload" className="btn-white">
                      {t('startUpload')}
                    </Link>
                    <Link to="/register" className="btn-ghost-light">
                      {t('register')}
                    </Link>
                  </div>
                </div>
                <div className="banner-visual">
                  <BannerVisual type={item.visual} t={t} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="banner-arrow arrow-prev"
          onClick={goPrev}
          aria-label={t('prevSlide')}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          type="button"
          className="banner-arrow arrow-next"
          onClick={goNext}
          aria-label={t('nextSlide')}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>

        <div className="banner-dots">
          {banners.map((item, i) => (
            <button
              type="button"
              key={item.id}
              className={`banner-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}`}
              aria-current={i === index}
            ></button>
          ))}
        </div>

        <div className="banner-progress">
          <span
            key={`${index}-${paused ? 'paused' : 'running'}`}
            className={`bar-fill ${paused ? 'idle' : 'run'}`}
          ></span>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div className="section-head reveal">
            <h2>{t('svcTitle')}</h2>
            <p>{t('svcSub')}</p>
          </div>

          <div className="svc-grid">
            {services.map((item, i) => (
              <div
                className="svc-item reveal"
                key={item.id}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <Link
                  to={item.to}
                  className={`svc-card ${item.id === 1 ? 'featured' : ''}`}
                >
                  <span className="svc-icon">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </span>
                  <h3>{t(`svc${item.id}Title`)}</h3>
                  <p>{t(`svc${item.id}Text`)}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container landing-rest">
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
    </>
  );
}

export default Home;