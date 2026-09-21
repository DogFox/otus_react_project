import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { categoriesApi, productsApi } from '../services/shop';
import type { Category, Product } from '../types/api';

const schema = z.object({
  name: z.string().trim().min(1, 'Укажите название'),
  price: z.number().positive('Цена должна быть больше 0'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  desc: z.string().optional(),
  photo: z.string().url('Укажите корректную ссылку').or(z.literal('')).optional(),
  oldPrice: z.number().positive().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ProductDialog({
  product,
  visible,
  onHide,
  onSaved,
}: {
  product: Product | null;
  visible: boolean;
  onHide: () => void;
  onSaved: (message: string) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      price: undefined,
      categoryId: '',
      desc: '',
      photo: '',
      oldPrice: undefined,
    },
  });
  useEffect(() => {
    if (!visible) return;
    categoriesApi.list().then(setCategories);
    reset(
      product
        ? {
            name: product.name,
            price: product.price,
            categoryId: product.category.id,
            desc: product.desc ?? '',
            photo: product.photo ?? '',
            oldPrice: product.oldPrice,
          }
        : { name: '', price: undefined, categoryId: '', desc: '', photo: '', oldPrice: undefined },
    );
  }, [visible, product, reset]);
  const submit = async (values: FormValues) => {
    setSaving(true);
    try {
      const body = { ...values, desc: values.desc || undefined, photo: values.photo || undefined };
      if (product) await productsApi.update(product.id, body);
      else await productsApi.create(body);
      onSaved(product ? 'Товар обновлён' : 'Товар добавлен');
      onHide();
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog
      header={product ? 'Редактировать товар' : 'Новый товар'}
      visible={visible}
      onHide={onHide}
      style={{ width: 'min(94vw, 560px)' }}
    >
      <form className="form-grid" onSubmit={handleSubmit(submit)}>
        <label>
          Название
          <InputText {...register('name')} invalid={!!errors.name} />
          {errors.name && <small>{errors.name.message}</small>}
        </label>
        <label>
          Цена
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onValueChange={(event) => field.onChange(event.value)}
                mode="currency"
                currency="RUB"
                locale="ru-RU"
                invalid={!!errors.price}
              />
            )}
          />
          {errors.price && <small>{errors.price.message}</small>}
        </label>
        <label>
          Категория
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Dropdown
                value={field.value}
                onChange={(event) => field.onChange(event.value)}
                options={categories}
                optionLabel="name"
                optionValue="id"
                placeholder="Выберите категорию"
                invalid={!!errors.categoryId}
              />
            )}
          />
          {errors.categoryId && <small>{errors.categoryId.message}</small>}
        </label>
        <label>
          Ссылка на фото
          <InputText {...register('photo')} invalid={!!errors.photo} />
          {errors.photo && <small>{errors.photo.message}</small>}
        </label>
        <label>
          Старая цена
          <Controller
            control={control}
            name="oldPrice"
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onValueChange={(event) => field.onChange(event.value)}
                mode="currency"
                currency="RUB"
                locale="ru-RU"
              />
            )}
          />
        </label>
        <label className="wide">
          Описание
          <InputTextarea {...register('desc')} rows={3} autoResize />
        </label>
        <div className="dialog-actions">
          <Button type="button" label="Отмена" text onClick={onHide} />
          <Button type="submit" label="Сохранить" loading={saving} />
        </div>
      </form>
    </Dialog>
  );
}
