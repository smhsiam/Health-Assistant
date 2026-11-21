import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorRegister from './pages/DoctorRegister';
import UploadReport from './pages/UploadReport';
import ReportDetail from './pages/ReportDetail';
import Summary from './pages/Summary';
import History from './pages/History';
import Trends from './pages/Trends';
import Profiles from './pages/Profiles';
import Doctors from './pages/Doctors';
import DoctorProfile from './pages/DoctorProfile';
import AdminDoctors from './pages/AdminDoctors';
import SharedReports from './pages/SharedReports';
import SharedReportView from './pages/SharedReportView';
import NotFound from './pages/NotFound';
import { useLanguage } from './context/LanguageContext';

const authPaths = ['/login', '/register', '/register-doctor'];
const patientRoles = ['patient', 'admin'];

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
          <Route path="/register-doctor" element={<DoctorRegister />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={patientRoles}>
                <ComingSoon title="dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute roles={patientRoles}>
                <UploadReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute roles={patientRoles}>
                <ReportDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id/summary"
            element={
              <ProtectedRoute roles={patientRoles}>
                <Summary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute roles={patientRoles}>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trends"
            element={
              <ProtectedRoute roles={patientRoles}>
                <Trends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profiles"
            element={
              <ProtectedRoute roles={patientRoles}>
                <Profiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <ProtectedRoute roles={patientRoles}>
                <Doctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/shared"
            element={
              <ProtectedRoute roles={['doctor']}>
                <SharedReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/shared/:id"
            element={
              <ProtectedRoute roles={['doctor']}>
                <SharedReportView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDoctors />
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