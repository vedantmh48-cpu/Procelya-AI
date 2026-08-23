import { useState } from 'react'
import { Home, LayoutGrid, Plus, PlayCircle, MoreHorizontal, Braces, FolderKanban, Bell, KeyRound, Settings, LogOut, X } from 'lucide-react'

/**
 * Floating pill tab bar — 5 slots:
 * Home | Flows | (＋ Create FAB) | Runs | More
 *
 * "More" opens a spring bottom-sheet with the remaining sections
 * (Functions, Projects, Alerts, API Keys, Settings, Logout).
 */

const tabs = [
  { icon: Home, label: 'Home', view: 'Dashboard', mobileLabel: 'Dashboard' },
  { icon: LayoutGrid, label: 'Flows', view: 'Workflows', mobileLabel: 'Flows' },
  { icon: Plus, label: 'Create', view: 'Workflow Builder', mobileLabel: 'Builder', fab: true },
  { icon: PlayCircle, label: 'Runs', view: 'Executions', mobileLabel: 'Runs' },
  { icon: MoreHorizontal, label: 'More', view: null, mobileLabel: 'More' }
]

const moreItems = [
  { icon: Braces, label: 'Functions', view: 'Functions', mobileLabel: 'Functions' },
  { icon: FolderKanban, label: 'Projects', view: 'Projects', mobileLabel: 'Projects' },
  { icon: Bell, label: 'Alerts', view: 'Notifications', mobileLabel: 'Alerts' },
  { icon: KeyRound, label: 'API Keys', view: 'API Keys', mobileLabel: 'API Keys' },
  { icon: Settings, label: 'Settings', view: 'Settings', mobileLabel: 'Settings' }
]

export default function MobileNav({ active, onChange, onLogout }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const navigate = (mobileLabel, view) => {
    onChange(mobileLabel)
    if (view) {
      const selectors = {
        'Dashboard': '.dash-head',
        'Workflow Builder': '.requirement',
        'Workflows': '.diagram',
        'Executions': '.execution',
        'Functions': '.func-grid',
        'Projects': '.project-grid',
        'Notifications': '.notif-list',
        'API Keys': '.api-keys-wrap',
        'Settings': '.status'
      }
      requestAnimationFrame(() => {
        document.querySelector(selectors[view])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  const handleTab = (tab) => {
    if (!tab.view) { setSheetOpen(true); return }
    setSheetOpen(false)
    navigate(tab.mobileLabel, tab.view)
  }

  const handleMore = (item) => {
    setSheetOpen(false)
    navigate(item.mobileLabel, item.view)
  }

  return (
    <>
      {/* Backdrop — tap to dismiss the bottom sheet */}
      {sheetOpen && (
        <div className="mobile-sheet-overlay" onClick={() => setSheetOpen(false)} />
      )}

      {/* More — bottom sheet */}
      <div className={`mobile-sheet ${sheetOpen ? 'open' : ''}`} aria-hidden={!sheetOpen}>
        <div className="mobile-sheet-handle" />
        <div className="mobile-sheet-head">
          <strong>Quick Access</strong>
          <button className="mobile-sheet-close" aria-label="Close menu" onClick={() => setSheetOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="mobile-sheet-items">
          {moreItems.map(item => {
            const Icon = item.icon
            const isActive = active === item.mobileLabel
            return (
              <button
                key={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`mobile-sheet-item ${isActive ? 'active' : ''}`}
                onClick={() => handleMore(item)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            )
          })}
          {onLogout && (
            <button
              className="mobile-sheet-item logout"
              onClick={() => { setSheetOpen(false); onLogout() }}
            >
              <LogOut size={19} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating pill tab bar */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {tabs.map(tab => {
          const Icon = tab.icon
          const inMore = moreItems.some(item => item.mobileLabel === active)
          const isActive = tab.view !== null && (active === tab.mobileLabel || (tab.label === 'More' && inMore))

          if (tab.fab) {
            return (
              <button
                key={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className={`mobile-nav-item create ${isActive ? 'active' : ''}`}
                onClick={() => handleTab(tab)}
              >
                <span className="mobile-nav-fab"><Icon size={24} /></span>
                <span className="mobile-nav-label">{tab.label}</span>
              </button>
            )
          }

          return (
            <button
              key={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTab(tab)}
            >
              <span className="mobile-nav-icon"><Icon size={20} /></span>
              <span className="mobile-nav-label">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}