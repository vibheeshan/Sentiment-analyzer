import React, { useState } from 'react';
import { ShieldCheck, Mail, Key, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

export default function Login({ onLogin, onSwitchToSignup }) {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [identityTouched, setIdentityTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const isEmail = /\S+@\S+\.\S+/.test(identity);
  const identityError = identityTouched && !identity.trim()
    ? 'Enter your email or username.'
    : identityTouched && identity.includes('@') && !isEmail
      ? 'Enter a valid email address.'
      : '';
  const passwordError = passwordTouched && !password
    ? 'Enter your password.'
    : '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!identity.trim() || !password) {
      setIdentityTouched(true);
      setPasswordTouched(true);
      setError('Enter your email or username and password to sign in.');
      return;
    }

    if (identity.includes('@') && !isEmail) {
      setIdentityTouched(true);
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.login(identity.trim(), password);
      if (response && response.success) {
        onLogin({ userId: response.user_id, username: response.username, email: response.email });
      } else {
        setError(response.detail || 'Invalid email/username or password');
      }
    } catch (err) {
      setError(err?.message || 'Unable to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card--wide">
        <div className="auth-header auth-header--wide">
          <div className="auth-brand-icon">
            <ShieldCheck className="auth-brand-icon__symbol" />
          </div>
          <div>
            <p className="eyebrow">Enterprise Sign-In</p>
            <h1>Access BrandPulse</h1>
            <p className="subtext">Use your email address or username to securely log in and continue to your integrated sentiment analytics, reporting, and alerts workspace.</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form auth-form--wide">
          <label className="form-label">
            Email or username
            <div className="input-group">
              <span className="input-icon input-icon--left"><Mail className="icon" /></span>
              <input
                className="input-field"
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                onBlur={() => setIdentityTouched(true)}
                placeholder="name@example.com or brand_analyst"
                required
              />
            </div>
            {identityError && <span className="form-hint text-rose-500">{identityError}</span>}
          </label>

          <label className="form-label">
            Password
            <div className="input-group">
              <span className="input-icon input-icon--left"><Key className="icon" /></span>
              <input
                className="input-field input-field--with-icon"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="input-icon input-icon--right"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
              </button>
            </div>
          </label>
          {passwordError && <span className="form-hint text-rose-500">{passwordError}</span>}

          <div className="auth-row">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox" />
              Remember me
            </label>
            <button type="button" className="link-button">Forgot password?</button>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-primary--wide inline-flex items-center justify-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
            <ArrowRight className="button-icon" />
          </button>
        </form>

        <div className="auth-footer auth-footer--wide">
          <p className="font-medium text-slate-400">New to BrandPulse?</p>
          <button type="button" className="link-button" onClick={onSwitchToSignup}>Create account</button>
        </div>
      </div>
    </div>
  );
}
