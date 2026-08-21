import { Zap, Bell, FilePlus, Settings2, Send, LoaderCircle, Trash2, RefreshCcw, Check, AlertTriangle } from 'lucide-react'
import Panel from './Panel'

const icons = { Bell, FilePlus, Settings2, Send }

const actionLabels = {
  function: 'FUNCTION',
  formCreate: 'CREATE',
  formUpdate: 'UPDATE',
  formDelete: 'DELETE',
  operation: 'OPERATION'
}

export default function DetectedWorkflowPanel({ detected, workflow, accepted, accepting, onDiscard, onAccept, warnings }) {
  if (!detected) return <Panel eyebrow="STEP 02" title="Detected Workflow" subtitle="Run detection to see the workflow Procelya AI identifies." className="detected empty"><div className="empty-copy">Waiting for AI analysis</div></Panel>

  const steps = workflow?.steps || []

  return <Panel
    eyebrow="STEP 02"
    title="Detected Workflow"
    subtitle={accepted ? 'Workflow generated — scroll down to view the diagram.' : 'Generated from your description.'}
    className="detected"
  >
    <div className="trigger">
      <span className="trigger-icon"><Zap size={17}/></span>
      <div><strong>{workflow?.workflowName || 'Detected Flow'}</strong><small>Trigger: {workflow?.triggerEvent?.type || 'N/A'}</small></div>
      {steps.some(s => s.condition) && <span className="condition">Conditional Step</span>}
    </div>
    {warnings?.length > 0 && (
      <div className="detect-warnings">
        {warnings.map((w, i) => (
          <div key={i}><AlertTriangle size={12}/>{w}</div>
        ))}
      </div>
    )}
    <div className="step-grid">
      {steps.map(s => {
        const Icon = icons[s.icon] || Send
        return <div className="step-chip" key={s.stepId}>
          <div><small>{s.stepId}</small><Icon size={15}/></div>
          <strong>{s.name}</strong>
          <em className={`badge ${(s.actionType || 'function').toLowerCase()}`}>{actionLabels[s.actionType] || s.actionType}</em>
        </div>
      })}
    </div>
    <footer className="detected-footer">
      <button className="ghost" onClick={onDiscard} disabled={accepting} title="Discard workflow">
        {accepted ? <><RefreshCcw size={14}/>Re-detect</> : <><Trash2 size={14}/>Discard</>}
      </button>
      <button className="flame-btn" onClick={onAccept} disabled={accepted || accepting}>
        {accepted
          ? <><Check size={15}/>Workflow Generated</>
          : accepting
            ? <><LoaderCircle className="spin" size={15}/>Generating...</>
            : 'Accept & Generate Diagram ->'}
      </button>
    </footer>
  </Panel>
}