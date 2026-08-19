import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../hooks/useAuth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7-10.5-7-10.5-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.6 17.6A10.6 10.6 0 0 1 12 19c-6.5 0-10.5-7-10.5-7a20.3 20.3 0 0 1 4.8-5.7M9.5 4.6A10 10 0 0 1 12 5c6.5 0 10.5 7 10.5 7a20.5 20.5 0 0 1-2.9 3.9" />
      <path d="M14 14.2a3 3 0 0 1-4.2-4.2" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function validate(formData) {
  const errors = {};

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(formData.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  }

  return errors;
}

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(formData.email.trim(), formData.password);
      toast.success('Welcome back!');
      const targetRoute =
        loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'SUPER_ADMIN'
          ? '/admin'
          : '/dashboard';
      navigate(targetRoute);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Invalid email or password. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card w-full max-w-md mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Welcome back</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Log in to continue your TU exam prep with focus and momentum.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
          required
        />

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          required
          rightAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-neutral-400 hover:text-neutral-600"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOffIcon className="w-[18px] h-[18px]" />
              ) : (
                <EyeIcon className="w-[18px] h-[18px]" />
              )}
            </button>
          }
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          className="mt-2"
        >
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        New here?{' '}
        <Link to="/register" className="font-medium text-neutral-800 hover:underline">
          Create your free account
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
