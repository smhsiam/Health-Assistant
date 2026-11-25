import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import RoleSwitch from '../components/RoleSwitch';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { homeFor } from '../utils/roleHome';

function DoctorRegister() {
  const { user, registerDoctor } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    specialty: '',
    bmdcNumber: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={homeFor(user)} replace />;
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
    if (!form.specialty.trim()) {
      next.specialty = t('errSpecialty');
    }
    if (!/^[A-Za-z0-9-]{3,30}$/.test(form.bmdcNumber.trim())) {
      next.bmdcNumber = t('errBmdc');
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
      await registerDoctor({
        name: form.name.trim(),
        email: form.email.trim(),
        specialty: form.specialty.trim(),
        bmdcNumber: form.bmdcNumber.trim(),
        password: form.password,
      });
      showToast(t('pendingNotice'), 'success');
    } catch (error) {
      const message =
        error.response && error.response.data && error.response.data.message;
      setServerError(message || t('errNetwork'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('doctorRegisterTitle')}
      subtitle={t('doctorRegisterSub')}
    >
      <RoleSwitch active="doctor" />
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
          <label htmlFor="specialty">{t('specialty')}</label>
          <input
            id="specialty"
            name="specialty"
            type="text"
            value={form.specialty}
            onChange={handleChange}
            className={errors.specialty ? 'input-error' : ''}
            aria-invalid={Boolean(errors.specialty)}
          />
          {errors.specialty && (
            <p className="field-error">{errors.specialty}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bmdcNumber">{t('bmdcNumber')}</label>
          <input
            id="bmdcNumber"
            name="bmdcNumber"
            type="text"
            value={form.bmdcNumber}
            onChange={handleChange}
            className={errors.bmdcNumber ? 'input-error' : ''}
            aria-invalid={Boolean(errors.bmdcNumber)}
          />
          {errors.bmdcNumber ? (
            <p className="field-error">{errors.bmdcNumber}</p>
          ) : (
            <p className="hint">{t('bmdcHint')}</p>
          )}
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
          {loading ? t('creatingAccount') : t('registerDoctorBtn')}
        </button>
      </form>

      <p className="auth-switch">
        {t('haveAccount')} <Link to="/login">{t('login')}</Link>
      </p>
    </AuthLayout>
  );
}

export default DoctorRegister;