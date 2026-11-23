import useInView from '../hooks/useInView';

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, shown] = useInView(0.2);

  return (
    <div
      ref={ref}
      className={`rv ${shown ? 'rv-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default Reveal;