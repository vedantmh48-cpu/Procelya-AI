import { Fragment, useEffect, useState } from 'react'
import { Search, CheckCircle2, XCircle, LoaderCircle, Pause, RotateCcw, Download, ChevronDown } from 'lucide-react'
import api from '../api/client'

const statusIcons = {
  COMPLETED: <CheckCircle2 size={15}/>,
  FAILED: <XCircle size={15}/>,
  RUNNING: <LoaderCircle className="spin" size={15}/>,
  PENDING: <Pause size={15}/>
}

const statusMap = {
  COMPLETED: 'success',
  FAILED: 'failed',
  RUNNING: 'running',
  PENDING: 'paused'
}

export default function ExecutionsView() {
  const [executions, setExecutions] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listRuns()
        setExecutions(data)
      } catch (err) {
        console.error('Failed to load runs:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = executions.filter(e => {
    const matchesSearch = (e._id || '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || statusMap[e.status] === filter
    return matchesSearch && matchesFilter
  })

  const retry = async (id) => {
    try {
      const run = executions.find(e => e._id === id)
      if (run) {
        const result = await api.triggerWorkflow(run.workflowId, run.triggerPayload)
        const data = await api.listRuns()
        setExecutions(data)
      }
    } catch (err) {
      console.error('Retry error:', err)
    }
  }

  const exportCSV = () => {
    const header = 'ID,Workflow,Status,Started,Duration,Steps\n'
    const rows = executions.map(e => `${e._id},${e.workflowId},${e.status},${e.startedAt},${e.totalDuration},${e.stepResults?.length || 0}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'executions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return <div className="view-page">
    <div className="dash-head">
      <div><h1>Executions</h1><p>Track all workflow runs and their outcomes.</p></div>
      <button className="ghost" onClick={exportCSV}><Download size={14}/>Export CSV</button>
    </div>

    <div className="toolbar">
      <div className="search-box">
        <Search size={15}/>
        <input placeholder="Search by run ID..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>
      <div className="filter-tabs">
        {['All', 'success', 'failed', 'running', 'paused'].map(f => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
            {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    </div>

    <div className="panel exec-detail">
      <div className="table-wrap">
        {loading ? <div className="empty-state"><p>Loading executions...</p></div> : (
          <table className="exec-table">
            <thead><tr><th>RUN ID</th><th>WORKFLOW</th><th>STATUS</th><th>STARTED</th><th>DURATION</th><th>STEPS</th><th></th></tr></thead>
            <tbody>
              {filtered.map(e => {
                const status = statusMap[e.status] || 'paused'
                return (
                  <Fragment key={e._id}>
                    <tr className={`exec-row ${expanded === e._id ? 'expanded' : ''}`} onClick={() => setExpanded(expanded === e._id ? null : e._id)}>
                      <td className="mono">{e._id.slice(-8)}</td>
                      <td>{e.workflowId}</td>
                      <td><span className={`status-pill ${status}`}>{statusIcons[e.status]}{e.status}</span></td>
                      <td>{e.startedAt ? new Date(e.startedAt).toLocaleString() : '—'}</td>
                      <td className="mono">{e.totalDuration ? `${e.totalDuration}ms` : '—'}</td>
                      <td className="mono">{e.stepResults?.length || 0}</td>
                      <td><ChevronDown size={14} className={`chev ${expanded === e._id ? 'open' : ''}`}/></td>
                    </tr>
                    {expanded === e._id && (
                      <tr className="exec-expand">
                        <td colSpan="7">
                          <div className="exec-detail-body">
                            <div className="detail-grid">
                              <div><small>Run ID</small><strong>{e._id}</strong></div>
                              <div><small>Workflow</small><strong>{e.workflowId}</strong></div>
                              <div><small>Status</small><strong className={`status-text ${status}`}>{e.status}</strong></div>
                              <div><small>Started</small><strong>{e.startedAt ? new Date(e.startedAt).toLocaleString() : '—'}</strong></div>
                              <div><small>Duration</small><strong>{e.totalDuration ? `${e.totalDuration}ms` : '—'}</strong></div>
                              <div><small>Version</small><strong>v{e.workflowVersion}</strong></div>
                            </div>
                            <div className="step-results">
                              <small>Step Results</small>
                              {(e.stepResults || []).map((sr, i) => (
                                <div className={`step-result ${sr.status.toLowerCase()}`} key={i}>
                                  <span>{sr.stepId}</span>
                                  <em>{sr.status}</em>
                                  <small>{sr.duration}ms</small>
                                </div>
                              ))}
                            </div>
                            <div className="detail-actions">
                              <button className="ghost" onClick={() => { setExpanded(null); retry(e._id) }}><RotateCcw size={13}/>Retry</button>
                              <button className="ghost"><Download size={13}/>Download Logs</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
        {!loading && !filtered.length && <div className="empty-state"><p>No executions found.</p></div>}
      </div>
    </div>
  </div>
}