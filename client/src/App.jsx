import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { useLanguage } from './context/LanguageContext';

const authPaths = ['/login', '/register'];

function ComingSoon({ title }) {
  const { t } = useLanguage();

  return (
    <div className="container page text-center">
      <div className="empty-state">
        <i className="fa-solid fa-hourglass-half empty-icon"></i>
        <h3>{t(title)}</h3>
        <p>{t('comingSoon')}</p>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const hideLayout = authPaths.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<ComingSoon title="login" />} />
          <Route path="/register" element={<ComingSoon title="register" />} />
          <Route path="/dashboard" element={<ComingSoon title="dashboard" />} />
          <Route path="/upload" element={<ComingSoon title="upload" />} />
          <Route path="/history" element={<ComingSoon title="history" />} />
          <Route path="/trends" element={<ComingSoon title="trends" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}

export default App;