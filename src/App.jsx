import { useEffect, useRef, useState, useContext } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import MobileNav from './components/MobileNav'
import BuilderView from './views/BuilderView'
import DashboardView from './views/DashboardView'
import WorkflowsView from './views/WorkflowsView'
import ExecutionsView from './views/ExecutionsView'
import FunctionsView from './views/FunctionsView'
import ProjectsView from './views/ProjectsView'
import SettingsView from './views/SettingsView'
import APIKeysView from './views/APIKeysView'
import NotificationsView from './views/NotificationsView'
import HowToUseView from './views/HowToUseView'
import AuthPage from './pages/AuthPage'
import BusinessAuthPage from './pages/BusinessAuthPage'
import { AuthContext } from './context/AuthContext'
import { HealthContext } from './context/HealthContext'
import api from './api/client'
import { requirement } from './data/workflow'
import { jsPDF } from 'jspdf'

const VIEWS = {
  'Dashboard': DashboardView,
  'Workflow Builder': BuilderView,
  'Workflows': WorkflowsView,
  'Executions': ExecutionsView,
  'Functions': FunctionsView,
  'Projects': ProjectsView,
  'Settings': SettingsView,
  'API Keys': APIKeysView,
  'Notifications': NotificationsView,
  'How to Use': HowToUseView,
  'Help': HowToUseView
}

const VIEW_LABELS = {
  'Dashboard': 'Overview',
  'Workflow Builder': 'Workflow Builder',
  'Workflows': 'Workflow Management',
  'Executions': 'Execution History',
  'Functions': 'Code Functions',
  'Projects': 'Project Workspace',
  'Settings': 'Preferences',
  'API Keys': 'Access Management',
  'Notifications': 'Notification Center',
  'How to Use': 'How to Use',
  'Help': 'Help & Contact'
}

