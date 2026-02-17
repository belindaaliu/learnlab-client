import { useState, useEffect } from "react";
import axios from "axios";
import ProfileSidebar from "../../components/ProfileSidebar";
import {
  Shield,
  Key,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  QrCode as QrCodeIcon,
} from "lucide-react";

export default function AccountSecurity() {
  const [activeTab, setActiveTab] = useState("password");
  const [loading, setLoading] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [qrCodeLib, setQrCodeLib] = useState(null);
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // MFA state
  const [mfaSettings, setMfaSettings] = useState({
    email: { enabled: false, verified: false },
    authenticator: { enabled: false, verified: false, secret: "" },
  });
  
  const [selectedMfaType, setSelectedMfaType] = useState(null);
  const [setupStep, setSetupStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [mfaError, setMfaError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token || localStorage.getItem("accessToken");

  // Dynamically import qrcode
  useEffect(() => {
    import('qrcode').then((module) => {
      setQrCodeLib(module.default);
    }).catch(err => {
      console.error('Failed to load qrcode library:', err);
    });
  }, []);

  // Toast helper
  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Fetch MFA settings on mount
  useEffect(() => {
    fetchMfaSettings();
  }, []);

  const fetchMfaSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/mfa/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMfaSettings(res.data.data);
    } catch (err) {
      console.error("Error fetching MFA settings:", err);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast("All fields are required", "error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showToast("Password must be at least 8 characters long", "error");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Password change error:", err);
      showToast(
        err.response?.data?.message || "Failed to change password",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Start MFA setup
  const startMfaSetup = async (type) => {
    setSelectedMfaType(type);
    setMfaError("");
    
    if (type === "email") {
      try {
        setMfaLoading(true);
        const response = await axios.post(
          `${API_URL}/users/mfa/send-verification`,
          { type: "email" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // For development - if API returns devCode, show it
        if (response.data.devCode) {
          console.log(`📧 Email verification code: ${response.data.devCode}`);
          showToast(`Dev mode - Code: ${response.data.devCode}`, "success");
        }
        
        setSetupStep(2); // Go directly to verification step
      } catch (err) {
        setMfaError(err.response?.data?.message || "Failed to send verification");
      } finally {
        setMfaLoading(false);
      }
    } else if (type === "authenticator") {
      try {
        setMfaLoading(true);
        const res = await axios.post(
          `${API_URL}/users/mfa/setup-authenticator`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setSecretKey(res.data.data.secret);
        
        // Generate QR code
        if (qrCodeLib) {
          const otpauth = `otpauth://totp/LMS:${user.email}?secret=${res.data.data.secret}&issuer=LMS`;
          const qrCode = await qrCodeLib.toDataURL(otpauth);
          setQrCodeUrl(qrCode);
        } else {
          // Try to import again if not loaded
          try {
            const qrcode = await import('qrcode');
            const otpauth = `otpauth://totp/LMS:${user.email}?secret=${res.data.data.secret}&issuer=LMS`;
            const qrCode = await qrcode.default.toDataURL(otpauth);
            setQrCodeUrl(qrCode);
          } catch (qrError) {
            console.error('QR Code generation failed:', qrError);
          }
        }
        setSetupStep(2);
      } catch (err) {
        setMfaError(err.response?.data?.message || "Failed to setup authenticator");
      } finally {
        setMfaLoading(false);
      }
    }
  };

  // Verify MFA code
  const verifyMfaCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMfaError("Please enter a valid 6-digit code");
      return;
    }

    setMfaLoading(true);
    try {
      const payload = {
        type: selectedMfaType,
        code: verificationCode,
      };

      if (selectedMfaType === "authenticator") {
        payload.secret = secretKey;
      }

      await axios.post(
        `${API_URL}/users/mfa/verify`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast(`${selectedMfaType === "email" ? "Email" : "Authenticator App"} MFA enabled successfully!`);
      
      await fetchMfaSettings();
      
      // Reset state
      setSetupStep(1);
      setSelectedMfaType(null);
      setVerificationCode("");
      setSecretKey("");
      setQrCodeUrl("");
    } catch (err) {
      setMfaError(err.response?.data?.message || "Verification failed");
    } finally {
      setMfaLoading(false);
    }
  };

  // Disable MFA method
  const disableMfa = async (type) => {
    if (!confirm(`Are you sure you want to disable ${type === "email" ? "Email" : "Authenticator App"} MFA?`)) {
      return;
    }

    try {
      await axios.post(
        `${API_URL}/users/mfa/disable`,
        { type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast(`${type === "email" ? "Email" : "Authenticator App"} MFA disabled`);
      await fetchMfaSettings();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to disable MFA", "error");
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  };

  const tabs = [
    { id: "password", label: "Password", icon: Key },
    { id: "mfa", label: "Two-Factor Authentication", icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto flex bg-gray-50/50">
      <ProfileSidebar />

      <div className="flex-1 px-8 lg:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Account Security
              </h1>
              <p className="text-gray-500 mt-1">
                Manage your password and two-factor authentication settings
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
              Change Password
            </h2>

            <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {passwordForm.newPassword && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          passwordForm.newPassword.length >= level * 2
                            ? passwordForm.newPassword.length > 6
                              ? "bg-green-500"
                              : "bg-yellow-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Password strength:{" "}
                    {passwordForm.newPassword.length < 4
                      ? "Weak"
                      : passwordForm.newPassword.length < 8
                      ? "Medium"
                      : "Strong"}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primaryHover hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Change Password
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* MFA Tab */}
        {activeTab === "mfa" && (
          <div className="space-y-6">
            {/* Current MFA Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
                Two-Factor Authentication Methods
              </h2>

              <div className="space-y-4">
                {/* Email MFA */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Email</h3>
                      <p className="text-sm text-gray-500">
                        Receive verification codes via email
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {mfaSettings.email?.enabled ? (
                      <>
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Enabled
                        </span>
                        <button
                          onClick={() => disableMfa("email")}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          Disable
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startMfaSetup("email")}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primaryHover transition"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                </div>

                {/* Authenticator App MFA */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <QrCodeIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Authenticator App</h3>
                      <p className="text-sm text-gray-500">
                        Use Google Authenticator, Authy, or similar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {mfaSettings.authenticator?.enabled ? (
                      <>
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Enabled
                        </span>
                        <button
                          onClick={() => disableMfa("authenticator")}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          Disable
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startMfaSetup("authenticator")}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primaryHover transition"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* MFA Setup Flow */}
            {selectedMfaType && setupStep > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Set up {selectedMfaType === "email" ? "Email" : "Authenticator App"} Authentication
                  </h3>
                  <button
                    onClick={() => {
                      setSetupStep(1);
                      setSelectedMfaType(null);
                      setVerificationCode("");
                      setMfaError("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Setup steps indicator */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step === setupStep
                            ? "bg-primary text-white"
                            : step < setupStep
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {step < setupStep ? <CheckCircle className="w-4 h-4" /> : step}
                      </div>
                      {step < 3 && (
                        <div
                          className={`w-12 h-0.5 ${
                            step < setupStep ? "bg-green-500" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 2: Setup/Scan QR Code */}
                {setupStep === 2 && selectedMfaType === "authenticator" && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mb-4" />
                      ) : (
                        <div className="w-48 h-48 mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                      )}
                      <p className="text-sm text-gray-600 text-center mb-4">
                        Scan this QR code with your authenticator app
                      </p>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <code className="text-sm font-mono">{secretKey}</code>
                        <button
                          onClick={() => copyToClipboard(secretKey)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Or enter this key manually in your app
                      </p>
                    </div>

                    <button
                      onClick={() => setSetupStep(3)}
                      className="w-full bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primaryHover transition"
                    >
                      Next: Verify Code
                    </button>
                  </div>
                )}

                {/* Step 3: Verify Code (for both email and authenticator) */}
                {setupStep === 3 && (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-600">
                      {selectedMfaType === "email"
                        ? "We've sent a verification code to your email. Please enter it below."
                        : "Enter the 6-digit code from your authenticator app"}
                    </p>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition text-center text-2xl tracking-widest font-mono"
                        autoFocus
                      />
                    </div>

                    {mfaError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{mfaError}</span>
                      </div>
                    )}

                    {selectedMfaType === "email" && (
                      <div className="text-center">
                        <button
                          onClick={() => startMfaSetup("email")}
                          disabled={mfaLoading}
                          className="text-sm text-primary hover:text-primaryHover disabled:text-gray-400"
                        >
                          Resend code
                        </button>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSetupStep(selectedMfaType === "authenticator" ? 2 : 1)}
                        className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                      >
                        Back
                      </button>
                      <button
                        onClick={verifyMfaCode}
                        disabled={mfaLoading || verificationCode.length !== 6}
                        className="flex-1 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primaryHover hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {mfaLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify & Enable"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">
                    Why enable two-factor authentication?
                  </h4>
                  <p className="text-sm text-blue-700">
                    Two-factor authentication adds an extra layer of security to your account.
                    Even if someone steals your password, they won't be able to access your
                    account without the second factor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}