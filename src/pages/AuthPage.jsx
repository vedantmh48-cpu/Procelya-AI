import { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, User, Zap, CheckCircle2 } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'
import logo from '../../logo.png'

export default function AuthPage() {
  const { login, register } = useContext(AuthContext)
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'register') {
      if (!name.trim() || !email.trim() || !password) {
        setError('Please fill in all fields')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      if (password !== confirm) {
        setError('Passwords do not match')
        return
      }
      setLoading(true)
      try {
        const result = register(name.trim(), email.trim(), password)
        if (result.error) {
          setError(result.error)
        } else {
          setSuccess('Account created! Logging you in...')
        }
      } catch (err) {
        setError(err.message || 'Registration failed')
      } finally {
        setLoading(false)
      }
    } else {
      if (!email.trim() || !password) {
        setError('Please enter your email and password')
        return
      }
      setLoading(true)
      try {
        const result = login(email.trim(), password)
        if (result.error) {
          setError(result.error)
        } else {
          setSuccess('Welcome back! Logging you in...')
        }
      } catch (err) {
        setError(err.message || 'Login failed')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setError('Please enter your email address first')
      return
    }
    setError('')
    setSuccess(`Password reset link sent to ${email} (demo mode)`)
  }

  const fillDemo = () => {
    setMode('login')
    setEmail('admin@procelya.ai')
    setPassword('admin123')
    setError('')
    setSuccess('')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logo} alt="Procelya AI" />
          <div>
            <h1>Procelya AI</h1>
            <p>Intelligent Workflow Automation Platform</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>Sign In</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); setSuccess('') }}>Create Account</button>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success">
            <CheckCircle2 size={14} />
            <span>{success}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-password-wrap">
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <span className="auth-password-toggle"><User size={14} /></span>
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <div className="auth-password-wrap">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="auth-password-toggle"><Mail size={14} /></span>
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-password-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Create a strong password' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="auth-password-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {mode === 'register' && password && (
              <>
                <div className="auth-strength">
                  {[1, 2, 3].map(i => (
                    <span key={i} className={`${i <= strength ? 'on' : ''} ${strength === 3 ? 'strong' : strength === 2 ? 'good' : ''}`} />
                  ))}
                </div>
                <div className="auth-strength-text">Password strength: {strengthLabel}</div>
              </>
            )}
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label>Confirm Password</label>
              <div className="auth-password-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <span className="auth-password-toggle"><Lock size={14} /></span>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="auth-row">
              <label className="auth-check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <button type="button" className="auth-link" onClick={handleForgotPassword}>
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <span className="auth-loading"><Loader2 size={15} className="spin" /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
            ) : (
              <span className="auth-loading"><Zap size={15} /> {mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <div className="auth-demo">
          <strong>Demo Account:</strong> admin@procelya.ai / admin123
          <button type="button" onClick={fillDemo}>Use demo credentials</button>
        </div>

        <p className="auth-footer">© 2026 Procelya AI · Secure Authentication</p>
      </div>
    </div>
  )
}