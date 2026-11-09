import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

function Register() {
  const { user, register } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/upload" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) {
      next.name = t('errNameRequired');
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = t('errEmail');
    }
    const strongEnough =
      form.password.length >= 8 &&
      /[A-Za-z]/.test(form.password) &&
      /\d/.test(form.password);
    if (!strongEnough) {
      next.password = t('errPasswordRule');
    }
    if (form.confirm !== form.password) {
      next.confirm = t('errPasswordMatch');
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
      await register(form.name.trim(), form.email.trim(), form.password);
      showToast(t('accountCreated'), 'success');
    } catch (error) {
      const message =
        error.response && error.response.data && error.response.data.message;
      setServerError(message || t('errNetwork'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('registerTitle')} subtitle={t('registerSub')}>
      {serverError && (
        <div className="error-banner" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">{t('name')}</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? 'input-error' : ''}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

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
              autoComplete="new-password"
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
          {errors.password ? (
            <p className="field-error">{errors.password}</p>
          ) : (
            <p className="hint">{t('passwordHint')}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirm">{t('confirmPassword')}</label>
          <input
            id="confirm"
            name="confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.confirm}
            onChange={handleChange}
            className={errors.confirm ? 'input-error' : ''}
            aria-invalid={Boolean(errors.confirm)}
          />
          {errors.confirm && <p className="field-error">{errors.confirm}</p>}
        </div>

        <button
          type="submit"
          className="btn-primary btn-block"
          disabled={loading}
        >
          {loading ? t('creatingAccount') : t('register')}
        </button>
      </form>

      <p className="auth-switch">
        {t('haveAccount')} <Link to="/login">{t('login')}</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;