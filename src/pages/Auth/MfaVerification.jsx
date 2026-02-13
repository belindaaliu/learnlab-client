import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Shield, Mail, Smartphone, Key, Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function MfaVerification() {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [mfaMethods, setMfaMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [apiTimeout, setApiTimeout] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from location state or sessionStorage as fallback
  const email = location.state?.email || sessionStorage.getItem('mfaEmail');
  const userId = location.state?.userId || sessionStorage.getItem('mfaUserId');
  const tempToken = location.state?.tempToken || sessionStorage.getItem('mfaTempToken');
  const methodsFromState = location.state?.methods || 
    (sessionStorage.getItem('mfaMethods') ? JSON.parse(sessionStorage.getItem('mfaMethods')) : null);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Set a timeout for the initial loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (initialLoading) {
        setApiTimeout(true);
        setInitialLoading(false);
        setError("Request timed out. Please check your connection and try again.");
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [initialLoading]);

  useEffect(() => {
    // Check if we have the required data
    if (!email || !userId) {
      setError("Missing login information. Please login again.");
      setInitialLoading(false);
      return;
    }

    // If methods were provided in state, use them directly
    if (methodsFromState && methodsFromState.length > 0) {
      const methods = methodsFromState.map(m => {
        if (typeof m === 'string') {
          // Handle array of strings
          return {
            type: m,
            icon: m === 'email' ? Mail : m === 'sms' ? Smartphone : Key,
            label: m === 'email' ? 'Email' : m === 'sms' ? 'SMS' : 'Authenticator App'
          };
        } else {
          // Handle object format
          return {
            type: m.type,
            icon: m.type === 'email' ? Mail : m.type === 'sms' ? Smartphone : Key,
            label: m.type === 'email' ? 'Email' : m.type === 'sms' ? 'SMS' : 'Authenticator App'
          };
        }
      });
      
      setMfaMethods(methods);
      if (methods.length > 0) {
        setSelectedMethod(methods[0].type);
      }
      setInitialLoading(false);
      return;
    }

    // Otherwise fetch from API
    fetchUserMfaMethods();
  }, []);

  // Countdown timer for code resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchUserMfaMethods = async () => {
    setInitialLoading(true);
    setApiTimeout(false);
    
    try {
      const res = await axios.post(`${API_URL}/auth/user-mfa-methods`, {
        userId,
        email,
      });
      
      const methods = [];
      if (res.data.data?.email?.enabled) {
        methods.push({ type: 'email', icon: Mail, label: 'Email' });
      }
      if (res.data.data?.sms?.enabled) {
        methods.push({ type: 'sms', icon: Smartphone, label: 'SMS' });
      }
      if (res.data.data?.authenticator?.enabled) {
        methods.push({ type: 'authenticator', icon: Key, label: 'Authenticator App' });
      }
      
      setMfaMethods(methods);
      
      // Auto-select first method and send code if email/sms
      if (methods.length > 0) {
        setSelectedMethod(methods[0].type);
        if (methods[0].type !== 'authenticator') {
          resendCode(methods[0].type);
        }
      } else {
        setError("No MFA methods found for this account.");
      }
    } catch (err) {
      console.error("Failed to fetch MFA methods:", err);
      setError(err.response?.data?.message || "Failed to load security settings. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  };

  const resendCode = async (method) => {
    setCountdown(60);
    setError("");
    
    try {
      await axios.post(`${API_URL}/auth/resend-mfa-code`, {
        userId,
        method,
      });
    } catch (err) {
      console.error("Failed to resend code:", err);
      setError("Failed to send verification code. Please try again.");
      setCountdown(0);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/auth/verify-mfa`, {
        userId,
        code: verificationCode,
        method: selectedMethod,
        tempToken,
      });

      // Store tokens
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("token", res.data.accessToken); // For compatibility
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Clear MFA session data
      sessionStorage.removeItem('mfaTempToken');
      sessionStorage.removeItem('mfaUserId');
      sessionStorage.removeItem('mfaEmail');
      sessionStorage.removeItem('mfaMethods');

      // Redirect based on role
      const userRole = res.data.user.role;
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "instructor") {
        navigate("/instructor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Clear any stored MFA data
    sessionStorage.removeItem('mfaTempToken');
    sessionStorage.removeItem('mfaUserId');
    sessionStorage.removeItem('mfaEmail');
    sessionStorage.removeItem('mfaMethods');
    navigate("/login");
  };

  // Show initial loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          {apiTimeout ? (
            <>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Timeout</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleBackToLogin}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition"
              >
                Back to Login
              </button>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Loading security verification...</p>
              <p className="text-sm text-gray-400 mt-2">This should only take a moment</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show error if no methods
  if (mfaMethods.length === 0 && !initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Verify</h2>
          <p className="text-gray-600 mb-6">{error || "No MFA methods configured for this account."}</p>
          <button
            onClick={handleBackToLogin}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the verification code for <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        {/* Method Selection */}
        {mfaMethods.length > 1 && (
          <div className="flex gap-2 justify-center">
            {mfaMethods.map((method) => (
              <button
                key={method.type}
                onClick={() => {
                  setSelectedMethod(method.type);
                  setVerificationCode("");
                  setError("");
                  if (method.type !== 'authenticator') {
                    resendCode(method.type);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  selectedMethod === method.type
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <method.icon className="w-4 h-4" />
                {method.label}
              </button>
            ))}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-center text-2xl tracking-widest font-mono"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </button>
          </div>

          {selectedMethod && selectedMethod !== 'authenticator' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => resendCode(selectedMethod)}
                disabled={countdown > 0 || loading}
                className="text-sm text-primary hover:text-primaryHover disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1 mx-auto"
              >
                <RefreshCw className={`w-3 h-3 ${countdown > 0 ? 'animate-spin' : ''}`} />
                {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
              </button>
            </div>
          )}

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}