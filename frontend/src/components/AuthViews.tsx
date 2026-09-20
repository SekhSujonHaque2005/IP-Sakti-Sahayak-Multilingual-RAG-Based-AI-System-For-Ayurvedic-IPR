import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle2, AlertCircle, Check, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useApp } from '../context/AppContext';
import { forgotPassword, resetPassword } from '../api';
import { GoogleSignInButton } from './GoogleSignInButton';

export function LoginView() {
  const navigate = useNavigate();
  const { login, googleLogin, setDemoMode } = useApp();
  const [email, setEmail] = useState('dr.charu@dravyanidhi.org');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'token' | 'done'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/home');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail.trim());
      setForgotStep('token');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    try {
      await resetPassword(resetToken.trim(), newPassword);
      setForgotStep('done');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password. Please check your token.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-cream border border-greige/80 flex items-center justify-center p-2 mx-auto shadow-warm-sm">
            <img src="/logo-dravya.png" alt="Emblem" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-forest">
            Log in to <span className="text-terracotta italic font-normal">VaidyaSetu</span>
          </h1>
          <p className="text-xs text-forest-muted">
            Access your saved formulations, regulatory maps, and statutory cases.
          </p>
        </div>

        {/* Card */}
        <Card variant="cream" className="p-8 shadow-warm-md border-greige/80">
          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-ayush-danger/10 border border-ayush-danger/30 flex items-start gap-2.5 text-xs text-ayush-danger animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-forest">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-forest-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-xs text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  placeholder="name@organization.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-forest">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgot(true);
                    setForgotStep('email');
                    setForgotError(null);
                  }}
                  className="text-[11px] text-terracotta hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-forest-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-xs text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In to Workspace
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-greige/70"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                <span className="bg-[#FAF7F2] border border-greige/50 rounded-full px-3 py-0.5 text-forest-muted">
                  Or continue with
                </span>
              </div>
            </div>

            <GoogleSignInButton
              mode="signin"
              onSuccess={async (idToken) => {
                setErrorMsg(null);
                await googleLogin(idToken);
                navigate('/home');
              }}
              onError={(err) => setErrorMsg(err)}
              disabled={loading}
            />

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setDemoMode(true);
                  navigate('/home');
                }}
                className="text-xs text-forest-muted hover:text-terracotta underline font-medium"
              >
                Or enter directly as Guest Demo User →
              </button>
            </div>
          </form>
        </Card>

        {/* Signup Redirect */}
        <p className="text-center text-xs text-forest-muted">
          New to VaidyaSetu?{' '}
          <Link to="/signup" className="text-terracotta font-semibold hover:underline">
            Create an account
          </Link>
        </p>

        {/* Forgot Password Dialog */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/40 backdrop-blur-sm animate-in fade-in duration-200">
            <Card variant="off-white" className="max-w-md w-full p-6 space-y-4 border-greige">
              <div className="flex items-center justify-between border-b border-greige/50 pb-3">
                <h3 className="font-serif text-lg font-bold text-forest">
                  Password Recovery
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="text-forest-muted hover:text-forest text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {forgotError && (
                <div className="p-2.5 rounded-xl bg-ayush-danger/10 border border-ayush-danger/30 text-xs text-ayush-danger">
                  {forgotError}
                </div>
              )}

              {forgotStep === 'email' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-forest-muted">
                    Enter your registered email address. We will generate a secure reset token.
                  </p>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-greige bg-white text-xs text-forest"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    loading={forgotLoading}
                    className="w-full"
                  >
                    Request Password Reset
                  </Button>
                </form>
              )}

              {forgotStep === 'token' && (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <p className="text-xs text-forest-muted">
                    Enter the reset token sent to your email and choose a new password.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Paste reset token"
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-greige bg-white text-xs text-forest"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="New password (8+ chars, upper, lower, num, symbol)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-greige bg-white text-xs text-forest"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    loading={forgotLoading}
                    className="w-full"
                  >
                    Update Password
                  </Button>
                </form>
              )}

              {forgotStep === 'done' && (
                <div className="space-y-4 text-center py-2">
                  <CheckCircle2 className="w-10 h-10 text-forest mx-auto" />
                  <p className="text-xs font-semibold text-forest">
                    Password successfully updated! You can now log in with your new password.
                  </p>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowForgot(false)}
                  >
                    Return to Login
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export function SignupView() {
  const navigate = useNavigate();
  const { profile, signup, googleLogin } = useApp();
  const [name, setName] = useState(profile.name || 'Dr. Charu Malhotra');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real-time password criteria validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPass) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('Password does not meet the statutory security requirements.');
      return;
    }

    setLoading(true);
    try {
      await signup(email.trim(), password, name.trim());
      navigate('/onboarding');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-cream border border-greige/80 flex items-center justify-center p-2 mx-auto shadow-warm-sm">
            <img src="/logo-dravya.png" alt="Emblem" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-forest">
            Create an <span className="text-terracotta italic font-normal">Account</span>
          </h1>
          <p className="text-xs text-forest-muted">
            Start structuring your Ayurvedic formulations with full statutory compliance.
          </p>
        </div>

        <Card variant="cream" className="p-8 shadow-warm-md border-greige/80">
          <form onSubmit={handleSignup} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-ayush-danger/10 border border-ayush-danger/30 flex items-start gap-2.5 text-xs text-ayush-danger animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-forest">
                Full Name / Organization
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-xs text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                placeholder="Dr. Charu Malhotra"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-forest">
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-xs text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                placeholder="charu@dravyanidhi.org"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-forest">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-xs text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                placeholder="••••••••"
              />

              {/* Password Requirements Helper Checklist */}
              {password.length > 0 && (
                <div className="p-2.5 mt-1.5 rounded-xl bg-forest/5 border border-forest/10 space-y-1">
                  <p className="text-[10px] font-semibold text-forest uppercase tracking-wider">
                    Password Requirements:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <div className={`flex items-center gap-1 ${hasMinLength ? 'text-forest font-medium' : 'text-forest-muted'}`}>
                      {hasMinLength ? <Check className="w-3 h-3 text-forest" /> : <X className="w-3 h-3 text-forest-muted" />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasUppercase ? 'text-forest font-medium' : 'text-forest-muted'}`}>
                      {hasUppercase ? <Check className="w-3 h-3 text-forest" /> : <X className="w-3 h-3 text-forest-muted" />}
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasLowercase ? 'text-forest font-medium' : 'text-forest-muted'}`}>
                      {hasLowercase ? <Check className="w-3 h-3 text-forest" /> : <X className="w-3 h-3 text-forest-muted" />}
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${hasNumber ? 'text-forest font-medium' : 'text-forest-muted'}`}>
                      {hasNumber ? <Check className="w-3 h-3 text-forest" /> : <X className="w-3 h-3 text-forest-muted" />}
                      <span>Number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1 col-span-2 ${hasSpecial ? 'text-forest font-medium' : 'text-forest-muted'}`}>
                      {hasSpecial ? <Check className="w-3 h-3 text-forest" /> : <X className="w-3 h-3 text-forest-muted" />}
                      <span>Special symbol (@$!%*?&)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-forest">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={e => {
                  setConfirmPass(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-greige bg-[#FAF7F2] text-xs text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-3"
            >
              Register & Continue →
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-greige/70"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                <span className="bg-[#FAF7F2] border border-greige/50 rounded-full px-3 py-0.5 text-forest-muted">
                  Or continue with
                </span>
              </div>
            </div>

            <GoogleSignInButton
              mode="signup"
              onSuccess={async (idToken) => {
                setErrorMsg(null);
                await googleLogin(idToken);
                navigate('/onboarding');
              }}
              onError={(err) => setErrorMsg(err)}
              disabled={loading}
            />
          </form>
        </Card>

        <p className="text-center text-xs text-forest-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-terracotta font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
