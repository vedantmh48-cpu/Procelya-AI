import { useState } from 'react'
import { Sparkles, LoaderCircle, Check, X, Plus, Minus, Pencil } from 'lucide-react'
import Panel from './Panel'
import api from '../api/client'

export default function AIEditPanel({ workflowId, workflow, onApply }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [applying, setApplying] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim() || !workflowId) return
    setLoading(true)
    try {
      const result = await api.aiEdit(workflowId, prompt)
      setPreview(result)
    } catch (err) {
      console.error('AI edit error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!preview) return
    setApplying(true)
    try {
      await api.updateDraft(workflowId, { steps: preview.preview.steps })
      onApply?.(preview.preview)
      setPreview(null)
      setPrompt('')
    } catch (err) {
      console.error('Apply error:', err)
    } finally {
      setApplying(false)
    }
  }

  const changeIcon = (type) => {
    if (type === 'added') return <Plus size={13} className="diff-add"/>
    if (type === 'removed') return <Minus size={13} className="diff-remove"/>
    if (type === 'modified') return <Pencil size={13} className="diff-modify"/>
    return <Sparkles size={13} className="diff-info"/>
  }

  return <Panel
    eyebrow="AI ASSISTANT"
    title="Ask AI to modify workflow"
    subtitle="Describe a change and preview the diff before applying."
    className="ai-edit"
  >
    <div className="ai-input-row">
      <input
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="e.g. Add a notification step after the invoice is created"
        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
      />
      <button className="flame-btn" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
        {loading ? <><LoaderCircle className="spin" size={15}/>Analyzing...</> : <><Sparkles size={15}/>Generate Diff</>}
      </button>
    </div>

    {preview && (
      <div className="diff-preview">
        <div className="diff-head">
          <strong>Change Preview</strong>
          <button className="icon-btn" onClick={() => setPreview(null)}><X size={14}/></button>
        </div>
        <div className="diff-list">
          {preview.changes.map((change, i) => (
            <div className={`diff-row ${change.type}`} key={i}>
              <span className="diff-icon">{changeIcon(change.type)}</span>
              <div className="diff-content">
                {change.type === 'added' && (
                  <>
                    <strong>+ Added Step: {change.step?.name}</strong>
                    <small>{change.step?.actionType} · {change.step?.functionName || change.step?.schema}</small>
                  </>
                )}
                {change.type === 'removed' && (
                  <>
                    <strong>- Removed Step: {change.name}</strong>
                    <small>{change.stepId}</small>
                  </>
                )}
                {change.type === 'modified' && (
                  <>
                    <strong>~ Modified: {change.field}</strong>
                    <small>Before: {JSON.stringify(change.before)} → After: {JSON.stringify(change.after)}</small>
                  </>
                )}
                {change.type === 'info' && (
                  <>
                    <strong>ℹ {change.message}</strong>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="diff-actions">
          <button className="ghost" onClick={() => setPreview(null)}>Cancel</button>
          <button className="flame-btn" onClick={handleApply} disabled={applying}>
            {applying ? <><LoaderCircle className="spin" size={14}/>Applying...</> : <><Check size={14}/>Apply Change</>}
          </button>
        </div>
      </div>
    )}
  </Panel>
}