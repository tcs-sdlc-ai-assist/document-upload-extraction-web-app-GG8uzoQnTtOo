import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import StatusMessage from '@/components/StatusMessage';

interface LoginComponentProps {
  onSwitchToSignup: () => void;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({ onSwitchToSignup }) => {
  const { login } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  function validateFields(): boolean {
    const errors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      errors.username = 'Username is required.';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);

    if (errors.username) {
      usernameRef.current?.focus();
      return false;
    }
    if (errors.password) {
      passwordRef.current?.focus();
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!validateFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(username.trim(), password);

      if (!result.success) {
        setError(result.error ?? 'Login failed. Please check your credentials.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  }

  function handleDismissError() {
    setError(null);
  }

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <StatusMessage
              type="error"
              message={error}
              onDismiss={handleDismissError}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate aria-label="Login form">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="login-username"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Username
              </label>
              <input
                ref={usernameRef}
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) {
                    setFieldErrors((prev) => ({ ...prev, username: undefined }));
                  }
                }}
                aria-invalid={!!fieldErrors.username}
                aria-describedby={fieldErrors.username ? 'login-username-error' : undefined}
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors duration-200
                  ${fieldErrors.username
                    ? 'border-danger-500 focus:ring-2 focus:ring-danger-500 focus:border-danger-500'
                    : 'border-neutral-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  placeholder-neutral-400`}
                placeholder="Enter your username"
              />
              {fieldErrors.username && (
                <p
                  id="login-username-error"
                  className="mt-1.5 text-xs text-danger-600"
                  role="alert"
                >
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Password
              </label>
              <input
                ref={passwordRef}
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors duration-200
                  ${fieldErrors.password
                    ? 'border-danger-500 focus:ring-2 focus:ring-danger-500 focus:border-danger-500'
                    : 'border-neutral-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  placeholder-neutral-400`}
                placeholder="Enter your password"
              />
              {fieldErrors.password && (
                <p
                  id="login-password-error"
                  className="mt-1.5 text-xs text-danger-600"
                  role="alert"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-600 text-white text-sm font-medium
                hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-brand-600 hover:text-brand-700 font-medium transition-colors duration-200
                focus:outline-none focus:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;