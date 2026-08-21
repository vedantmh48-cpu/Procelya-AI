import { Workflow, Network, PlaySquare, FolderKanban, Settings, LayoutDashboard, Bell, LogOut } from 'lucide-react'
import logo from '../../logo.png'
const items = [
  [LayoutDashboard, 'Dashboard', 'Dashboard'],
  [Workflow, 'Builder', 'Workflow Builder'],
  [Network, 'Flows', 'Workflows'],
  [PlaySquare, 'Runs', 'Executions'],
  [FolderKanban, 'Projects', 'Projects'],
  [Bell, 'Alerts', 'Notifications'],
  [Settings, 'Settings', 'Settings']
]
export default function MobileNav({ active, onChange, onLogout }) {
  const navigate = (label, view) => {
    onChange(label)
    if (view) {
      const selectors = {
        'Dashboard': '.dash-head',
        'Workflow Builder': '.requirement',
        'Workflows': '.diagram',
        'Executions': '.execution',
        'Projects': '.requirement',
        'Notifications': '.notif-list',
        'Settings': '.status'
      }
      document.querySelector(selectors[view])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  return <nav className="mobile-nav" aria-label="Mobile navigation">
    <div className="mobile-nav-brand">
      <img src={logo} alt="Procelya AI" />
    </div>
    <div className="mobile-nav-items">
      {items.map(([Icon, label, view]) => (
        <button
          key={label}
          aria-current={active === label ? 'page' : undefined}
          className={`mobile-nav-item ${active === label ? 'active' : ''}`}
          onClick={() => navigate(label, view)}
        >
          <span className="mobile-nav-icon"><Icon size={17}/></span>
          <span className="mobile-nav-label">{label}</span>
        </button>
      ))}
    </div>
    {onLogout && (
      <button className="mobile-nav-logout" onClick={onLogout} aria-label="Logout">
        <LogOut size={17}/>
      </button>
    )}
  </nav>
}