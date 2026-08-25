import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('divya@joineazy.dev');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email.trim(), password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 relative overflow-hidden">
      {}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#c1ecd4]/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#d3bcfc]/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 soft-shadow border border-[#e1e3e4] relative z-10">
        {}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#012d1d] flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#012d1d] tracking-tight">Joineazy</h1>
            <p className="text-xs text-[#717973] font-medium">Management System</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#191c1d]">Welcome back</h2>
          <p className="text-xs text-[#717973] mt-1">
            Sign in to access your student or admin workspace
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-[#D90429]/10 border border-[#D90429]/20 rounded-xl text-xs text-[#D90429]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@joineazy.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {}
        <div className="mt-6 pt-6 border-t border-[#f3f4f5]">
          <p className="text-[11px] font-semibold text-[#717973] uppercase tracking-wider text-center mb-3">
            Quick Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('divya@joineazy.dev')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                email === 'divya@joineazy.dev'
                  ? 'border-[#012d1d] bg-[#012d1d]/5 font-semibold text-[#012d1d]'
                  : 'border-[#e1e3e4] hover:bg-[#f8f9fa] text-[#414844]'
              }`}
            >
              <p className="font-bold flex items-center gap-1">
                <User className="w-3 h-3 text-[#2D6A4F]" /> Divya (Leader)
              </p>
              <p className="text-[10px] text-[#717973] truncate">Student</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('prof@joineazy.dev')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                email === 'prof@joineazy.dev'
                  ? 'border-[#012d1d] bg-[#012d1d]/5 font-semibold text-[#012d1d]'
                  : 'border-[#e1e3e4] hover:bg-[#f8f9fa] text-[#414844]'
              }`}
            >
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#012d1d]" /> Prof. Alexander
              </p>
              <p className="text-[10px] text-[#717973] truncate">Admin</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('aarav@joineazy.dev')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                email === 'aarav@joineazy.dev'
                  ? 'border-[#012d1d] bg-[#012d1d]/5 font-semibold text-[#012d1d]'
                  : 'border-[#e1e3e4] hover:bg-[#f8f9fa] text-[#414844]'
              }`}
            >
              <p className="font-bold">Aarav Patel</p>
              <p className="text-[10px] text-[#717973] truncate">Student (Member)</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('riya@joineazy.dev')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                email === 'riya@joineazy.dev'
                  ? 'border-[#012d1d] bg-[#012d1d]/5 font-semibold text-[#012d1d]'
                  : 'border-[#e1e3e4] hover:bg-[#f8f9fa] text-[#414844]'
              }`}
            >
              <p className="font-bold">Riya Sen</p>
              <p className="text-[10px] text-[#717973] truncate">Student (Team Beta)</p>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#717973]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#012d1d] hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
