import { useState } from 'react'
import { AlertCircle, ArrowRight, Building2, CheckCircle2, Globe, Loader2, Mail, MapPin, Phone, Users, Briefcase, FileText, Zap } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'
import logo from '../../logo.png'

const INDUSTRIES = [
  'Technology / SaaS',
  'E-commerce / Retail',
  'Finance / Banking',
  'Healthcare',
  'Manufacturing',
  'Logistics / Supply Chain',
  'Education',
  'Marketing / Media',
  'Real Estate',
  'Other'
]

const COMPANY_SIZES = [
  'Just me',
  '2-10',
  '11-50',
  '51-200',
  '201-500',
  '500+'
]

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Singapore', 'United Arab Emirates', 'Japan',
  'Brazil', 'South Africa', 'Other'
]

export default function BusinessAuthPage() {
  const { user, completeBusinessSetup, logout } = useContext(AuthContext)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
    country: '',
    phone: '',
    address: '',
    description: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setError('')
  }

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Please enter your business name'
    if (!form.industry) return 'Please select your industry'
    if (!form.size) return 'Please select your company size'
    if (form.website && !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(form.website.trim())) {
      return 'Please enter a valid website URL'
    }
    return ''
  }

  const validateStep2 = () => {
    if (!form.country) return 'Please select your country'
    if (form.phone && !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) {
      return 'Please enter a valid phone number'
    }
    return ''
  }

  const handleNext = () => {
    const err = step === 1 ? validateStep1() : validateStep2()
    if (err) {
      setError(err)
      return
    }
    setError('')
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const err = validateStep2()
    if (err) {
      setError(err)
      return
    }

    setLoading(true)
    try {
      const result = completeBusinessSetup(form)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Business verified! Setting up your workspace...')
      }
    } catch (err) {
      setError(err.message || 'Business setup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="auth-page">
      <div className="auth-card biz-auth-card">
        <div className="auth-brand">
          <img src={logo} alt="Procelya AI" />
          <div>
            <h1>Set up your business</h1>
            <p>Tell us about your company to personalize your workspace</p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="biz-steps">
          <div className={`biz-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <span>{step > 1 ? <CheckCircle2 size={13} /> : 1}</span>
            <small>Company</small>
          </div>
          <div className={`biz-step-line ${step > 1 ? 'done' : ''}`} />
          <div className={`biz-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
            <span>{step > 2 ? <CheckCircle2 size={13} /> : 2}</span>
            <small>Location</small>
          </div>
          <div className={`biz-step-line ${step > 2 ? 'done' : ''}`} />
          <div className={`biz-step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <small>Verify</small>
          </div>
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
          {step === 1 && (
            <>
              <div className="auth-field">
                <label>Business Name</label>
                <div className="auth-password-wrap">
                  <input
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    autoFocus
                  />
                  <span className="auth-password-toggle"><Building2 size={14} /></span>
                </div>
              </div>

              <div className="auth-field">
                <label>Industry</label>
                <div className="biz-select-wrap">
                  <select value={form.industry} onChange={(e) => update('industry', e.target.value)}>
                    <option value="">Select your industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <span className="auth-password-toggle"><Briefcase size={14} /></span>
                </div>
              </div>

              <div className="auth-field">
                <label>Company Size</label>
                <div className="biz-size-grid">
                  {COMPANY_SIZES.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`biz-size-option ${form.size === s ? 'selected' : ''}`}
                      onClick={() => update('size', s)}
                    >
                      <Users size={13} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="auth-field">
                <label>Website (optional)</label>
                <div className="auth-password-wrap">
                  <input
                    type="text"
                    placeholder="https://yourcompany.com"
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)}
                  />
                  <span className="auth-password-toggle"><Globe size={14} /></span>
                </div>
              </div>

              <button type="button" className="auth-submit" onClick={handleNext}>
                <span className="auth-loading">Continue <ArrowRight size={15} /></span>
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="auth-field">
                <label>Country / Region</label>
                <div className="biz-select-wrap">
                  <select value={form.country} onChange={(e) => update('country', e.target.value)}>
                    <option value="">Select your country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="auth-password-toggle"><MapPin size={14} /></span>
                </div>
              </div>

              <div className="auth-field">
                <label>Phone Number (optional)</label>
                <div className="auth-password-wrap">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                  />
                  <span className="auth-password-toggle"><Phone size={14} /></span>
                </div>
              </div>

              <div className="auth-field">
                <label>Business Address (optional)</label>
                <div className="auth-password-wrap">
                  <input
                    type="text"
                    placeholder="Street, City, Postal code"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                  />
                  <span className="auth-password-toggle"><MapPin size={14} /></span>
                </div>
              </div>

              <div className="auth-field">
                <label>Business Description (optional)</label>
                <div className="auth-password-wrap">
                  <textarea
                    className="biz-textarea"
                    placeholder="What does your business do?"
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    rows={3}
                  />
                  <span className="auth-password-toggle biz-textarea-icon"><FileText size={14} /></span>
                </div>
              </div>

              <div className="biz-nav-row">
                <button type="button" className="biz-back-btn" onClick={handleBack}>
                  Back
                </button>
                <button type="button" className="auth-submit biz-continue-btn" onClick={handleNext}>
                  <span className="auth-loading">Continue <ArrowRight size={15} /></span>
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="biz-review">
                <div className="biz-review-item">
                  <span>Business</span>
                  <strong>{form.name || '—'}</strong>
                </div>
                <div className="biz-review-item">
                  <span>Industry</span>
                  <strong>{form.industry || '—'}</strong>
                </div>
                <div className="biz-review-item">
                  <span>Size</span>
                  <strong>{form.size || '—'}</strong>
                </div>
                <div className="biz-review-item">
                  <span>Country</span>
                  <strong>{form.country || '—'}</strong>
                </div>
                {form.website && (
                  <div className="biz-review-item">
                    <span>Website</span>
                    <strong>{form.website}</strong>
                  </div>
                )}
                {form.phone && (
                  <div className="biz-review-item">
                    <span>Phone</span>
                    <strong>{form.phone}</strong>
                  </div>
                )}
              </div>

              <div className="biz-verify-note">
                <Mail size={14} />
                <span>We'll send a verification link to <strong>{user?.email}</strong> after you confirm.</span>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <span className="auth-loading"><Loader2 size={15} className="spin" /> Verifying business...</span>
                ) : (
                  <span className="auth-loading"><Zap size={15} /> Confirm & Get Started</span>
                )}
              </button>

              <div className="biz-nav-row">
                <button type="button" className="biz-back-btn" onClick={handleBack}>
                  Back
                </button>
              </div>
            </>
          )}
        </form>

        <div className="auth-divider">or</div>

        <div className="auth-demo">
          <strong>Already have an account?</strong>
          <button type="button" onClick={handleLogout}>Sign in with a different account</button>
        </div>

        <p className="auth-footer">© 2026 Procelya AI · Business Verification</p>
      </div>
    </div>
  )
}