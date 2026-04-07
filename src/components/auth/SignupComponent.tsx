import React, { useState, FormEvent } from 'react';
import { useSession } from '@/contexts/SessionContext';
import StatusMessage from '@/components/StatusMessage';

interface SignupComponentProps {
  onSwitchToLogin: () => void;
}

export const SignupComponent: React.FC<SignupComponentProps> = ({ onSwitchToLogin }) => {
  const { signup } = useSession();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): string | null => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      return 'Username is required.';
    }

    if (trimmedUsername.length < 3) {
      return 'Username must be at least 3 characters long.';
    }

    if (trimmedUsername.length > 32) {
      return 'Username must be no more than 32 characters long.';
    }

    if (!/^[a-zA-Z0-9]+$/.test(trimmedUsername)) {
      return 'Username must contain only letters and numbers.';
    }

    if (!password) {
      return 'Password is required.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (password.length > 64) {
      return 'Password must be no more than 64 characters long.';
    }

    if (!/[a-zA-Z]/.test(password)) {
      return 'Password must contain at least one letter.';
    }

    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signup(username.trim(), password);
      if (!result.success) {
        setError(result.error ?? 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Create Account</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sign up to start managing your documents.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <StatusMessage
              type="error"
              message={error}
              onDismiss={handleDismissError}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="signup-username"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Username
            </label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby="signup-username-hint"
            />
            <p id="signup-username-hint" className="mt-1 text-xs text-neutral-400">
              3–32 characters, letters and numbers only.
            </p>
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={64}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby="signup-password-hint"
            />
            <p id="signup-password-hint" className="mt-1 text-xs text-neutral-400">
              6–64 characters, at least one letter and one number.
            </p>
          </div>

          <div>
            <label
              htmlFor="signup-confirm-password"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-brand-600 hover:text-brand-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupComponent;