import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

function Login() {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const target = (location.state && location.state.from) || '/upload';

  if (user) {
    return <Navigate to={target} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = t('errEmail');
    }
    if (!form.password) {
      next.password = t('errPasswordRequired');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form.email.trim(), form.password, remember);
      showToast(t('welcomeBack'), 'success');
    } catch (error) {
      const message =
        error.response && error.response.data && error.response.data.message;
      setServerError(message || t('errNetwork'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('loginTitle')} subtitle={t('loginSub')}>
      {serverError && (
        <div className="error-banner" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">{t('email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('password')}</label>
          <div className="input-wrap has-eye">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            >
              <i
                className={
                  showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'
                }
              ></i>
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="form-row">
          <label className="check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            {t('rememberMe')}
          </label>
        </div>

        <button
          type="submit"
          className="btn-primary btn-block"
          disabled={loading}
        >
          {loading ? t('loggingIn') : t('login')}
        </button>
      </form>

      <p className="auth-switch">
        {t('noAccount')} <Link to="/register">{t('register')}</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;