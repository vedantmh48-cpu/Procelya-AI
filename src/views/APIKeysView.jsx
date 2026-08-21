import { useState } from 'react'
import { Plus, KeyRound, Copy, Eye, EyeOff, Trash2, MoreVertical, Check, Clock, AlertTriangle, Plug, X, Save, LoaderCircle } from 'lucide-react'

const initialKeys = [
  { id: 1, name: 'Production API', key: 'pk_live_9xK2mN4pQ7rT8wZ', created: 'Aug 14, 2026', lastUsed: '2 min ago', usage: 48230, status: 'active' },
  { id: 2, name: 'Staging API', key: 'pk_test_3fH6sD1aB5nC9gE', created: 'Aug 10, 2026', lastUsed: '1 hr ago', usage: 12084, status: 'active' },
  { id: 3, name: 'Development', key: 'pk_dev_7uY2tR4eW8qO0p', created: 'Jul 28, 2026', lastUsed: '3 hrs ago', usage: 5431, status: 'active' },
  { id: 4, name: 'Legacy Key', key: 'pk_old_5sJ1fD9cH6bN4m', created: 'Jun 15, 2026', lastUsed: '12 days ago', usage: 982, status: 'revoked' }
]

const externalProviders = [
  { id: 'stripe', name: 'Stripe', desc: 'Payment processing', color: '#635bff' },
  { id: 'twilio', name: 'Twilio', desc: 'SMS & notifications', color: '#f22f46' },
  { id: 'slack', name: 'Slack', desc: 'Team messaging', color: '#4a154b' },
  { id: 'sendgrid', name: 'SendGrid', desc: 'Email delivery', color: '#1a82e2' },
  { id: 'shopify', name: 'Shopify', desc: 'E-commerce', color: '#96bf48' },
  { id: 'hubspot', name: 'HubSpot', desc: 'CRM', color: '#ff7a59' }
]

