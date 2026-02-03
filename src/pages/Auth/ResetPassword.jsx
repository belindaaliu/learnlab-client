import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });

  useEffect(() => {
    console.log('🔍 Token from URL:', token);
    console.log('🔍 Full URL:', window.location.href);
    console.log('🔍 Search params:', searchParams.toString());
    
    if (!token) {
      console.error('❌ No token found in URL');
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      console.log('✅ Token found:', token.substring(0, 20) + '...');
    }
  }, [token, searchParams]);

  // ... rest of password strength logic ...

  useEffect(() => {
    const password = formData.newPassword;
    let score = 0;
    let feedback = '';

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (password.length === 0) {
      feedback = '';
    } else if (score <= 2) {
      feedback = 'Weak';
    } else if (score === 3) {
      feedback = 'Fair';
    } else if (score === 4) {
      feedback = 'Good';
    } else {
      feedback = 'Strong';
    }

    setPasswordStrength({ score, feedback });
  }, [formData.newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    console.log('🚀 Submitting password reset with token:', token?.substring(0, 20) + '...');

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword: formData.newPassword,
      });
      
      console.log('✅ Password reset successful:', response.data);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('❌ Password reset error:', err.response?.data);
      setError(
        err.response?.data?.message || 'Failed to reset password. The link may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-decoration">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        
        <div className="auth-card">
          <div className="auth-header">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                <path d="M32 20V36M32 44V46" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h1>Invalid reset link</h1>
            <p>This password reset link is invalid or has expired.</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1rem' }}>
              Debug: No token found in URL
            </p>
          </div>

          <div className="auth-footer">
            <Link to="/forgot-password" className="btn-primary">Request new link</Link>
            <Link to="/login" className="back-home">← Back to login</Link>
          </div>
        </div>
      </div>
    );
  }

  // ... rest of the component (success state and form) stays the same ...
  
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-decoration">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        
        <div className="auth-card">
          <div className="auth-header">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2"/>
                <path d="M20 32L28 40L44 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>Password reset successful!</h1>
            <p>Your password has been successfully reset. You can now log in with your new password.</p>
          </div>

          <div className="auth-footer">
            <Link to="/login" className="btn-primary">Continue to login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-decoration">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 5L35 15V25L20 35L5 25V15L20 5Z" fill="currentColor" opacity="0.2"/>
              <path d="M20 5L35 15M20 5L5 15M20 5V35M35 15V25M35 15L20 35M5 15V25M5 15L20 35M35 25L20 35M5 25L20 35" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>LearnLab</span>
          </div>
          <h1>Create new password</h1>
          <p>Enter a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 4V9M8 11V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="••••••••"
              required
              minLength={8}
              autoFocus
            />
            {formData.newPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill strength-${passwordStrength.score}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                <span className={`strength-text strength-${passwordStrength.score}`}>
                  {passwordStrength.feedback}
                </span>
              </div>
            )}
            <small className="form-hint">Must be at least 8 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
              minLength={8}
            />
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <small className="form-error">Passwords do not match</small>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || formData.newPassword !== formData.confirmPassword}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Resetting password...
              </>
            ) : 'Reset password'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="back-home">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;