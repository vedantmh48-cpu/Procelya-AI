import { useEffect, useState } from 'react'
import { Workflow, PlaySquare, Timer, CheckCircle2, TrendingUp, Zap, Clock, Activity, AlertCircle, FolderKanban } from 'lucide-react'
import api from '../api/client'

export default function DashboardView({ onNavigate, user }) {
  const [workflows, setWorkflows] = useState([])
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [wfData, runData] = await Promise.all([api.listWorkflows(), api.listRuns()])
        setWorkflows(wfData)
        setRuns(runData)
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalWorkflows = workflows.length
  const totalRuns = runs.length
  const completedRuns = runs.filter(r => r.status === 'COMPLETED').length
  const successRate = totalRuns ? Math.round((completedRuns / totalRuns) * 100) : 0
  const avgDuration = totalRuns
    ? (runs.reduce((sum, r) => sum + (r.totalDuration || 0), 0) / totalRuns).toFixed(0)
    : 0

  const stats = [
    { label: 'Total Workflows', value: totalWorkflows, icon: Workflow, color: 'flame', change: `+${totalWorkflows}`, up: true },
    { label: 'Executions', value: totalRuns, icon: PlaySquare, color: 'blue', change: `+${totalRuns}`, up: true },
    { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle2, color: 'green', change: `${successRate}%`, up: true },
    { label: 'Avg. Run Time', value: avgDuration ? `${avgDuration}ms` : '—', icon: Timer, color: 'purple', change: 'real', up: true }
  ]

  const recentActivity = runs.slice(0, 6).map(r => ({
    id: r._id,
    action: r.status === 'COMPLETED' ? 'Workflow executed' : r.status === 'FAILED' ? 'Workflow failed' : 'Workflow running',
    name: r.workflowId,
    status: r.status === 'COMPLETED' ? 'success' : r.status === 'FAILED' ? 'failed' : 'running',
    time: r.startedAt ? new Date(r.startedAt).toLocaleString() : '—',
    runId: r._id.slice(-8)
  }))

  const topWorkflows = workflows.slice(0, 4).map((wf, i) => ({
    name: wf.workflowName,
    runs: runs.filter(r => r.workflowId === wf._id).length,
    success: 100,
    time: '—'
  }))

  return <div className="dashboard">
    <div className="dash-head">
      <div>
        <h1 data-mobile-welcome={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}>Dashboard</h1>
        <p>Welcome back, {user?.name?.split(' ')[0] || 'there'}. Here's what's happening with your workflows.</p>
      </div>
      <button className="flame-btn" onClick={() => onNavigate('Workflow Builder')}><Zap size={15}/>New Workflow</button>
    </div>

    {loading ? <div className="empty-state"><p>Loading dashboard...</p></div> : (
      <>
        <div className="stat-grid">
          {stats.map(({ label, value, icon: Icon, color, change, up }) => (
            <div className={`stat-card ${color}`} key={label}>
              <div className="stat-icon"><Icon size={19}/></div>
              <div className="stat-info">
                <span className="stat-label">{label}</span>
                <strong className="stat-value">{value}</strong>
                <span className={`stat-change ${up ? 'up' : 'down'}`}><TrendingUp size={11}/>{change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-grid">
          <div className="panel chart-panel">
            <header className="panel-head">
              <div><div className="eyebrow">ANALYTICS</div><h2>Execution Trend</h2><p>Recent workflow executions</p></div>
              <div className="chart-legend"><span className="legend-dot flame"/>Executions</div>
            </header>
            <div className="chart-wrap">
              <div className="chart-bars">
                {runs.slice(0, 12).map((r, i) => (
                  <div key={i} className="bar" style={{ height: `${Math.max(10, (r.totalDuration || 100) / 10)}%` }}/>
                ))}
              </div>
            </div>
          </div>

          <div className="panel top-flows">
            <header className="panel-head">
              <div><div className="eyebrow">PERFORMANCE</div><h2>Top Workflows</h2><p>Most recent workflows</p></div>
            </header>
            <div className="flow-list">
              {topWorkflows.map((wf, i) => (
                <div className="flow-row" key={wf.name}>
                  <span className="flow-rank">{i + 1}</span>
                  <div className="flow-main">
                    <strong>{wf.name}</strong>
                    <div className="progress"><span style={{ width: `${wf.success}%` }}/></div>
                  </div>
                  <div className="flow-meta">
                    <span>{wf.runs} runs</span>
                    <em>{wf.success}%</em>
                    <small>{wf.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-grid lower">
          <div className="panel activity-panel">
            <header className="panel-head">
              <div><div className="eyebrow">LIVE FEED</div><h2>Recent Activity</h2><p>Latest events across your workflows</p></div>
              <button className="ghost" onClick={() => onNavigate('Executions')}>View All</button>
            </header>
            <div className="activity-list">
              {recentActivity.map(act => (
                <div className="activity-row" key={act.id}>
                  <span className={`activity-dot ${act.status}`}/>
                  <div>
                    <strong>{act.action}</strong> <em>{act.name}</em>
                    <small>{act.time}</small>
                  </div>
                  <span className={`activity-badge ${act.status}`}>{act.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel quick-actions">
            <header className="panel-head">
              <div><div className="eyebrow">QUICK START</div><h2>Shortcuts</h2><p>Common tasks to get you moving</p></div>
            </header>
            <div className="quick-grid">
              <button className="quick-btn" onClick={() => onNavigate('Workflow Builder')}><Zap size={18}/><span><strong>New Workflow</strong><small>Build from scratch</small></span></button>
              <button className="quick-btn" onClick={() => onNavigate('Workflows')}><FolderKanban size={18}/><span><strong>My Workflows</strong><small>Manage existing</small></span></button>
              <button className="quick-btn" onClick={() => onNavigate('Executions')}><Activity size={18}/><span><strong>Executions</strong><small>View run history</small></span></button>
              <button className="quick-btn" onClick={() => onNavigate('API Keys')}><AlertCircle size={18}/><span><strong>API Keys</strong><small>Manage access</small></span></button>
            </div>
            <div className="system-health">
              <div className="health-icon"><Clock size={18}/></div>
              <div><strong>System Status</strong><small>Connected to backend</small></div>
              <span className="health-badge">LIVE</span>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
}
