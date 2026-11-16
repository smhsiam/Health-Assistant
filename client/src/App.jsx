import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadReport from './pages/UploadReport';
import ReportDetail from './pages/ReportDetail';
import Summary from './pages/Summary';
import History from './pages/History';
import Trends from './pages/Trends';
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
                <UploadReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute>
                <ReportDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id/summary"
            element={
              <ProtectedRoute>
                <Summary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trends"
            element={
              <ProtectedRoute>
                <Trends />
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