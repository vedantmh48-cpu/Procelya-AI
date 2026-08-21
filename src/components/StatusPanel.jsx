import { CheckCircle2, Circle, FileText, Play, Square, Pause, RotateCcw, Trash2, LoaderCircle, XCircle } from 'lucide-react'
import Panel from './Panel'

export default function StatusPanel({ run, logs, onViewLogs, onRunAgain, onStop, onPause, onResume, onRetry, onClear }) {
  const done = run?.status === 'completed'
  const running = run?.status === 'running'
  const stopped = run?.status === 'stopped'
  const paused = run?.status === 'paused'
  const failed = run?.status === 'failed'
  const totalSteps = run?.totalSteps || logs.length || 0
  const totalTime = done && run?.started && run?.completed
    ? `${((run.completed - run.started) / 1000).toFixed(2)}s`
    : '—'

  const title = done ? 'Workflow Completed' : running ? 'Workflow Running' : stopped ? 'Workflow Stopped' : paused ? 'Workflow Paused' : failed ? 'Workflow Failed' : 'Awaiting Run'
  const subtitle = done ? 'All steps executed successfully' : running ? 'Executing steps in real-time' : stopped ? 'Execution was stopped by user' : paused ? 'Execution paused — resume to continue' : failed ? 'One or more steps failed' : 'Ready when you are.'

  return <Panel
    eyebrow="RUN STATUS"
    title={title}
    subtitle={subtitle}
    className="status"
  >
    <div className={`status-icon ${done ? 'done' : running ? 'running' : stopped ? 'stopped' : paused ? 'paused' : failed ? 'failed' : ''}`}>
      {done ? <CheckCircle2/> : running ? <LoaderCircle className="spin"/> : stopped ? <Square/> : paused ? <Pause/> : failed ? <XCircle/> : <Circle/>}
    </div>
    <dl>
      <div><dt>Total Steps</dt><dd>{totalSteps}</dd></div>
      <div><dt>Total Time</dt><dd>{totalTime}</dd></div>
      <div><dt>Started At</dt><dd>{run?.started ? new Date(run.started).toLocaleTimeString([]) : '—'}</dd></div>
      <div><dt>Completed At</dt><dd>{run?.completed ? new Date(run.completed).toLocaleTimeString([]) : '—'}</dd></div>
    </dl>
    <div className="status-actions">
      {!run && <button className="ghost full" onClick={onRunAgain}><Play size={15}/>Run Workflow</button>}
      {running && <>
        <button className="ghost" onClick={onPause}><Pause size={15}/>Pause</button>
        <button className="ghost danger" onClick={onStop}><Square size={15}/>Stop</button>
      </>}
      {paused && <button className="ghost full" onClick={onResume}><Play size={15}/>Resume</button>}
      {stopped && <button className="ghost full" onClick={onRetry}><RotateCcw size={15}/>Retry</button>}
      {failed && <button className="ghost full" onClick={onRetry}><RotateCcw size={15}/>Retry</button>}
      {done && <button className="ghost full" onClick={onRunAgain}><Play size={15}/>Run Again</button>}
      {logs.length > 0 && <button className="ghost full" onClick={onViewLogs}><FileText size={15}/>View Full Logs</button>}
      {logs.length > 0 && <button className="ghost full danger" onClick={onClear}><Trash2 size={15}/>Clear Logs</button>}
    </div>
  </Panel>
}