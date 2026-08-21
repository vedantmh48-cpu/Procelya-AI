import { useState, useContext } from 'react'
import { Bell, Palette, User, KeyRound, Save, Lock, CreditCard, Eye, EyeOff, Check, LoaderCircle } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'api', label: 'API Keys', icon: KeyRound }
]

export default function SettingsView({ theme, onThemeToggle, onNavigate }) {
  const { user, updateProfile, changePassword } = useContext(AuthContext)
  const [active, setActive] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({ name: user?.name || 'Venkatesh M', email: user?.email || 'venkatesh@procelya.ai', role: user?.role || 'Admin', company: 'Procelya Inc' })
  const [notifications, setNotifications] = useState({ email: true, push: true, workflow: true, weekly: false })
  const [security, setSecurity] = useState({ twoFactor: true, sessionTimeout: '30min' })
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false })
  const [pwdMsg, setPwdMsg] = useState(null)
  const [changingPwd, setChangingPwd] = useState(false)

  const save = () => {
    updateProfile({ name: profile.name, email: profile.email, role: profile.role })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassword = () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      setPwdMsg({ type: 'error', text: 'Please fill in all password fields' })
      return
    }
    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    setChangingPwd(true)
    setTimeout(() => {
      const result = changePassword(pwd.current, pwd.next)
      if (result?.error) {
        setPwdMsg({ type: 'error', text: result.error })
      } else {
        setPwdMsg({ type: 'success', text: 'Password changed successfully' })
        setPwd({ current: '', next: '', confirm: '' })
      }
      setChangingPwd(false)
      setTimeout(() => setPwdMsg(null), 3000)
    }, 500)
  }

  return <div className="view-page settings-page">
    <div className="dash-head">
      <div><h1>Settings</h1><p>Manage your account and preferences.</p></div>
      <button className="flame-btn" onClick={save}><Save size={15}/>{saved ? 'Saved!' : 'Save Changes'}</button>
    </div>

    <div className="settings-layout">
      <div className="settings-nav">
        {sections.map(({ id, label, icon: Icon }) => (
          <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}>
            <Icon size={16}/>{label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {active === 'profile' && <div className="settings-section">
          <h3>Profile Information</h3>
          <div className="form-grid">
            <label>Full Name<input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}/></label>
            <label>Email<input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}/></label>
            <label>Role<input value={profile.role} onChange={e => setProfile({ ...profile, role: e.target.value })}/></label>
            <label>Company<input value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })}/></label>
          </div>
        </div>}

        {active === 'appearance' && <div className="settings-section">
          <h3>Appearance</h3>
          <div className="theme-options">
            <button className={`theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => onThemeToggle?.('dark')}>
              <span className="theme-preview dark-preview"><span/><span/><span/></span>
              <strong>Dark Mode</strong>
              <small>Default theme</small>
            </button>
            <button className={`theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => onThemeToggle?.('light')}>
              <span className="theme-preview light-preview"><span/><span/><span/></span>
              <strong>Light Mode</strong>
              <small>Bright and clean</small>
            </button>
          </div>
        </div>}

        {active === 'notifications' && <div className="settings-section">
          <h3>Notifications</h3>
          <div className="toggle-list">
            {Object.entries(notifications).map(([key, val]) => (
              <div className="toggle-row" key={key}>
                <div><strong>{key === 'email' ? 'Email Notifications' : key === 'push' ? 'Push Notifications' : key === 'workflow' ? 'Workflow Alerts' : 'Weekly Digest'}</strong>
                <small>{key === 'email' ? 'Receive emails about important events' : key === 'push' ? 'Get push notifications on your device' : key === 'workflow' ? 'Alert when workflows complete or fail' : 'Weekly summary of your activity'}</small></div>
                <button className={`toggle ${val ? 'on' : ''}`} onClick={() => setNotifications({ ...notifications, [key]: !val })}><span/></button>
              </div>
            ))}
          </div>
        </div>}

        {active === 'security' && <div className="settings-section">
          <h3>Security</h3>
          <div className="toggle-list">
            <div className="toggle-row">
              <div><strong>Two-Factor Authentication</strong><small>Require 2FA for account access</small></div>
              <button className={`toggle ${security.twoFactor ? 'on' : ''}`} onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}><span/></button>
            </div>
            <div className="toggle-row">
              <div><strong>Session Timeout</strong><small>Auto-logout after inactivity</small></div>
              <select value={security.sessionTimeout} onChange={e => setSecurity({ ...security, sessionTimeout: e.target.value })}>
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="1hr">1 hour</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>

          <h3 style={{ marginTop: 28 }}>Change Password</h3>
          <div className="settings-section-inner">
            <div className="form-grid">
              <label>Current Password
                <div className="pwd-input-wrap">
                  <input type={showPwd.current ? 'text' : 'password'} value={pwd.current} onChange={e => setPwd({ ...pwd, current: e.target.value })} placeholder="Enter current password"/>
                  <button type="button" className="icon-btn" onClick={() => setShowPwd({ ...showPwd, current: !showPwd.current })}>
                    {showPwd.current ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </label>
              <label>New Password
                <div className="pwd-input-wrap">
                  <input type={showPwd.next ? 'text' : 'password'} value={pwd.next} onChange={e => setPwd({ ...pwd, next: e.target.value })} placeholder="Enter new password"/>
                  <button type="button" className="icon-btn" onClick={() => setShowPwd({ ...showPwd, next: !showPwd.next })}>
                    {showPwd.next ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </label>
              <label>Confirm New Password
                <div className="pwd-input-wrap">
                  <input type={showPwd.confirm ? 'text' : 'password'} value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} placeholder="Confirm new password"/>
                  <button type="button" className="icon-btn" onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}>
                    {showPwd.confirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </label>
            </div>
            {pwdMsg && <div className={`pwd-msg ${pwdMsg.type}`}>{pwdMsg.type === 'success' ? <Check size={14}/> : <span>⚠</span>}{pwdMsg.text}</div>}
            <div className="props-actions">
              <button className="flame-btn" onClick={handleChangePassword} disabled={changingPwd}>
                {changingPwd ? <><LoaderCircle className="spin" size={14}/>Changing...</> : <><Lock size={14}/>Change Password</>}
              </button>
            </div>
          </div>
        </div>}

        {active === 'billing' && <div className="settings-section">
          <h3>Billing</h3>
          <div className="billing-card">
            <div><strong>Current Plan</strong><small>Pro</small></div>
            <div><strong>Monthly Cost</strong><small>$49/month</small></div>
            <div><strong>Next Billing</strong><small>Sep 21, 2026</small></div>
            <button className="ghost">Manage Plan</button>
          </div>
        </div>}

        {active === 'api' && <div className="settings-section">
          <h3>API Keys</h3>
          <p>Manage your API keys for external integrations.</p>
          <button className="ghost" onClick={() => onNavigate('API Keys')}><KeyRound size={14}/>Go to API Keys</button>
        </div>}
      </div>
    </div>
  </div>
}