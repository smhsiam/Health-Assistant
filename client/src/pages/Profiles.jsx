import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const MINOR_YEARS = 19;

const relations = ['mother', 'father', 'spouse', 'child', 'sibling', 'other'];

const relationKeys = {
  self: 'relSelf',
  mother: 'relMother',
  father: 'relFather',
  spouse: 'relSpouse',
  child: 'relChild',
  sibling: 'relSibling',
  other: 'relOther',
};

const emptyForm = { name: '', relation: 'other', birthYear: '', sex: '' };

const fill = (text, values) =>
  Object.keys(values).reduce(
    (out, key) => out.replace(`{${key}}`, values[key]),
    text
  );

function Profiles() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const thisYear = new Date().getFullYear();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    api
      .get('/profiles')
      .then((response) => {
        if (!cancelled) {
          setProfiles(response.data.profiles);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
    setDeleteId(null);
  };

  const openEdit = (profile) => {
    setEditing(profile);
    setForm({
      name: profile.name,
      relation: profile.isSelf ? 'self' : profile.relation,
      birthYear: profile.birthYear ? String(profile.birthYear) : '',
      sex: profile.sex || '',
    });
    setFormError('');
    setFormOpen(true);
    setDeleteId(null);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFormError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim()) {
      return t('errProfileName');
    }

    const year = form.birthYear.trim();

    if (year) {
      if (!/^\d{4}$/.test(year)) {
        return t('errBirthYear');
      }
      if (Number(year) < 1900 || Number(year) > thisYear) {
        return t('errBirthYear');
      }
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const problem = validate();

    if (problem) {
      setFormError(problem);
      return;
    }

    setFormError('');
    setSaving(true);

    const body = {
      name: form.name.trim(),
      relation: form.relation,
      birthYear: form.birthYear.trim(),
      sex: form.sex,
    };

    try {
      if (editing) {
        const response = await api.put(`/profiles/${editing.id}`, body);
        setProfiles(
          profiles.map((item) =>
            item.id === editing.id ? response.data.profile : item
          )
        );
      } else {
        const response = await api.post('/profiles', body);
        setProfiles([...profiles, response.data.profile]);
      }

      showToast(t('profileSaved'), 'success');
      closeForm();
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message;
      setFormError(message || t('errNetwork'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (profile) => {
    setDeleting(true);

    try {
      await api.delete(`/profiles/${profile.id}`);
      setProfiles(profiles.filter((item) => item.id !== profile.id));
      showToast(t('profileDeleted'), 'success');
      setDeleteId(null);
    } catch (err) {
      showToast(t('profileDeleteFailed'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const sexText = (sex) => {
    if (sex === 'male') {
      return t('sexMale');
    }
    if (sex === 'female') {
      return t('sexFemale');
    }
    return t('sexNotSet');
  };

  return (
    <div className="container page">
      <div className="profiles-head">
        <div>
          <h1 className="page-title">{t('profilesTitle')}</h1>
          <p className="page-subtitle">{t('profilesSub')}</p>
        </div>
        {!formOpen && (
          <button type="button" className="btn-primary" onClick={openAdd}>
            <i className="fa-solid fa-user-plus"></i>
            {t('addProfile')}
          </button>
        )}
      </div>

      {formOpen && (
        <form className="card profile-form" onSubmit={handleSubmit} noValidate>
          <h2>{editing ? t('editProfile') : t('addProfile')}</h2>

          {formError && (
            <div className="error-banner" role="alert">
              {formError}
            </div>
          )}

          <div className="profile-fields">
            <div className="form-group">
              <label htmlFor="pname">{t('profileName')}</label>
              <input
                id="pname"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            {!(editing && editing.isSelf) && (
              <div className="form-group">
                <label htmlFor="prelation">{t('profileRelation')}</label>
                <select
                  id="prelation"
                  name="relation"
                  value={form.relation}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {relations.map((item) => (
                    <option key={item} value={item}>
                      {t(relationKeys[item])}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="pyear">{t('birthYearLabel')}</label>
              <input
                id="pyear"
                name="birthYear"
                type="text"
                inputMode="numeric"
                placeholder="1990"
                value={form.birthYear}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="psex">{t('sexLabel')}</label>
              <select
                id="psex"
                name="sex"
                value={form.sex}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">{t('sexNotSet')}</option>
                <option value="male">{t('sexMale')}</option>
                <option value="female">{t('sexFemale')}</option>
              </select>
            </div>
          </div>

          <p className="hint">{t('profileHint')}</p>

          <div className="edit-actions">
            <button type="submit" className="btn-primary btn-small" disabled={saving}>
              {saving ? t('saving') : t('save')}
            </button>
            <button
              type="button"
              className="btn-outline btn-small"
              onClick={closeForm}
              disabled={saving}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="profile-grid">
          {[1, 2].map((n) => (
            <div className="card profile-card" key={n}>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-line"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <i className="fa-solid fa-triangle-exclamation empty-icon"></i>
          <h3>{t('profileLoadFailed')}</h3>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setAttempt(attempt + 1)}
          >
            {t('tryAgain')}
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="profile-grid">
          {profiles.map((profile) => {
            const age = profile.birthYear ? thisYear - profile.birthYear : null;
            const minor = age !== null && age < MINOR_YEARS;

            return (
              <div className="card profile-card" key={profile.id}>
                <div className="profile-top">
                  <span className="avatar">{profile.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <strong>{profile.name}</strong>
                    <span className="profile-rel">
                      {profile.isSelf ? t('you') : t(relationKeys[profile.relation] || 'relOther')}
                    </span>
                  </div>
                </div>

                <ul className="profile-facts">
                  <li>
                    <i className="fa-solid fa-cake-candles"></i>
                    {age !== null ? fill(t('ageAbout'), { n: age }) : t('ageNotSet')}
                  </li>
                  <li>
                    <i className="fa-solid fa-venus-mars"></i>
                    {sexText(profile.sex)}
                  </li>
                </ul>

                {minor && (
                  <p className="profile-note">
                    <i className="fa-solid fa-circle-info"></i>
                    {t('childNote')}
                  </p>
                )}

                {deleteId === profile.id ? (
                  <div className="confirm-box">
                    <strong>{fill(t('profileDeleteTitle'), { name: profile.name })}</strong>
                    <p>{t('profileDeleteText')}</p>
                    <div className="edit-actions">
                      <button
                        type="button"
                        className="btn-danger btn-small"
                        onClick={() => handleDelete(profile)}
                        disabled={deleting}
                      >
                        {deleting ? t('deleting') : t('deleteConfirm')}
                      </button>
                      <button
                        type="button"
                        className="btn-outline btn-small"
                        onClick={() => setDeleteId(null)}
                        disabled={deleting}
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="edit-actions">
                    <button
                      type="button"
                      className="btn-outline btn-small"
                      onClick={() => openEdit(profile)}
                    >
                      <i className="fa-solid fa-pen"></i>
                      {t('editShort')}
                    </button>
                    {!profile.isSelf && (
                      <button
                        type="button"
                        className="btn-quiet-danger btn-small"
                        onClick={() => setDeleteId(profile.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                        {t('deleteProfile')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Profiles;