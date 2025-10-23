
import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import { UserRole } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

interface LoginModalProps {
  onClose: () => void;
  onLogin: (credentials: LoginCredentials) => void;
  onSignup: (credentials: Omit<LoginCredentials, 'role'>) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, onSignup }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, password, role });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup({ email, password });
  };

  const switchView = (newView: 'login' | 'signup') => {
    setView(newView);
    setEmail('');
    setPassword('');
    setRole('user');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-[#1a4d8c] relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        
        {view === 'login' ? (
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white">Welcome Back!</h3>
            <p className="text-slate-400 mb-6">Enter your credentials to access Moveo.</p>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (e.g., user@example.com)" required />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required autoComplete="current-password" />
              <Select value={role} onChange={e => setRole(e.target.value as UserRole)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
              {role === 'admin' && (
                <div className="text-xs text-sky-200 bg-sky-900/50 p-3 rounded-md text-center leading-relaxed">
                  <p>Use email: <strong className="text-white font-mono">admin@moveo.com</strong></p>
                  <p>Use password: <strong className="text-white font-mono">admin123</strong></p>
                </div>
              )}
              <Button type="submit" variant="accent" className="w-full !py-3">Login</Button>
            </form>
            <p className="mt-4 text-center text-slate-400 text-sm">
              New user?{' '}
              <button onClick={() => switchView('signup')} className="text-sky-300 hover:text-sky-400 font-semibold">
                Create an account
              </button>
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white">Create Account</h3>
            <p className="text-slate-400 mb-6">Join Moveo and start booking your journeys today.</p>
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your Email" required />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Choose a Password" required autoComplete="new-password" />
              <Button type="submit" variant="primary" className="w-full !py-3">Sign Up</Button>
            </form>
            <p className="mt-4 text-center text-slate-400 text-sm">
              Already have an account?{' '}
              <button onClick={() => switchView('login')} className="text-sky-300 hover:text-sky-400 font-semibold">
                Log In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
