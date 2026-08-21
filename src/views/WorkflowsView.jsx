import { useEffect, useState } from 'react'
import { Search, Plus, MoreVertical, Play, Copy, Pencil, Trash2, Zap, Bell, FilePlus, Settings2, Send, Clock, GitBranch, PlaySquare, Download, FileText } from 'lucide-react'
import api from '../api/client'
import { jsPDF } from 'jspdf'

const iconMap = { Zap, Bell, FilePlus, Settings2, Send }

const actionIcons = {
  function: Bell,
  formCreate: FilePlus,
  formUpdate: Settings2,
  formDelete: Settings2,
  operation: Settings2
}

export default function WorkflowsView({ onNavigate }) {
  const [workflows, setWorkflows] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [menuOpen, setMenuOpen] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listWorkflows()
        setWorkflows(data)
      } catch (err) {
        console.error('Failed to load workflows:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = workflows.filter(w => {
    const matchesSearch = (w.workflowName || '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || w.status === filter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const toggleStatus = async (id) => {
    const wf = workflows.find(w => w._id === id)
    if (!wf) return
    try {
      if (wf.status === 'published') {
        // Archive
        await api.updateDraft(id, {})
      } else {
        await api.publishWorkflow(id)
      }
      const data = await api.listWorkflows()
      setWorkflows(data)
    } catch (err) {
      console.error('Toggle status error:', err)
    }
    setMenuOpen(null)
  }

  const duplicate = async (id) => {
    const wf = workflows.find(w => w._id === id)
    if (!wf) return
    try {
      await api.createWorkflow({
        projectName: wf.projectName,
        workflowName: `${wf.workflowName} (Copy)`,
        description: wf.description,
        triggerEvent: wf.triggerEvent,
        steps: wf.steps
      })
      const data = await api.listWorkflows()
      setWorkflows(data)
    } catch (err) {
      console.error('Duplicate error:', err)
    }
    setMenuOpen(null)
  }

  const remove = async (id) => {
    try {
      await api.updateDraft(id, {})
      const data = await api.listWorkflows()
      setWorkflows(data)
    } catch (err) {
      console.error('Delete error:', err)
    }
    setMenuOpen(null)
  }

  const downloadJson = (wf) => {
    const blob = new Blob([JSON.stringify(wf, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(wf.workflowName || 'workflow').replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPdf = (wf) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 14
    let y = 20

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(wf.workflowName || 'Workflow', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80)
    const desc = wf.description || 'No description'
    const descLines = doc.splitTextToSize(desc, pageWidth - margin * 2)
    doc.text(descLines, margin, y)
    y += descLines.length * 5 + 6

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text(`Project: ${wf.projectName || 'N/A'}`, margin, y)
    y += 6
    doc.text(`Trigger: ${wf.triggerEvent?.type || 'N/A'}`, margin, y)
    y += 6
    doc.text(`Version: v${wf.version || 1}`, margin, y)
    y += 6
    doc.text(`Status: ${wf.status || 'draft'}`, margin, y)
    y += 12

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Workflow Steps', margin, y)
    y += 8

    const steps = wf.steps || []
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

    doc.save(`${(wf.workflowName || 'workflow').replace(/\s+/g, '_')}.pdf`)
  }

  const getIcon = (wf) => {
    const firstStep = wf.steps?.[0]
    if (firstStep) return actionIcons[firstStep.actionType] || Zap
    return Zap
  }

  const getStatus = (wf) => {
    if (wf.isActive) return 'Active'
    if (wf.status === 'draft') return 'Draft'
    if (wf.status === 'archived') return 'Archived'
    return wf.status
  }

  return <div className="view-page">
    <div className="dash-head">
      <div><h1>Workflows</h1><p>Manage all your automated workflows.</p></div>
      <button className="flame-btn" onClick={() => onNavigate('Workflow Builder')}><Plus size={15}/>New Workflow</button>
    </div>

    <div className="toolbar">
      <div className="search-box">
        <Search size={15}/>
        <input placeholder="Search workflows..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>
      <div className="filter-tabs">
        {['All', 'Active', 'Draft', 'Archived'].map(f => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
    </div>

    {loading ? <div className="empty-state"><p>Loading workflows...</p></div> : (
      <div className="workflow-grid">
        {filtered.map(wf => {
          const Icon = getIcon(wf)
          const status = getStatus(wf)
          return <div className={`wf-card ${status.toLowerCase()}`} key={wf._id}>
            <div className="wf-card-head">
              <span className="wf-icon"><Icon size={18}/></span>
              <span className={`wf-status ${status.toLowerCase()}`}>{status}</span>
              <div className="wf-menu-wrap">
                <button className="icon-btn" onClick={() => setMenuOpen(menuOpen === wf._id ? null : wf._id)}><MoreVertical size={15}/></button>
                {menuOpen === wf._id && <div className="wf-menu">
                  <button onClick={() => onNavigate('Workflow Builder')}><Play size={13}/>Run</button>
                  <button onClick={() => onNavigate('Workflow Builder')}><Pencil size={13}/>Edit</button>
                  <button onClick={() => duplicate(wf._id)}><Copy size={13}/>Duplicate</button>
                  <button onClick={() => downloadJson(wf)}><Download size={13}/>Download JSON</button>
                  <button onClick={() => downloadPdf(wf)}><FileText size={13}/>Download PDF</button>
                  <button onClick={() => toggleStatus(wf._id)}><Clock size={13}/>{status === 'Active' ? 'Archive' : 'Publish'}</button>
                  <button className="danger" onClick={() => remove(wf._id)}><Trash2 size={13}/>Delete</button>
                </div>}
              </div>
            </div>
            <h3>{wf.workflowName}</h3>
            <p className="wf-desc">{wf.description || 'No description'}</p>
            <div className="wf-meta">
              <span><GitBranch size={13}/>{wf.steps?.length || 0} steps</span>
              <span><PlaySquare size={13}/>v{wf.version}</span>
              <span><Clock size={13}/>{new Date(wf.updatedAt).toLocaleString()}</span>
            </div>
            <div className="wf-stats">
              <div><small>Status</small><strong className={status.toLowerCase()}>{status}</strong></div>
              <div><small>Version</small><strong>v{wf.version}</strong></div>
              <div><small>Trigger</small><strong>{wf.triggerEvent?.type || '—'}</strong></div>
            </div>
          </div>
        })}
      </div>
    )}
    {!loading && !filtered.length && <div className="empty-state"><p>No workflows found matching your search.</p></div>}
  </div>
}