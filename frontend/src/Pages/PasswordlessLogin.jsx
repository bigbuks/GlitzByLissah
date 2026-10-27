import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { notify } from '../utils/notify';
import api from '../utils/api';
import { useWishlist } from '../context/WishlistContext';

const PasswordlessLogin = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { mergeGuestWishlist, fetchWishlist } = useWishlist();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email });
      setStep('otp');
      notify.success('Code sent! Check your email.');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await api.post('/auth/send-otp', { email });
      notify.success('New code sent!');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Merge guest wishlist
        await mergeGuestWishlist();
        await fetchWishlist();

        notify.success('Logged in successfully!');
        navigate('/');
      }
    } catch (err) {
      notify.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full card-warm p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition mb-6"
        >
          <FiArrowLeft size={18} />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-800">
            GlitzByLissah
          </h1>
          <div className="mx-auto my-4 h-px w-16 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
          <p className="text-gray-500">
            {step === 'email'
              ? 'Enter your email to continue or create an account'
              : `We sent a code to ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition disabled:bg-cream-deep/60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit button with spinner */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-gray-900 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition shadow-warm hover:shadow-warm-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-gray-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Sending code...
                </>
              ) : (
                'Continue'
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              No password needed. We'll email you a verification code.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                maxLength="6"
                disabled={loading}
                className="w-full px-4 py-4 border border-yellow-500/15 rounded-xl text-center text-2xl tracking-[0.5em] font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition disabled:bg-cream-deep/60"
              />
            </div>

            {/* Verify button with spinner */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-yellow-500 text-gray-900 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition shadow-warm hover:shadow-warm-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-gray-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify & Sign In'
              )}
            </button>

            {/* Resend button with spinner */}
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending || loading}
                className="text-sm text-yellow-600 hover:text-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 mx-auto"
              >
                {resending ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Didn't get it? Resend code"
                )}
              </button>
              <br />
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                }}
                disabled={loading}
                className="text-sm text-gray-500 hover:text-yellow-600 transition disabled:opacity-50"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordlessLogin;