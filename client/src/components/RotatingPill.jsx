import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const messages = [
  { icon: 'fa-language', key: 'rpMsg1' },
  { icon: 'fa-scale-balanced', key: 'rpMsg2' },
  { icon: 'fa-user-doctor', key: 'rpMsg3' },
];

function RotatingPill() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      return undefined;
    }

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 3400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rp">
      <span key={index} className="rp-shine" aria-hidden="true"></span>
      <span className="pulse-dot" aria-hidden="true"></span>
      <div className="rp-track">
        {messages.map((item, i) => (
          <span
            key={item.key}
            className={`rp-msg ${i === index ? 'on' : ''}`}
            aria-hidden={i !== index}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            {t(item.key)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default RotatingPill;