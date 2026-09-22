import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Controller, useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';

const schema = z.object({
  email: z.string().trim().email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
});
type Values = z.infer<typeof schema>;

export function AuthPage({
  mode,
  notify,
}: {
  mode: 'login' | 'register';
  notify: (severity: 'success' | 'error', detail: string) => void;
}) {
  const { profile, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const registration = mode === 'register';
  if (profile) return <Navigate to="/" replace />;

  const submit = async (values: Values) => {
    try {
      await (registration
        ? signUp(values.email, values.password)
        : signIn(values.email, values.password));
      notify('success', registration ? 'Аккаунт создан' : 'Вы вошли в аккаунт');
      navigate('/');
    } catch (error) {
      notify('error', getErrorMessage(error));
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
        <Link className="brand" to="/">
          <i className="pi pi-shopping-bag" /> OTUS Market
        </Link>
        <div>
          <p className="eyebrow">{registration ? 'Новый аккаунт' : 'С возвращением'}</p>
          <h1>{registration ? 'Регистрация' : 'Вход'}</h1>
        </div>
        <label>
          Email
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <InputText
                {...field}
                value={field.value}
                type="email"
                autoComplete="email"
                invalid={!!errors.email}
              />
            )}
          />
          {errors.email && <small>{errors.email.message}</small>}
        </label>
        <label>
          Пароль
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Password
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                feedback={registration}
                toggleMask
                inputClassName={errors.password ? 'p-invalid' : ''}
              />
            )}
          />
          {errors.password && <small>{errors.password.message}</small>}
        </label>
        <Button
          label={registration ? 'Создать аккаунт' : 'Войти'}
          type="submit"
          loading={isSubmitting}
        />
        <p className="form-footnote">
          {registration ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
          <Link to={registration ? '/login' : '/register'}>
            {registration ? 'Войти' : 'Зарегистрироваться'}
          </Link>
        </p>
      </form>
    </section>
  );
}
