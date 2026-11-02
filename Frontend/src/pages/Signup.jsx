import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { ThemeToggle } from '../components/ThemeProvider';
import BrandLogo from '../components/BrandLogo';

const schema = z.object({ firstName: z.string().min(3, 'Name must be at least 3 characters'), emailID: z.string().email('Enter a valid email address'), password: z.string().min(8, 'Password must be at least 8 characters') });

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated, navigate]);

  return <div className="auth-page">
    <aside className="auth-aside"><BrandLogo variant="full" showName={false} imageClassName="auth-brand-logo" /><div><p className="eyebrow">Start building momentum</p><h1>Get better at the craft, one challenge at a time.</h1><p>Join a community of curious developers sharpening their problem-solving skills.</p></div><span style={{ color: '#A1A1AA', fontSize: 12 }}>CodeArena · Learn by doing</span></aside>
    <main className="auth-main"><div style={{ position: 'absolute', top: 18, right: 18 }}><ThemeToggle /></div><section className="auth-card"><p className="eyebrow">Create your account</p><h2>Join CodeArena</h2><p>Your next coding breakthrough starts here.</p>
      {error && <div className="form-error" role="alert" style={{ marginBottom: 14 }}>{error}</div>}
      <form onSubmit={handleSubmit((data) => dispatch(registerUser(data)))}>
        <div className="form-field"><label htmlFor="firstName">First name</label><input id="firstName" type="text" autoComplete="given-name" placeholder="Alex" className="field" {...register('firstName')} />{errors.firstName && <span className="form-error">{errors.firstName.message}</span>}</div>
        <div className="form-field"><label htmlFor="emailID">Email address</label><input id="emailID" type="email" autoComplete="email" placeholder="you@example.com" className="field" {...register('emailID')} />{errors.emailID && <span className="form-error">{errors.emailID.message}</span>}</div>
        <div className="form-field"><label htmlFor="password">Password</label><div style={{ position: 'relative' }}><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" className="field" style={{ width: '100%', paddingRight: 43 }} {...register('password')} /><button type="button" className="icon-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 4, top: 3, border: 0 }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.password && <span className="form-error">{errors.password.message}</span>}</div>
        <button className="primary-button" style={{ width: '100%', marginTop: 8 }} type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
      </form><div className="auth-footer">Already have an account? <NavLink to="/login" className="text-link">Sign in</NavLink></div>
    </section></main>
  </div>;
}
