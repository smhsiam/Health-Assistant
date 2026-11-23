import useInView from '../hooks/useInView';

function AnimatedText({
  text,
  as: Tag = 'h2',
  className = '',
  center = true,
  bar = true,
}) {
  const [ref, shown] = useInView(0.35);
  const words = String(text).split(' ');

  return (
    <div
      ref={ref}
      className={`at-wrap ${shown ? 'at-in' : ''} ${center ? 'at-center' : ''}`}
      style={{ '--n': words.length }}
    >
      <Tag className={`at-h ${className}`}>
        <span className="at-sr">{text}</span>
        {words.map((word, index) => (
          <span className="at-mask" aria-hidden="true" key={`${word}-${index}`}>
            <span className="at-word" style={{ '--i': index }}>
              {word}
            </span>
          </span>
        ))}
      </Tag>
      {bar && <span className="at-line" aria-hidden="true"></span>}
    </div>
  );
}

export default AnimatedText;