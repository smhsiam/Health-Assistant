function Loader({ text }) {
  return (
    <div className="loader-wrap">
      <div className="spinner"></div>
      {text && <p>{text}</p>}
    </div>
  );
}

export default Loader;