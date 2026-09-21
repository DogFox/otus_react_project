import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { categoriesApi } from '../services/shop';

export function CategoryDialog({
  visible,
  onHide,
  onSaved,
}: {
  visible: boolean;
  onHide: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await categoriesApi.create({ name: name.trim() });
      setName('');
      onSaved();
      onHide();
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog
      header="Новая категория"
      visible={visible}
      onHide={onHide}
      style={{ width: 'min(94vw, 420px)' }}
    >
      <form className="form-grid" onSubmit={submit}>
        <label>
          Название
          <InputText value={name} onChange={(event) => setName(event.target.value)} autoFocus />
        </label>
        <div className="dialog-actions">
          <Button type="button" label="Отмена" text onClick={onHide} />
          <Button label="Создать" loading={saving} disabled={!name.trim()} />
        </div>
      </form>
    </Dialog>
  );
}