export default function APIKeysView() {
  const [keys, setKeys] = useState(initialKeys)
  const [copied, setCopied] = useState(null)
  const [revealed, setRevealed] = useState(null)
  const [showIntegrator, setShowIntegrator] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [integrations, setIntegrations] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(null)

  const copyKey = (id, key) => {
    navigator.clipboard?.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const createKey = () => {
    const name = `New Key ${keys.length + 1}`
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const rand = [...Array(22)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('')
    setKeys([{ id: Date.now(), name, key: `pk_${rand.slice(0, 8)}...`, created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), lastUsed: 'Never', usage: 0, status: 'active' }, ...keys])
  }

  const revokeKey = (id) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' } : k))
  }

  const openIntegrator = (provider) => {
    setSelectedProvider(provider)
    setApiKeyInput('')
    setSavedMsg(null)
    setShowIntegrator(true)
  }

  const saveIntegration = () => {
    if (!apiKeyInput.trim()) {
      setSavedMsg({ type: 'error', text: 'Please enter an API key' })
      return
    }
    setSaving(true)
    setTimeout(() => {
      const existing = integrations.find(i => i.providerId === selectedProvider.id)
      if (existing) {
        setIntegrations(prev => prev.map(i => i.providerId === selectedProvider.id ? { ...i, key: apiKeyInput, connectedAt: new Date().toISOString() } : i))
      } else {
        setIntegrations([...integrations, { providerId: selectedProvider.id, name: selectedProvider.name, key: apiKeyInput, connectedAt: new Date().toISOString() }])
      }
      setSavedMsg({ type: 'success', text: `${selectedProvider.name} integration saved successfully` })
      setSaving(false)
      setTimeout(() => { setShowIntegrator(false); setSavedMsg(null) }, 1500)
    }, 600)
  }

  const removeIntegration = (providerId) => {
    setIntegrations(prev => prev.filter(i => i.providerId !== providerId))
  }

  return <div className="view-page">
    <div className="dash-head">
      <div><h1>API Keys</h1><p>Create and manage API keys for external integrations.</p></div>
      <button className="flame-btn" onClick={createKey}><Plus size={15}/>Create API Key</button>
    </div>

    <div className="api-keys-wrap">
      <div className="api-warning">
        <AlertTriangle size={16}/>
        <span>API keys are sensitive. Never share them or commit them to version control.</span>
      </div>

      <div className="panel">
        <div className="api-list">
          {keys.map(k => (
            <div className={`api-key-row ${k.status}`} key={k.id}>
              <span className="api-key-icon"><KeyRound size={16}/></span>
              <div className="api-key-info">
                <strong>{k.name}</strong>
                <small>Created {k.created} · Used {k.lastUsed}</small>
              </div>
              <div className="api-key-value">
                <code>{revealed === k.id ? k.key : k.key.replace(/^(.{6}).*$/, '$1••••••••')}</code>
                <button className="icon-btn" onClick={() => setRevealed(revealed === k.id ? null : k.id)}>
                  {revealed === k.id ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
                <button className="icon-btn" onClick={() => copyKey(k.id, k.key)}>
                  {copied === k.id ? <Check size={14} className="copied"/> : <Copy size={14}/>}
                </button>
              </div>
              <div className="api-usage">
                <small>Requests</small>
                <strong>{k.usage.toLocaleString()}</strong>
              </div>
              <span className={`api-status ${k.status}`}>{k.status}</span>
              {k.status !== 'revoked' && <button className="ghost danger" onClick={() => revokeKey(k.id)}>Revoke</button>}
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <header className="panel-head">
          <div><div className="eyebrow">EXTERNAL INTEGRATIONS</div><h2>Connect External Services</h2><p>Integrate with third-party APIs to extend your workflows.</p></div>
        </header>
        <div className="provider-grid">
          {externalProviders.map(p => {
            const connected = integrations.find(i => i.providerId === p.id)
            return <div className={`provider-card ${connected ? 'connected' : ''}`} key={p.id}>
              <span className="provider-icon" style={{ background: `${p.color}22`, color: p.color }}><Plug size={18}/></span>
              <div className="provider-info">
                <strong>{p.name}</strong>
                <small>{p.desc}</small>
                {connected && <em className="provider-connected"><Check size={11}/>Connected</em>}
              </div>
              <button className="ghost" onClick={() => openIntegrator(p)}>
                {connected ? 'Manage' : 'Connect'}
              </button>
            </div>
          })}
        </div>
      </div>

      {integrations.length > 0 && (
        <div className="panel" style={{ marginTop: 20 }}>
          <header className="panel-head">
            <div><div className="eyebrow">ACTIVE</div><h2>Connected Integrations</h2><p>Your active external service connections.</p></div>
          </header>
          <div className="api-list">
            {integrations.map(integ => (
              <div className="api-key-row active" key={integ.providerId}>
                <span className="api-key-icon"><Plug size={16}/></span>
                <div className="api-key-info">
                  <strong>{integ.name}</strong>
                  <small>Connected {new Date(integ.connectedAt).toLocaleString()}</small>
                </div>
                <div className="api-key-value">
                  <code>{integ.key.replace(/^(.{6}).*$/, '$1••••••••')}</code>
                </div>
                <span className="api-status active">connected</span>
                <button className="ghost danger" onClick={() => removeIntegration(integ.providerId)}>Disconnect</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {showIntegrator && selectedProvider && (
      <div className="json-modal">
        <div>
          <button className="icon-btn json-close" onClick={() => setShowIntegrator(false)}><X size={15}/></button>
          <h3>Connect {selectedProvider.name}</h3>
          <p style={{ color: '#8a8d99', fontSize: 12, marginBottom: 16 }}>Enter your {selectedProvider.name} API key to enable integration.</p>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label>API Key
              <input type="password" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} placeholder={`Enter ${selectedProvider.name} API key`}/>
            </label>
          </div>
          {savedMsg && <div className={`pwd-msg ${savedMsg.type}`}>{savedMsg.type === 'success' ? <Check size={14}/> : <span>⚠</span>}{savedMsg.text}</div>}
          <div className="props-actions">
            <button className="ghost" onClick={() => setShowIntegrator(false)}>Cancel</button>
            <button className="flame-btn" onClick={saveIntegration} disabled={saving}>
              {saving ? <><LoaderCircle className="spin" size={14}/>Saving...</> : <><Save size={14}/>Save Integration</>}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
}
