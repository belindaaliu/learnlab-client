import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      console.log('Forgot password response:', response.data);
      
      // TEMPORARY: Log the token for testing
      if (response.data.resetToken) {
        console.log('Reset token:', response.data.resetToken);
        console.log('Reset link:', `${window.location.origin}/reset-password?token=${response.data.resetToken}`);
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen - shown AFTER email is submitted
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
            <h1>Check your email</h1>
            <p>If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.</p>
          </div>

          <div className="auth-info">
            <div className="info-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 5V10L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>The link will expire in 1 hour</span>
            </div>
            <div className="info-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 7L10 12L17 7M3 7V15C3 15.5523 3.44772 16 4 16H16C16.5523 16 17 15.5523 17 15V7M3 7L10 4L17 7" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Check your spam folder if you don't see it</span>
            </div>
          </div>

          <div className="auth-footer">
            <p>Didn't receive the email? <button onClick={() => setSuccess(false)} className="link-button">Try again</button></p>
            <Link to="/login" className="back-home">← Back to login</Link>
          </div>
        </div>
      </div>
    );
  }

  // Email input form - shown FIRST
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
          <h1>Reset your password</h1>
          <p>Enter your email address and we'll send you a link to reset your password</p>
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
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : 'Send reset link'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="back-home">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;