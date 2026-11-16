import { useLanguage } from '../context/LanguageContext';
import ExplanationCard from './ExplanationCard';

const fill = (text, values) =>
  Object.keys(values).reduce(
    (out, key) => out.replace(`{${key}}`, values[key]),
    text
  );

function ExplanationSection({ values }) {
  const { t } = useLanguage();

  const needAttention = values.filter(
    (item) => item.flag !== 'normal' || item.isCritical
  );
  const inRange = values.filter(
    (item) => item.flag === 'normal' && !item.isCritical
  );

  return (
    <section className="expl-section">
      <h2>{t('explTitle')}</h2>
      <p className="hint">{t('explIntro')}</p>

      {needAttention.map((item) => (
        <ExplanationCard key={item.id} item={item} />
      ))}

      {inRange.length > 0 && (
        <details className="expl-normal">
          <summary>{fill(t('explNormalGroup'), { n: inRange.length })}</summary>
          {inRange.map((item) => (
            <ExplanationCard key={item.id} item={item} />
          ))}
        </details>
      )}
    </section>
  );
}

export default ExplanationSection;