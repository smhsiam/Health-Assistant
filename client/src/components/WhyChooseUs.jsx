import { useLanguage } from '../context/LanguageContext';
import AnimatedText from './AnimatedText';
import Reveal from './Reveal';

function WhyChooseUs() {
  const { t } = useLanguage();

  return (
    <section className="why">
      <div className="container">
        <AnimatedText text={t('fxWhyTitle')} className="why-title" />
        <Reveal delay={400}>
          <p>{t('fxWhyText')}</p>
        </Reveal>
      </div>
    </section>
  );
}

export default WhyChooseUs;