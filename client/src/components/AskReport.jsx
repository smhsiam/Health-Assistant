import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const MAX_QUESTION = 300;
const examples = ['qaExample1', 'qaExample2', 'qaExample3'];

function AskReport({ reportId }) {
  const { t, lang } = useLanguage();

  const [available, setAvailable] = useState(null);
  const [question, setQuestion] = useState('');
  const [items, setItems] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    api
      .get('/health')
      .then((response) => setAvailable(Boolean(response.data.ai)))
      .catch(() => setAvailable(false));
  }, []);

  useEffect(() => {
    if (items.length > 0 && endRef.current) {
      endRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [items.length]);

  const ask = async (text) => {
    const body = text.trim();

    if (!body || asking) {
      return;
    }

    setError('');
    setAsking(true);

    try {
      const response = await api.post(`/reports/${reportId}/ask`, {
        question: body,
        lang,
      });

      setItems((current) => [
        ...current,
        {
          id: Date.now(),
          question: body,
          answer: response.data.answer,
          answered: response.data.answered,
          urgency: response.data.urgencyMessage,
        },
      ]);
      setQuestion('');
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message;
      setError(message || t('errNetwork'));
    } finally {
      setAsking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask(question);
  };

  if (available === null) {
    return null;
  }

  if (!available) {
    return (
      <div className="qa-box">
        <h3>
          <i className="fa-solid fa-comment-dots"></i> {t('qaTitle')}
        </h3>
        <p className="hint">{t('qaOff')}</p>
      </div>
    );
  }

  return (
    <div className="qa-box">
      <h3>
        <i className="fa-solid fa-comment-dots"></i> {t('qaTitle')}
      </h3>
      <p className="hint">{t('qaSub')}</p>

      <div className="qa-chips">
        {examples.map((key) => (
          <button
            key={key}
            type="button"
            className="qa-chip"
            onClick={() => ask(t(key))}
            disabled={asking}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <div className="qa-list" aria-live="polite">
          {items.map((item) => (
            <div className="qa-item" key={item.id}>
              <p className="qa-q">
                {t('qaYou')}: {item.question}
              </p>
              <p className="qa-a">{item.answer}</p>
              {item.urgency && (
                <p className="qa-urgent">{item.urgency[lang]}</p>
              )}
              <p className="qa-notice">{t('doctorNotice')}</p>
            </div>
          ))}
          <div ref={endRef}></div>
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <form className="qa-form" onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('qaPlaceholder')}
          aria-label={t('qaPlaceholder')}
          maxLength={MAX_QUESTION}
          disabled={asking}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={asking || !question.trim()}
        >
          {asking ? t('qaAsking') : t('qaAsk')}
        </button>
      </form>
      <p className="qa-count">
        {question.length}/{MAX_QUESTION}
      </p>
      <p className="qa-notice">{t('qaAiNote')}</p>
    </div>
  );
}

export default AskReport;