import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { categoriesApi } from '../services/shop';

const schema = z.object({ name: z.string().trim().min(1, 'Введите название категории') });
type Values = z.infer<typeof schema>;

export function CategoryDialog({
  visible,
  onHide,
  onSaved,
}: {
  visible: boolean;
  onHide: () => void;
  onSaved: () => void;
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  const close = () => {
    reset();
    onHide();
  };

  const submit = async ({ name }: Values) => {
    await categoriesApi.create({ name });
    reset();
    onSaved();
    onHide();
  };

  return (
    <Dialog
      header="Новая категория"
      visible={visible}
      onHide={close}
      style={{ width: 'min(94vw, 420px)' }}
    >
      <form className="form-grid" onSubmit={handleSubmit(submit)} noValidate>
        <label>
          Название
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <InputText {...field} value={field.value} invalid={!!errors.name} autoFocus />
            )}
          />
          {errors.name && <small>{errors.name.message}</small>}
        </label>
        <div className="dialog-actions">
          <Button type="button" label="Отмена" text onClick={close} />
          <Button type="submit" label="Создать" loading={isSubmitting} />
        </div>
      </form>
    </Dialog>
  );
}
