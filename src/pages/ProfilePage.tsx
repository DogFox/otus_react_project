import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { TabPanel, TabView } from 'primereact/tabview';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getErrorMessage } from '../lib/api';

export function ProfilePage({
  notify,
}: {
  notify: (severity: 'success' | 'error', detail: string) => void;
}) {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  if (!profile) return null;
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.patch('/profile', { name });
      await refreshProfile();
      notify('success', 'Профиль обновлён');
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/profile/change-password', { password: oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      notify('success', 'Пароль изменён');
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="page narrow-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Аккаунт</p>
          <h1>Профиль</h1>
        </div>
      </div>
      <TabView>
        <TabPanel header="Данные">
          <form className="form-grid profile-form" onSubmit={saveProfile}>
            <label>
              Имя
              <InputText value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              Email
              <InputText value={profile.email} disabled />
            </label>
            <Button
              label="Сохранить изменения"
              type="submit"
              loading={saving}
              disabled={!name.trim()}
            />
          </form>
        </TabPanel>
        <TabPanel header="Пароль">
          <form className="form-grid profile-form" onSubmit={changePassword}>
            <label>
              Текущий пароль
              <Password
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                feedback={false}
                toggleMask
              />
            </label>
            <label>
              Новый пароль
              <Password
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                feedback
                toggleMask
              />
            </label>
            <Button
              label="Изменить пароль"
              type="submit"
              loading={saving}
              disabled={oldPassword.length < 8 || newPassword.length < 8}
            />
          </form>
        </TabPanel>
      </TabView>
    </section>
  );
}
