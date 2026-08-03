import React, { useState } from 'react';
import { ShieldCheck, User, Mail, Key, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

export default function Signup({ onSignup, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ username: false, email: false, password: false, confirmPassword: false });

  const emailRegex = /^\S+@\S+\.\S+$/;
  const usernameError = touched.username && !username.trim() ? 'Enter a username.' : '';
  const emailError = touched.email && !emailRegex.test(email) ? 'Enter a valid email address.' : '';
  const passwordError = touched.password && password.length < 8 ? 'Password must be at least 8 characters.' : '';
  const confirmPasswordError = touched.confirmPassword && confirmPassword !== password ? 'Passwords do not match.' : '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const nextTouched = { username: true, email: true, password: true, confirmPassword: true };
    setTouched(nextTouched);

    if (!username.trim() || !emailRegex.test(email) || password.length < 8 || confirmPassword !== password) {
      setError('Please correct the highlighted fields before continuing.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.signup(username.trim(), email.trim(), password);
      if (response && response.success) {
        onSignup({ userId: response.user_id, username: response.username, email });
      } else {
        setError(response.detail || 'Unable to create account.');
      }
    } catch (err) {
      setError(err?.message || 'Unable to signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card auth-card--wide">
      <div className="auth-header auth-header--wide">
        <div className="auth-brand-icon">
          <ShieldCheck className="auth-brand-icon__symbol" />
        </div>
        <div>
          <p className="eyebrow">Enterprise Enrollment</p>
          <h1>Create your BrandPulse workspace</h1>
          <p className="subtext">Register with a username and email to access advanced sentiment intelligence, benchmarking, and enterprise analytics.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="auth-form auth-form--wide">
        <label className="form-label">
          Username
          <div className="input-group">
            <span className="input-icon input-icon--left"><User className="icon" /></span>
            <input
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
              placeholder="brand_analyst"
              required
            />
          </div>
          {usernameError && <span className="form-hint text-rose-500">{usernameError}</span>}
        </label>

        <label className="form-label">
          Email
          <div className="input-group">
            <span className="input-icon input-icon--left"><Mail className="icon" /></span>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="analyst@brand.com"
              required
            />
          </div>
          {emailError && <span className="form-hint text-rose-500">{emailError}</span>}
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
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              placeholder="Create a strong password"
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
          {passwordError && <span className="form-hint text-rose-500">{passwordError}</span>}
        </label>

        <label className="form-label">
          Confirm password
          <div className="input-group">
            <span className="input-icon input-icon--left"><Key className="icon" /></span>
            <input
              className="input-field input-field--with-icon"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
              placeholder="Re-enter your password"
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
          {confirmPasswordError && <span className="form-hint text-rose-500">{confirmPasswordError}</span>}
        </label>

        {error && <div className="alert alert-error">{error}</div>}

        <button type="submit" className="btn btn-primary btn-primary--wide inline-flex items-center justify-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
          <ArrowRight className="button-icon" />
        </button>
      </form>

      <div className="auth-footer auth-footer--wide">
        <p className="font-medium text-slate-400">Already have an account?</p>
        <button type="button" className="link-button" onClick={onSwitchToLogin}>Sign in</button>
      </div>
    </div>
  );
}
