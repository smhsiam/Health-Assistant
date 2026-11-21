import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../utils/roleHome';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role || 'patient')) {
    return <Navigate to={homeFor(user)} replace />;
  }

  return children;
}

export default ProtectedRoute;