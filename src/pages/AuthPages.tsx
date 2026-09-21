import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';

const schema = z.object({
  email: z.string().email('Укажите корректный email'),
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
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  if (profile) return <Navigate to="/" replace />;
  const submit = async (values: Values) => {
    setSubmitting(true);
    try {
      await (mode === 'login'
        ? signIn(values.email, values.password)
        : signUp(values.email, values.password));
      notify('success', mode === 'login' ? 'Вы вошли в аккаунт' : 'Аккаунт создан');
      navigate('/');
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };
  const registration = mode === 'register';
  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit(submit)}>
        <Link className="brand" to="/">
          <i className="pi pi-shopping-bag" /> OTUS Market
        </Link>
        <div>
          <p className="eyebrow">{registration ? 'Новый аккаунт' : 'С возвращением'}</p>
          <h1>{registration ? 'Регистрация' : 'Вход'}</h1>
        </div>
        <label>
          Email
          <InputText
            type="email"
            {...register('email')}
            invalid={!!errors.email}
            autoComplete="email"
          />
          {errors.email && <small>{errors.email.message}</small>}
        </label>
        <label>
          Пароль
          <Password
            {...register('password')}
            toggleMask
            feedback={registration}
            inputClassName={errors.password ? 'p-invalid' : ''}
          />
          {errors.password && <small>{errors.password.message}</small>}
        </label>
        <Button
          label={registration ? 'Создать аккаунт' : 'Войти'}
          type="submit"
          loading={submitting}
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
