import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, ArrowLeft, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  reason?: string;
  showToast: (msg: string) => void;
}

type AuthMethod = 'select' | 'google' | 'email' | 'otp' | 'otp_verify';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reason,
  showToast,
}) => {
  const [method, setMethod] = useState<AuthMethod>('select');
  const [error, setError] = useState<string>('');

  // Mobile OTP state
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(0);

  // Email state
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');

  // Google state
  const [googleEmail, setGoogleEmail] = useState<string>('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMethod('select');
      setError('');
      setMobileNumber('');
      setOtpCode(['', '', '', '', '', '']);
      setEmailAddress('');
      setPassword('');
      setFullName('');
      setGoogleEmail('');
    }
  }, [isOpen]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // 1. Google Auth Handler
  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = googleEmail.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    const namePart = email.split('@')[0];
    const formattedName = namePart
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const authenticatedUser: UserProfile = {
      id: `usr_g_${Date.now()}`,
      name: formattedName || 'Google User',
      email: email,
      phone: '',
      city: '',
    };

    completeLogin(authenticatedUser, `Logged in as ${authenticatedUser.email}`);
  };

  // 2. Email Auth Handler
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = emailAddress.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const derivedName = fullName.trim() || email.split('@')[0].replace(/[._-]/g, ' ');
    const authenticatedUser: UserProfile = {
      id: `usr_e_${Date.now()}`,
      name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
      email: email,
      phone: '',
      city: '',
    };

    completeLogin(authenticatedUser, `Signed in with ${authenticatedUser.email}`);
  };

  // 3. Mobile OTP Request Handler
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleaned = mobileNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!/^[6-9]/.test(cleaned)) {
      setError('Mobile number must start with 6, 7, 8, or 9.');
      return;
    }

    // Generate real 6-digit random code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setResendTimer(30);
    setMethod('otp_verify');
    showToast(`Verification code sent to +91 ${cleaned}: ${randomCode}`);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setResendTimer(30);
    showToast(`New verification code: ${randomCode}`);
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpCode];
    updated[index] = digit;
    setOtpCode(updated);

    // Auto-focus next input
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // 4. Mobile OTP Verify Handler
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    if (entered !== generatedOtp) {
      setError('Invalid verification code. Please check the code and try again.');
      return;
    }

    const authenticatedUser: UserProfile = {
      id: `usr_m_${Date.now()}`,
      name: `User +91 ${mobileNumber.slice(-4)}`,
      email: '',
      phone: mobileNumber,
      city: '',
    };

    completeLogin(authenticatedUser, `Verified mobile +91 ${mobileNumber}`);
  };

  // Common Login Finalizer
  const completeLogin = (user: UserProfile, successMsg: string) => {
    try {
      localStorage.setItem('quke_is_logged_in', 'true');
      localStorage.setItem('quke_user_session', JSON.stringify(user));
      localStorage.setItem('quke_user_profile', JSON.stringify(user));
    } catch (err) {
      console.error('Failed saving auth session:', err);
    }
    showToast(successMsg);
    onSuccess(user);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 max-w-[390px] mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                {method !== 'select' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMethod('select');
                      setError('');
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#001f3f] hover:bg-gray-100 transition-colors mr-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-center">
                  <img
                    src="/qukebasket-logo.svg"
                    alt="QukeBasket"
                    className="h-6 w-auto max-w-[130px] object-contain select-none"
                  />
                </div>
              </div>

              <button
                type="button"
                id="btn-close-login-modal"
                onClick={onClose}
                aria-label="Close login dialog"
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification banner if prompted by order or custom reason */}
            {reason && (
              <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center gap-2 text-xs text-[#001f3f] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#FF8C00] shrink-0" />
                <span>{reason}</span>
              </div>
            )}

            {/* Content Area */}
            <div className="p-5 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                  {error}
                </div>
              )}

              {/* METHOD SELECTOR */}
              {method === 'select' && (
                <div className="space-y-4">
                  <div className="text-center pb-1">
                    <h3 className="text-base font-extrabold text-[#001f3f]">Login or Sign Up</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Choose your preferred sign-in method to continue
                    </p>
                  </div>

                  {/* 1. Continue with Google */}
                  <button
                    type="button"
                    id="btn-auth-google"
                    onClick={() => {
                      setMethod('google');
                      setError('');
                    }}
                    className="w-full py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-bold text-xs text-[#001f3f] flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.15C3.27 21.36 7.35 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.23 0 10.06 0 12s.46 3.77 1.26 5.39l4.01-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* 2. Continue with Mobile OTP */}
                  <button
                    type="button"
                    id="btn-auth-mobile"
                    onClick={() => {
                      setMethod('otp');
                      setError('');
                    }}
                    className="w-full py-3 px-4 bg-[#001f3f] hover:bg-[#002d5c] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Phone className="w-4 h-4 text-[#FF8C00]" />
                    <span>Continue with Mobile OTP</span>
                  </button>

                  {/* 3. Continue with Email */}
                  <button
                    type="button"
                    id="btn-auth-email"
                    onClick={() => {
                      setMethod('email');
                      setError('');
                    }}
                    className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#001f3f] rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>Continue with Email</span>
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      By continuing, you agree to QukeBasket's Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              )}

              {/* GOOGLE SIGN IN SCREEN */}
              {method === 'google' && (
                <form onSubmit={handleGoogleSubmit} className="space-y-4">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.15C3.27 21.36 7.35 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.23 0 10.06 0 12s.46 3.77 1.26 5.39l4.01-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-extrabold text-[#001f3f]">Sign in with Google</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Enter your Google Account email to proceed</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#001f3f] mb-1">
                      Google Email Address *
                    </label>
                    <input
                      type="email"
                      id="input-google-email"
                      required
                      placeholder="yourname@gmail.com"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#001f3f]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Continue with Google
                  </button>
                </form>
              )}

              {/* MOBILE OTP: STEP 1 (ENTER PHONE) */}
              {method === 'otp' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF8C00] flex items-center justify-center mx-auto mb-2">
                      <Phone className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-[#001f3f]">Verify Mobile Number</h3>
                    <p className="text-xs text-gray-400 mt-0.5">We will send a 6-digit OTP to your number</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#001f3f] mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-[#001f3f] select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        id="input-mobile-number"
                        maxLength={10}
                        required
                        placeholder="Enter mobile number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="flex-1 px-3.5 py-2.5 text-xs border border-gray-200 rounded-r-xl focus:outline-none focus:border-[#001f3f]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-send-otp"
                    className="w-full py-3 bg-[#FF8C00] hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Get Verification OTP
                  </button>
                </form>
              )}

              {/* MOBILE OTP: STEP 2 (VERIFY CODE) */}
              {method === 'otp_verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-[#001f3f]">Enter 6-Digit OTP</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Code sent to <span className="font-bold text-[#001f3f]">+91 {mobileNumber}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setMethod('otp')}
                      className="text-[11px] text-[#FF8C00] font-semibold hover:underline mt-0.5 cursor-pointer"
                    >
                      Edit mobile number
                    </button>
                  </div>

                  {/* 6-box input */}
                  <div className="flex justify-center gap-2">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 h-11 text-center text-base font-black text-[#001f3f] border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF8C00] focus:ring-1 focus:ring-[#FF8C00]"
                      />
                    ))}
                  </div>

                  {/* Quick-fill helper code button if available */}
                  {generatedOtp && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setOtpCode(generatedOtp.split(''))}
                        className="text-[11px] font-medium text-gray-500 hover:text-[#001f3f] bg-gray-50 px-2 py-1 rounded border border-gray-200 cursor-pointer"
                      >
                        Auto-fill code: <span className="font-bold text-[#001f3f]">{generatedOtp}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-400">Didn't receive code?</span>
                    {resendTimer > 0 ? (
                      <span className="text-gray-400 font-medium">Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-bold text-[#FF8C00] hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="btn-verify-otp"
                    className="w-full py-3 bg-[#001f3f] hover:bg-[#FF8C00] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Verify & Continue
                  </button>
                </form>
              )}

              {/* EMAIL SIGN IN SCREEN */}
              {method === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-[#001f3f] flex items-center justify-center mx-auto mb-2">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-[#001f3f]">Continue with Email</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Sign in to your account</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#001f3f] mb-1">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="input-email-name"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#001f3f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#001f3f] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="input-email-address"
                      required
                      placeholder="name@example.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#001f3f]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#001f3f] mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="input-email-password"
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#001f3f]"
                    />
                  </div>

                  <button
                    type="submit"
                    id="btn-submit-email"
                    className="w-full py-3 bg-[#001f3f] hover:bg-[#FF8C00] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm mt-2"
                  >
                    Sign In
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
