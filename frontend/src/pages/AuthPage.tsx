// src/pages/AuthPage.tsx
import React, { useState, useContext } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface AuthPageProps {
  defaultMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ defaultMode = 'login' }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState<boolean>(defaultMode === 'login');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const { username, email, password, confirmPassword } = formData;

    try {
      if (isLogin) {
        if (!auth) throw new Error('Auth system unavailable.');
        await auth.login({ email, password });
        navigate('/dashboard');
      } else {
        if (!username || !email || !password) {
          throw new Error('All fields are required.');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (!auth) throw new Error('Auth system unavailable.');
        await auth.register({ username, email, password });
        setIsLogin(true);
        setSuccessMsg('Registration successful! Please log in.');
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.messages?.[0];
      setError(apiMessage || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFormMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMsg(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="auth-container">
      {/* Home Navigation */}
      <div className="auth-navbar">
        <button
          id="auth-home-btn"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/')}
          aria-label="Navigate to home page"
        >
          ← Home
        </button>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="auth-subtitle">
          {isLogin
            ? 'Sign in to manage your projects'
            : 'Sign up to start managing your projects'}
        </p>

        {error && <div className="auth-error">{error}</div>}
        {successMsg && <div className="auth-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username-input" className="form-label">
                Username
              </label>
              <input
                id="username-input"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter a unique username"
                required
                minLength={3}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email-input" className="form-label">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="form-group password-input-group">
            <label htmlFor="password-input" className="form-label">
              Password
            </label>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="••••••••"
              minLength={8}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          {!isLogin && (
            <div className="form-group password-input-group">
              <label htmlFor="confirm-password-input" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? '🙈' : '👁'}
              </button>
            </div>
          )}

          <button
            id={isLogin ? 'login-btn' : 'register-btn'}
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading
              ? 'Processing...'
              : isLogin
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            id="toggle-auth-btn"
            onClick={toggleFormMode}
            className="auth-toggle-btn"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
