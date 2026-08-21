import { useState, useEffect } from 'react'
import { ChevronRight, Moon, Sun, ChevronDown, FolderOpen, RotateCcw, Download, FileText, Search, LogOut, Server, Database, Radio, Bell } from 'lucide-react'

const projects = ['sample-flow', 'ecommerce-orders', 'ai-support-agent', 'billing-automation']

export default function TopBar({ theme, onThemeToggle, projectMenu, setProjectMenu, onProjectSelect, activeView, viewLabel, onNavigate, user, onLogout, health }) {
  const [project, setProject] = useState('sample-flow')
  const [searchOpen, setSearchOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)

  const selectProject = (name) => {
    setProject(name)
    setProjectMenu(false)
    onProjectSelect(name)
  }

  const HealthDot = ({ ok, label, icon: Icon }) => (
    <span className={`health-dot ${ok ? 'ok' : 'bad'}`} title={label}>
      <Icon size={12}/>
      <em>{ok ? 'ON' : 'OFF'}</em>
    </span>
  )

  return <header className="topbar">
    <div className="crumbs">
      <button className="crumb-btn" onClick={() => onNavigate('Dashboard')}>Projects</button>
      <ChevronRight/>
      <button className="crumb-btn" onClick={() => onNavigate('Projects')}>{project}</button>
      <ChevronRight/>
      <b>{viewLabel || activeView}</b>
    </div>
    <div className="top-actions">
      <div className="health-indicators">
        <HealthDot ok={health?.backend} label="Backend" icon={Server}/>
        <HealthDot ok={health?.database} label="Database" icon={Database}/>
        <HealthDot ok={health?.realtime} label="Realtime" icon={Radio}/>
      </div>
      <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
        <Search size={17}/>
      </button>
      {searchOpen && (
        <input
          className="search-input"
          placeholder={`Search ${viewLabel?.toLowerCase() || 'workflows'}...`}
          autoFocus
          onBlur={() => setSearchOpen(false)}
        />
      )}
      <button className="icon-btn" aria-label="Notifications" onClick={() => onNavigate('Notifications')}>
        <Bell size={17}/>
      </button>
      <button className="icon-btn" aria-label="Reset" onClick={() => onProjectSelect('reset')}>
        <RotateCcw size={17}/>
      </button>
      <div className="project-wrap">
        <button className="icon-btn" aria-label="Download" onClick={() => setDownloadOpen(!downloadOpen)}>
          <Download size={17}/>
        </button>
        {downloadOpen && (
          <div className="project-menu">
            <button onClick={() => { setDownloadOpen(false); onProjectSelect('download') }}>
              <Download size={13}/>Download JSON
            </button>
            <button onClick={() => { setDownloadOpen(false); onProjectSelect('download-pdf') }}>
              <FileText size={13}/>Download PDF
            </button>
          </div>
        )}
      </div>
      <button className="icon-btn" onClick={() => onThemeToggle()} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        {theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}
      </button>
      <div className="project-wrap">
        <button className="project" onClick={() => setProjectMenu(!projectMenu)}>
          <FolderOpen size={14}/>
          <span>Project: {project}</span>
          <ChevronDown size={15}/>
        </button>
        {projectMenu && (
          <div className="project-menu">
            {projects.map(name => (
              <button
                key={name}
                className={name === project ? 'active' : ''}
                onClick={() => selectProject(name)}
              >
                <FolderOpen size={13}/>
                {name}
                {name === project && <em/>}
              </button>
            ))}
          </div>
        )}
      </div>
      {user && (
        <button className="icon-btn" onClick={onLogout} aria-label="Logout" title="Logout">
          <LogOut size={17}/>
        </button>
      )}
    </div>
  </header>
}