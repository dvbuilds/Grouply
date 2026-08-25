import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { GraduationCap, Mail, Lock, User, IdCard, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill out all required fields');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        student_id: role === 'student' ? studentId.trim() || undefined : undefined,
      });

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.details?.[0]?.message ||
          err.response?.data?.error ||
          'Registration failed. Please check your information.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#c1ecd4]/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#d3bcfc]/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 soft-shadow border border-[#e1e3e4] relative z-10 my-8">
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
          <h2 className="text-xl font-bold text-[#191c1d]">Create an Account</h2>
          <p className="text-xs text-[#717973] mt-1">
            Join your student cohort or access professor administration
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-[#D90429]/10 border border-[#D90429]/20 rounded-xl text-xs text-[#D90429]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#414844]">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#f3f4f5] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === 'student'
                    ? 'bg-white text-[#012d1d] shadow-xs'
                    : 'text-[#717973] hover:text-[#191c1d]'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === 'admin'
                    ? 'bg-white text-[#012d1d] shadow-xs'
                    : 'text-[#717973] hover:text-[#191c1d]'
                }`}
              >
                Professor / Admin
              </button>
            </div>
          </div>

          <Input
            label="Full Name"
            placeholder="e.g. Andrea Brown"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={User}
            required
            autoFocus
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@joineazy.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          {role === 'student' && (
            <Input
              label="Student ID"
              placeholder="e.g. STU-1005"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              icon={IdCard}
              helperText="Assigned campus identification number"
            />
          )}

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
            <span>Register Account</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-[#717973]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#012d1d] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
