import { Link } from 'react-router-dom';

const TEXT = 'Health Assistant';

function AnimatedLogo({ to = '/' }) {
  const letters = TEXT.split('');

  return (
    <Link to={to} className="logo animated-logo" aria-label={TEXT}>
      <span
        className="logo-word"
        aria-hidden="true"
        style={{ '--n': letters.length }}
      >
        <span className="logo-line"></span>
        {letters.map((char, i) =>
          char === ' ' ? (
            <span key={i} className="logo-gap"></span>
          ) : (
            <span key={i} className="logo-letter" style={{ '--i': i }}>
              {char}
            </span>
          )
        )}
        <span className="logo-pen"></span>
      </span>
    </Link>
  );
}

export default AnimatedLogo;