import { Fragment, useState } from 'react'
import { CheckCircle2, LoaderCircle, XCircle, SkipForward, Trash2, ChevronDown } from 'lucide-react'
import Panel from './Panel'

const statusMap = {
  running: 'Running',
  success: 'Success',
  failed: 'Failed',
  skipped: 'Skipped',
  stopped: 'Stopped',
  paused: 'Paused'
}

const iconMap = {
  running: <LoaderCircle className="spin"/>,
  success: <CheckCircle2/>,
  failed: <XCircle/>,
  skipped: <SkipForward/>,
  stopped: <XCircle/>,
  paused: <LoaderCircle className="spin"/>
}

export default function ExecutionLog({ logs, running, onClear }) {
  const [expanded, setExpanded] = useState(null)

  return <Panel
    eyebrow="LIVE EXECUTION"
    title="Execution Log"
    subtitle="Events stream here as steps complete."
    className="execution"
    actions={<button className="ghost" onClick={onClear} disabled={!logs.length}><Trash2 size={14}/>Clear</button>}
  >
    <div className="table-wrap">
      {!logs.length
        ? <div className="no-log">No execution yet.</div>
        : <table>
            <thead>
              <tr>
                <th>STEP</th>
                <th>ACTION</th>
                <th>TYPE</th>
                <th>STATUS</th>
                <th>MESSAGE</th>
                <th>DURATION</th>
                <th>TIME</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row, i) => (
                <Fragment key={row.id + i}>
                  <tr className={`log-row ${expanded === row.id ? 'expanded' : ''}`} onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                    <td>{row.id}</td>
                    <td>{row.label || row.id}</td>
                    <td><em className={`badge ${(row.type || 'function').toLowerCase()}`}>{row.type || 'function'}</em></td>
                    <td>
                      {row.status === 'running'
                        ? <span className="running">{iconMap.running}{statusMap.running}</span>
                        : row.status === 'failed'
                          ? <span className="failed">{iconMap.failed}{statusMap.failed}</span>
                          : row.status === 'skipped'
                            ? <span className="skipped">{iconMap.skipped}{statusMap.skipped}</span>
                            : row.status === 'stopped'
                              ? <span className="stopped">{iconMap.stopped}{statusMap.stopped}</span>
                              : row.status === 'paused'
                                ? <span className="paused">{iconMap.paused}{statusMap.paused}</span>
                                : <span className="success">{iconMap.success}{statusMap.success}</span>}
                    </td>
                    <td>{row.status === 'running' ? 'Executing step…' : row.error || (row.status === 'skipped' ? 'Condition not met' : 'Completed')}</td>
                    <td>{row.status === 'running' ? '—' : `${row.duration || 0}ms`}</td>
                    <td>{new Date(row.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                    <td><ChevronDown size={13} className={`chev ${expanded === row.id ? 'open' : ''}`}/></td>
                  </tr>
                  {expanded === row.id && (
                    <tr className="exec-expand">
                      <td colSpan="8">
                        <div className="exec-detail-body">
                          <div className="detail-grid">
                            <div><small>Input JSON</small><pre>{JSON.stringify(row.input || {}, null, 2)}</pre></div>
                            <div><small>Output JSON</small><pre>{JSON.stringify(row.output || {}, null, 2)}</pre></div>
                            <div><small>Duration</small><strong>{row.duration || 0}ms</strong></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>}
    </div>
  </Panel>
}