export default function App() {
  const { user, loading, logout } = useContext(AuthContext)
  const health = useContext(HealthContext)
  const [text, setText] = useState(requirement)
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [workflow, setWorkflow] = useState(null)
  const [workflowId, setWorkflowId] = useState(null)
  const [warnings, setWarnings] = useState([])
  const [logs, setLogs] = useState([])
  const [run, setRun] = useState(null)
  const [runId, setRunId] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('procelya-theme') || 'dark')
  const [mobileTab, setMobileTab] = useState('Dashboard')
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [projectMenu, setProjectMenu] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [toast, setToast] = useState(null)
  const [globalSearch, setGlobalSearch] = useState('')
  const [payload, setPayload] = useState({ orderId: 'ORD-2026-014', customerId: 'CUS-1108', vendorId: 'VND-001', vendorName: 'Acme Supplies', stockType: 'physical', quantity: 1, deliveryMethod: 'standard', amount: 2499, currency: 'INR', paymentType: 'card', paymentStatus: 'received' })
  const toastTimer = useRef(null)
  const eventSourceRef = useRef(null)

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light')
    localStorage.setItem('procelya-theme', theme)
  }, [theme])

  useEffect(() => () => eventSourceRef.current?.close(), [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }

  const scrollTo = (selector) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Navigation
  const navigate = (view) => {
    if (VIEWS[view]) {
      setActiveNav(view)
      setProjectMenu(false)
      setUserMenu(false)
      if (view === 'Workflow Builder' || view === 'Dashboard') {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
      }
    } else if (view === 'light' || view === 'dark') {
      setTheme(view)
    }
  }

  const scrollLogs = () => scrollTo('.execution')

  const handleNav = (label) => {
    setActiveNav(label)
    if (label === 'Help') {
      setTimeout(() => document.getElementById('help-feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
    }
    if (label !== 'Dashboard' && label !== 'Workflow Builder') {
      showToast(`${label} view opened`, 'info')
    }
  }

  // Workflow Detection (real API)
  const detect = async () => {
    if (!text.trim()) {
      showToast('Please describe your requirement first', 'error')
      return
    }
    setDetecting(true)
    setAccepted(false)
    setLogs([])
    setRun(null)
    setRunId(null)
    try {
      const result = await api.detect(text, 'sample-flow')
      setWorkflow(result.workflow)
      setWarnings(result.warnings || [])
      setDetected(true)
      if (result.warnings?.length) {
        showToast(`Workflow detected with ${result.warnings.length} warning(s)`, 'info')
      } else {
        showToast('Workflow detected successfully')
      }
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setDetecting(false)
    }
  }

  const discard = () => {
    setDetected(false)
    setAccepted(false)
    setLogs([])
    setRun(null)
    setRunId(null)
    setWorkflow(null)
    setWorkflowId(null)
    setWarnings([])
    showToast('Workflow discarded', 'info')
  }

  // Accept & persist workflow to MongoDB
  const handleAccept = async () => {
    if (!workflow) return
    setAccepting(true)
    try {
      const created = await api.createWorkflow({
        projectName: 'sample-flow',
        workflowName: workflow.workflowName,
        description: workflow.description || text,
        triggerEvent: workflow.triggerEvent,
        steps: workflow.steps
      })
      setWorkflowId(created._id)
      setAccepted(true)
      showToast('Workflow saved to database')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setAccepting(false)
    }
  }

  // Run Management (real execution via backend)
  const startRun = async () => {
    if (!workflowId) {
      showToast('Please accept the workflow first', 'error')
      return
    }
    setLogs([])
    setRun({ status: 'running', started: Date.now() })
    try {
      const triggerPayload = {
        order: { id: payload.orderId, customer_id: payload.customerId, vendor_id: payload.vendorId, vendor_name: payload.vendorName },
        stock_type: payload.stockType,
        quantity: Number(payload.quantity) || 0,
        delivery_method: payload.deliveryMethod,
        amount: Number(payload.amount) || 0,
        currency: payload.currency,
        payment_type: payload.paymentType,
        payment_status: payload.paymentStatus
      }
      const result = await api.triggerWorkflow(workflowId, triggerPayload)
      setRunId(result.runId)

      // Subscribe to SSE events
      eventSourceRef.current?.close()
      eventSourceRef.current = api.streamEvents(result.runId, {
        onStepStarted: (data) => {
          setLogs(prev => [...prev, { id: data.stepId, status: 'running', time: Date.now() }])
          setWorkflow(prev => prev ? {
            ...prev,
            steps: prev.steps.map(s => s.stepId === data.stepId ? { ...s, status: 'running' } : s)
          } : prev)
        },
        onStepCompleted: (data) => {
          setLogs(prev => prev.map(row =>
            row.id === data.stepId
              ? { ...row, status: data.status.toLowerCase(), duration: data.duration, time: Date.now(), input: data.input, output: data.output, error: data.error }
              : row
          ))
          setWorkflow(prev => prev ? {
            ...prev,
            steps: prev.steps.map(s => s.stepId === data.stepId ? { ...s, status: data.status.toLowerCase() } : s)
          } : prev)
        },
        onWorkflowCompleted: (data) => {
          setRun({ status: data.status.toLowerCase(), started: run?.started, completed: Date.now() })
          if (data.status === 'COMPLETED') {
            showToast('Workflow completed successfully')
          } else {
            showToast('Workflow failed', 'error')
          }
        },
        onError: () => {
          showToast('SSE connection lost', 'error')
        }
      })
    } catch (err) {
      setRun(null)
      showToast(err.message, 'error')
    }
  }

  const handleStop = () => {
    eventSourceRef.current?.close()
    setRun(prev => prev ? { ...prev, status: 'stopped' } : null)
    setLogs(prev => prev.map(row => row.status === 'running' ? { ...row, status: 'stopped' } : row))
    showToast('Workflow stopped', 'error')
  }

  const handlePause = () => {
    eventSourceRef.current?.close()
    setRun(prev => prev ? { ...prev, status: 'paused' } : null)
    showToast('Workflow paused', 'info')
  }

  const handleResume = () => {
    startRun()
    showToast('Workflow resumed')
  }

  const handleRetry = () => {
    setLogs([])
    setRun(null)
    startRun()
    showToast('Retrying workflow...', 'info')
  }

  const handleClearLogs = () => {
    setLogs([])
    setRun(null)
    showToast('Execution logs cleared', 'info')
  }

  // JSON utilities
  const handleCopyJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(workflow, null, 2))
    showToast('Workflow JSON copied to clipboard')
  }

  const handleDownloadJson = () => {
    if (!workflow) return
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(workflow.workflowName || 'workflow').replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Workflow JSON downloaded')
  }

  const handleDownloadPdf = () => {
    if (!workflow) return
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 14
    let y = 20

    // Title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(workflow.workflowName || 'Workflow', margin, y)
    y += 8

    // Description
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80)
    const desc = workflow.description || 'No description'
    const descLines = doc.splitTextToSize(desc, pageWidth - margin * 2)
    doc.text(descLines, margin, y)
    y += descLines.length * 5 + 6

    // Meta info
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text(`Project: ${workflow.projectName || 'N/A'}`, margin, y)
    y += 6
    doc.text(`Trigger: ${workflow.triggerEvent?.type || 'N/A'}`, margin, y)
    y += 6
    doc.text(`Version: v${workflow.version || 1}`, margin, y)
    y += 6
    doc.text(`Status: ${workflow.status || 'draft'}`, margin, y)
    y += 12

    // Steps header
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Workflow Steps', margin, y)
    y += 8

    const steps = workflow.steps || []
    steps.forEach((step, i) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30)
      doc.text(`${i + 1}. ${step.name || 'Unnamed Step'}`, margin, y)
      y += 6

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(90)
      const details = [
        `Step ID: ${step.stepId || 'N/A'}`,
        `Action: ${step.actionType || 'N/A'}`,
        step.functionName ? `Function: ${step.functionName}` : null,
        step.schema ? `Schema: ${step.schema}` : null,
        step.condition ? `Condition: ${step.condition.field} ${step.condition.operator} ${JSON.stringify(step.condition.value)}` : null,
        step.onSuccess ? `On Success: ${step.onSuccess}` : null,
        step.onFailure?.action ? `On Failure: ${step.onFailure.action}${step.onFailure.targetStepId ? ` → ${step.onFailure.targetStepId}` : ''}` : null
      ].filter(Boolean)

      details.forEach(d => {
        const lines = doc.splitTextToSize(d, pageWidth - margin * 2)
        doc.text(lines, margin + 4, y)
        y += lines.length * 4 + 1
      })

      if (step.inputMapping && Object.keys(step.inputMapping).length) {
        const mappingLines = doc.splitTextToSize(`Input Mapping: ${JSON.stringify(step.inputMapping)}`, pageWidth - margin * 2)
        doc.text(mappingLines, margin + 4, y)
        y += mappingLines.length * 4 + 1
      }

      y += 6
    })

    doc.save(`${(workflow.workflowName || 'workflow').replace(/\s+/g, '_')}.pdf`)
    showToast('Workflow PDF downloaded')
  }

  // Project & User handlers
  const handleProjectSelect = (name) => {
    setProjectMenu(false)
    if (name === 'reset') {
      setText(requirement)
      setDetected(false)
      setAccepted(false)
      setLogs([])
      setRun(null)
      setWorkflow(null)
      setWorkflowId(null)
      showToast('Workflow reset to default', 'info')
      return
    }
    if (name === 'download') {
      handleDownloadJson()
      return
    }
    if (name === 'download-pdf') {
      handleDownloadPdf()
      return
    }
    showToast(`Switched to project: ${name}`, 'info')
  }

  const handleUserAction = (action) => {
    setUserMenu(false)
    if (action === 'Profile') navigate('Settings')
    if (action === 'Settings') { navigate('Settings'); showToast('Settings opened', 'info') }
    if (action === 'Logout') {
      logout()
      showToast('Logged out successfully', 'info')
    }
  }

  const handleLogout = () => {
    eventSourceRef.current?.close()
    eventSourceRef.current = null
    logout()
    showToast('Logged out successfully', 'info')
  }

  // Mobile Nav
  const handleMobileNav = (label) => {
    setMobileTab(label)
    const map = { Dashboard: 'Dashboard', Builder: 'Workflow Builder', Flows: 'Workflows', Runs: 'Executions', Functions: 'Functions', Projects: 'Projects', Alerts: 'Notifications', Settings: 'Settings', 'API Keys': 'API Keys' }
    navigate(map[label])
  }

  const handleThemeToggle = (target) => {
    const next = target || (theme === 'dark' ? 'light' : 'dark')
    setTheme(next)
    showToast(`${next === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info')
  }

  // Render current view
  const ViewComponent = VIEWS[activeNav] || DashboardView

  const handleRunAgain = () => startRun()

  if (loading) {
    return <div className="auth-page"><div className="auth-card" style={{ textAlign: 'center' }}><div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /></div></div>
  }

  if (!user) {
    return <AuthPage />
  }

  if (!user.businessSetup) {
    return <BusinessAuthPage />
  }

  return <div className="app" key={user.id}>
    <Sidebar activeNav={activeNav} onNav={handleNav} onUserAction={handleUserAction} userMenu={userMenu} setUserMenu={setUserMenu} user={user} health={health} />
    <main>
      <TopBar
        theme={theme}
        onThemeToggle={handleThemeToggle}
        projectMenu={projectMenu}
        setProjectMenu={setProjectMenu}
        onProjectSelect={handleProjectSelect}
        activeView={activeNav}
        viewLabel={VIEW_LABELS[activeNav]}
        onNavigate={navigate}
        user={user}
        onLogout={handleLogout}
        health={health}
        onSearch={(q) => { setGlobalSearch(q) }}
      />

      {/* Mobile-only app bar */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <span className="mobile-topbar-mark">P</span>
          <div className="mobile-topbar-meta">
            <strong>{VIEW_LABELS[activeNav] || activeNav}</strong>
            <small>Procelya AI</small>
          </div>
        </div>
        <div className="mobile-topbar-actions">
          <span className={`mobile-health ${health?.backend ? 'ok' : 'bad'}`}>
            <em />
            {health?.backend ? 'Live' : 'Offline'}
          </span>
          <button
            className="mobile-theme"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={() => handleThemeToggle()}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </div>

      <div className="content">
        {ViewComponent === BuilderView
          ? <BuilderView
              text={text} setText={setText} detecting={detecting} onDetect={detect}
              detected={detected} workflow={workflow} accepted={accepted} accepting={accepting}
              onDiscard={discard} onAccept={handleAccept}
              onCopyJson={handleCopyJson} onDownloadJson={handleDownloadJson} onDownloadPdf={handleDownloadPdf}
              running={run?.status === 'running'} onRun={startRun}
              payload={payload} setPayload={setPayload}
              logs={logs} onClearLogs={handleClearLogs}
              run={run} onViewLogs={scrollLogs} onRunAgain={handleRunAgain}
              onStop={handleStop} onPause={handlePause} onResume={handleResume} onRetry={handleRetry}
              workflowId={workflowId} warnings={warnings} onSaveDraft={setWorkflow}
            />
          : <ViewComponent
              theme={theme}
              onThemeToggle={handleThemeToggle}
              onNavigate={navigate}
              onViewLogs={scrollLogs}
              user={user}
              globalSearch={globalSearch}
              onSearchClear={() => setGlobalSearch('')}
            />}
      </div>
    </main>
    <MobileNav active={mobileTab} onChange={handleMobileNav} onLogout={handleLogout} />
    {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
  </div>
}