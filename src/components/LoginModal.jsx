import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sprout 
} from 'lucide-react';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();

  const [authMode, setAuthMode] = useState('phone'); // 'phone' | 'email'
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState('enter_identifier'); // 'enter_identifier' | 'enter_otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  // Status state: 'idle' | 'sending' | 'sent' | 'verifying' | 'success' | 'error'
  const [statusState, setStatusState] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);
  const otpInputRefs = useRef([]);

  // Clear states when modal opens/closes
  useEffect(() => {
    if (!isLoginModalOpen) {
      setStep('enter_identifier');
      setIdentifier('');
      setOtp(['', '', '', '', '', '']);
      setStatusState('idle');
      setStatusMessage('');
      setCooldown(0);
    }
  }, [isLoginModalOpen]);

  // Cooldown timer ticker
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isLoginModalOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId) {
      setStatusState('error');
      setStatusMessage('Please enter your mobile number or email address.');
      return;
    }

    setStatusState('sending');
    setStatusMessage('Sending OTP...');

    try {
      const res = await api.sendOtp(cleanId);
      setStatusState('sent');
      setStatusMessage('OTP sent successfully');
      setStep('enter_otp');
      setCooldown(res.cooldown_seconds || 60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      }, 100);
    } catch (err) {
      setStatusState('error');
      const errText = err.message || 'Unable to send OTP';
      setStatusMessage(errText.startsWith('Unable to send OTP') ? errText : `Unable to send OTP: ${errText}`);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setStatusState('sending');
    setStatusMessage('Sending OTP...');
    try {
      const res = await api.resendOtp(identifier.trim());
      setStatusState('sent');
      setStatusMessage('OTP sent successfully');
      setCooldown(res.cooldown_seconds || 60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setStatusState('error');
      const errText = err.message || 'Unable to send OTP';
      setStatusMessage(errText.startsWith('Unable to send OTP') ? errText : `Unable to send OTP: ${errText}`);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, auto-verify
    const completeOtp = newOtp.join('');
    if (completeOtp.length === 6) {
      handleVerifyOtp(completeOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      handleVerifyOtp(pasteData);
    }
  };

  const handleVerifyOtp = async (codeToVerify) => {
    const finalOtp = codeToVerify || otp.join('');
    if (finalOtp.length !== 6) {
      setStatusState('error');
      setStatusMessage('Please enter complete 6-digit OTP');
      return;
    }

    setStatusState('verifying');
    setStatusMessage('Verifying OTP...');

    try {
      const res = await api.verifyOtp(identifier.trim(), finalOtp);
      setStatusState('success');
      setStatusMessage('Login successful');
      setTimeout(() => {
        login(res.access_token, res.user);
      }, 700);
    } catch (err) {
      setStatusState('error');
      const errMsg = err.message || 'Invalid OTP';
      if (errMsg.toLowerCase().includes('expired')) {
        setStatusMessage('OTP expired');
      } else if (errMsg.toLowerCase().includes('invalid')) {
        setStatusMessage(errMsg);
      } else {
        setStatusMessage(errMsg);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-6 text-white text-center relative">
          <button
            onClick={closeLoginModal}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md mb-3">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sahayak AI (सहायक AI)</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Sign in for Grounded Farm & Cooperative Assistance
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'enter_identifier' ? (
            <div>
              {/* Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthMode('phone'); setIdentifier(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    authMode === 'phone' 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  Mobile Number (मोबाइल नंबर)
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('email'); setIdentifier(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    authMode === 'email' 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Address (ईमेल)
                </button>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {authMode === 'phone' ? '10-Digit Mobile Number' : 'Registered Email Address'}
                  </label>
                  <div className="relative">
                    {authMode === 'phone' ? (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-medium">
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="flex-1 w-full px-3.5 py-2.5 rounded-r-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                          autoFocus
                          required
                        />
                      </div>
                    ) : (
                      <input
                        type="email"
                        placeholder="farmer@example.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                        autoFocus
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Status Message */}
                {statusState === 'error' && (
                  <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={statusState === 'sending' || !identifier.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {statusState === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Verification Code (OTP भेजें)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div>
              {/* Step 2: OTP Entry */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Enter Verification Code</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  We have sent a 6-digit OTP to <span className="font-medium text-slate-800">{identifier}</span>
                </p>
                <button
                  type="button"
                  onClick={() => { setStep('enter_identifier'); setStatusState('idle'); }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline mt-1"
                >
                  Change number/email
                </button>
              </div>

              {/* 6-box OTP Input */}
              <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e.target.value ? e : e)}
                    className="w-11 h-12 text-center text-lg font-bold text-slate-900 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                ))}
              </div>

              {/* Status Alert Banner */}
              {statusState === 'sent' && (
                <div className="flex items-center gap-2 p-2.5 mb-4 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>OTP sent successfully</span>
                </div>
              )}

              {statusState === 'verifying' && (
                <div className="flex items-center justify-center gap-2 p-2.5 mb-4 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600 flex-shrink-0" />
                  <span>Verifying OTP...</span>
                </div>
              )}

              {statusState === 'success' && (
                <div className="flex items-center justify-center gap-2 p-2.5 mb-4 text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">Login successful! Redirecting...</span>
                </div>
              )}

              {statusState === 'error' && (
                <div className="flex items-center gap-2 p-2.5 mb-4 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => handleVerifyOtp(otp.join(''))}
                disabled={statusState === 'verifying' || otp.join('').length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-3"
              >
                {statusState === 'verifying' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Proceed (सत्यापित करें)</span>
                )}
              </button>

              {/* Resend Cooldown */}
              <div className="text-center pt-1">
                {cooldown > 0 ? (
                  <p className="text-xs text-slate-500 font-medium">
                    Resend OTP in <span className="text-emerald-700 font-semibold">{cooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resend OTP (पुनः OTP भेजें)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Trust / Security notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Government Guidelines Grounded Security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
