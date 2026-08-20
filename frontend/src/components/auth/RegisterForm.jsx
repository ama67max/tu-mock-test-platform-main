import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../hooks/useAuth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

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

  if (!formData.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (formData.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(formData.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!PASSWORD_PATTERN.test(formData.password)) {
    errors.password = 'Min 8 characters, with at least one letter and one number';
  }

  if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
      const newUser = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      toast.success('Account created!');
      const targetRoute =
        newUser?.role === 'ADMIN' || newUser?.role === 'SUPER_ADMIN'
          ? '/admin'
          : '/dashboard';
      navigate(targetRoute);
    } catch (error) {
        const resp = error.response?.data;
        // If backend returned field errors (array of 'field: message'), map them to form fields
        if (resp?.errors && Array.isArray(resp.errors)) {
          const serverErrors = {};
          resp.errors.forEach((e) => {
            const parts = e.split(':');
            if (parts.length >= 2) {
              const field = parts[0].trim();
              const msg = parts.slice(1).join(':').trim();
              serverErrors[field] = msg;
            }
          });
          setErrors((prev) => ({ ...prev, ...serverErrors }));
          // show general message too
          toast.error(resp.message || 'Validation failed');
        } else {
          const message = resp?.message || 'Something went wrong. Please try again.';
          toast.error(message);
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card w-full max-w-md mx-auto animate-fade-in">
      <h1 className="font-headline text-2xl font-bold text-primary mb-1">Create your account</h1>
      <p className="text-sm text-secondary mb-6">
        Build your prep routine and start practicing for your TU entrance exam today.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Full name"
          name="fullName"
          type="text"
          autoComplete="name"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Ram Sharma"
          error={errors.fullName}
          required
        />

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
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          helperText="Min 8 chars, uppercase, lowercase, number & special char"
          required
          rightAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-secondary hover:text-primary"
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

        <Input
          label="Confirm password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          className="mt-2"
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Already preparing with us?{' '}
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;
