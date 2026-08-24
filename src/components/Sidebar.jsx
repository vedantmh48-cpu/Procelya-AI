import { useState } from 'react'
import { LayoutDashboard, Workflow, Network, PlaySquare, Braces, FolderKanban, Settings, KeyRound, Bell, ChevronDown, User, LogOut, BookOpen, HelpCircle } from 'lucide-react'
import logo from '../../logo.png'

const nav = [
  [LayoutDashboard, 'Dashboard'],
  [Workflow, 'Workflow Builder'],
  [Network, 'Workflows'],
  [PlaySquare, 'Executions'],
  [Braces, 'Functions'],
  [FolderKanban, 'Projects'],
  [Bell, 'Notifications'],
  [Settings, 'Settings'],
  [KeyRound, 'API Keys'],
  [BookOpen, 'How to Use'],
  [HelpCircle, 'Help']
]

export default function Sidebar({ activeNav, onNav, onUserAction, userMenu, setUserMenu, user, health }) {
  const systemOnline = health?.backend && health?.database
  const displayName = user?.name || 'Venkatesh M'
  const initials = user?.initials || 'VM'
  const role = user?.role || 'Admin'
  return <aside className="sidebar">
    <div className="brand brand-img" style={{ background: '#fff', borderRadius: '8px', margin: '12px 16px', padding: '10px', height: 'auto', border: '1px solid #e5e5e5' }}>
      <img src={logo} alt="Procelya AI logo" className="brand-logo" style={{ maxHeight: '40px' }}/>
    </div>
    <nav>
      {nav.map(([Icon, label], i) => (
        <button
          className={`nav-item ${activeNav === label ? 'active' : ''}`}
          key={label}
          onClick={() => onNav(label)}
        >
          <Icon size={18}/>
          <span>{label}</span>
          {activeNav === label && <em/>}
        </button>
      ))}
    </nav>
    <div className="side-bottom">
      <div className="system">
        <span className={`pulse ${systemOnline ? '' : 'offline'}`}/>
        <div>
          <strong>{systemOnline ? 'System Online' : 'System Offline'}</strong>
          <small>{systemOnline ? 'All systems operational' : 'Check connectivity'}</small>
        </div>
      </div>
      <div className="user-wrap">
        <button className="user" onClick={() => setUserMenu(!userMenu)}>
          <span>{initials}</span>
          <div><strong>{displayName}</strong><small>{role}</small></div>
          <ChevronDown size={15}/>
        </button>
        {userMenu && (
          <div className="user-menu">
            <button onClick={() => onUserAction('Profile')}><User size={14}/>Profile</button>
            <button onClick={() => onUserAction('Settings')}><Settings size={14}/>Settings</button>
            <button onClick={() => onUserAction('Logout')}><LogOut size={14}/>Logout</button>
          </div>
        )}
      </div>
      <p>Procelya AI v1.1.0</p>
    </div>
  </aside>
}