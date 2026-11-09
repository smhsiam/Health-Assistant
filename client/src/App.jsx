import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ComingSoon title="dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <ComingSoon title="upload" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <ComingSoon title="history" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trends"
            element={
              <ProtectedRoute>
                <ComingSoon title="trends" />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}

export default App;