import { useEffect, useMemo, useState } from 'react'
import ReactFlow, { Background, Controls, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import { Pencil, Braces, X, Copy, Download, FileText, Maximize2, Minimize2, Save } from 'lucide-react'
import Panel from './Panel'
import { nodeTypes } from './FlowNodes'
import api from '../api/client'

const actionLabels = {
  function: 'FUNCTION',
  formCreate: 'CREATE',
  formUpdate: 'UPDATE',
  formDelete: 'DELETE',
  operation: 'OPERATION'
}

export default function WorkflowDiagram({ workflow, onCopyJson, onDownloadJson, onDownloadPdf, workflowId, onSaveDraft }) {
  const [editing, setEditing] = useState(false)
  const [json, setJson] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState(false)
  const [workflowDraft, setWorkflowDraft] = useState(null)
  const [savingWorkflow, setSavingWorkflow] = useState(false)

  // Build nodes from backend workflow steps
  const initial = useMemo(() => {
    if (!workflow) return []
    const trigger = workflow.triggerEvent || { type: 'trigger', schema: '' }
    return [
      { id: 'trigger', type: 'trigger', position: { x: 20, y: 130 }, data: { label: workflow.workflowName || 'Trigger', sub: `event / ${trigger.type || 'trigger'}` } },
      ...(workflow.steps || []).map((s, i) => ({
        id: s.stepId,
        type: 'step',
        position: { x: 205 + i * 230, y: s.condition ? 55 : 105 },
        data: {
          label: s.name,
          sub: s.functionName || s.schema || s.actionType,
          actionType: s.actionType,
          condition: s.condition,
          status: 'pending'
        }
      }))
    ]
  }, [workflow])

  const [nodes, setNodes, onNodesChange] = useNodesState(initial)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => setNodes(initial), [initial, setNodes])

  // Build edges from workflow steps
  useEffect(() => {
    if (!workflow?.steps) return
    const newEdges = workflow.steps.map((s, i) => ({
      id: `e${s.stepId}`,
      source: i ? workflow.steps[i - 1].stepId : 'trigger',
      target: s.stepId,
      label: 'onSuccess',
      animated: true,
      type: 'smoothstep'
    }))
    setEdges(newEdges)
  }, [workflow, setEdges])

  // Update node statuses from run logs (SSE-driven)
  useEffect(() => {
    if (!workflow?.steps) return
    setNodes(prev => prev.map(node => {
      if (node.id === 'trigger') return node
      const step = workflow.steps.find(s => s.stepId === node.id)
      if (!step) return node
      return { ...node, data: { ...node.data, status: step.status || 'pending' } }
    }))
  }, [workflow, setNodes])

  const handleNodeClick = (event, node) => {
    if (node.id === 'trigger') return
    const step = workflow?.steps?.find(s => s.stepId === node.id)
    if (step) setSelectedNode(step)
  }

  const handleSaveStep = async () => {
    if (!selectedNode || !workflowId) return
    setSaving(true)
    try {
      const updatedSteps = workflow.steps.map(s =>
        s.stepId === selectedNode.stepId ? selectedNode : s
      )
      await api.updateDraft(workflowId, { steps: updatedSteps })
      onSaveDraft?.({ ...workflow, steps: updatedSteps })
      setSelectedNode(null)
    } catch (err) {
      console.error('Save step error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEditWorkflow = () => {
    setWorkflowDraft({ ...workflow })
    setEditingWorkflow(true)
  }

  const handleSaveWorkflow = async () => {
    if (!workflowDraft || !workflowId) return
    setSavingWorkflow(true)
    try {
      await api.updateDraft(workflowId, {
        workflowName: workflowDraft.workflowName,
        description: workflowDraft.description,
        triggerEvent: workflowDraft.triggerEvent
      })
      onSaveDraft?.(workflowDraft)
      setEditingWorkflow(false)
      setWorkflowDraft(null)
    } catch (err) {
      console.error('Save workflow error:', err)
    } finally {
      setSavingWorkflow(false)
    }
  }

  const updateWorkflowField = (field, value) => {
    setWorkflowDraft(prev => ({ ...prev, [field]: value }))
  }

  const updateSelectedField = (field, value) => {
    setSelectedNode(prev => ({ ...prev, [field]: value }))
  }

  const handleCopy = () => {
    onCopyJson()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFullscreen = () => {
    setFullscreen(!fullscreen)
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
  }

  return <Panel
    eyebrow="STEP 03"
    title="Workflow Diagram"
    subtitle={editing ? 'Edit mode: drag nodes to rearrange.' : 'Interactive workflow diagram. Click a node to edit properties.'}
    className={`diagram ${fullscreen ? 'fullscreen' : ''}`}
    actions={<>
      <button className={`ghost ${editing ? 'selected' : ''}`} onClick={() => setEditing(!editing)}>
        <Pencil size={14}/>{editing ? 'Done Editing' : 'Edit Diagram'}
      </button>
      <button className="ghost" onClick={() => setJson(true)}><Braces size={14}/>View JSON</button>
      <button className="ghost" onClick={handleCopy} title="Copy JSON">
        <Copy size={14}/>{copied ? 'Copied!' : 'Copy'}
      </button>
      <button className="ghost" onClick={onDownloadJson} title="Download JSON">
        <Download size={14}/>JSON
      </button>
      <button className="ghost" onClick={onDownloadPdf} title="Download PDF">
        <FileText size={14}/>PDF
      </button>
      <button className="ghost" onClick={handleEditWorkflow} title="Edit Workflow Properties">
        <Pencil size={14}/>Edit Workflow
      </button>
      <button className="ghost" onClick={handleFullscreen} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
        {fullscreen ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
      </button>
    </>}
  >
    <div className="flow-wrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.35}
        maxZoom={1.5}
        nodesConnectable={false}
        nodesDraggable={editing}
        attributionPosition="bottom-right"
      >
        <Background gap={16} size={1}/>
        <Controls showInteractive={false}/>
      </ReactFlow>
    </div>

    {editingWorkflow && workflowDraft && (
      <div className="step-properties">
        <div className="props-head">
          <strong>Workflow Properties</strong>
          <button className="icon-btn" onClick={() => { setEditingWorkflow(false); setWorkflowDraft(null) }}><X size={14}/></button>
        </div>
        <div className="props-grid">
          <label>Workflow Name
            <input value={workflowDraft.workflowName || ''} onChange={e => updateWorkflowField('workflowName', e.target.value)}/>
          </label>
          <label>Project Name
            <input value={workflowDraft.projectName || ''} disabled/>
          </label>
          <label>Trigger Type
            <input value={workflowDraft.triggerEvent?.type || ''} onChange={e => updateWorkflowField('triggerEvent', { ...workflowDraft.triggerEvent, type: e.target.value })} placeholder="e.g. order.placed"/>
          </label>
          <label>Trigger Schema
            <input value={workflowDraft.triggerEvent?.schema || ''} onChange={e => updateWorkflowField('triggerEvent', { ...workflowDraft.triggerEvent, schema: e.target.value })} placeholder="e.g. orders"/>
          </label>
          <label>Description
            <textarea
              rows={3}
              value={workflowDraft.description || ''}
              onChange={e => updateWorkflowField('description', e.target.value)}
            />
          </label>
        </div>
        <div className="props-actions">
          <button className="ghost" onClick={() => { setEditingWorkflow(false); setWorkflowDraft(null) }}>Cancel</button>
          <button className="flame-btn" onClick={handleSaveWorkflow} disabled={savingWorkflow}>
            <Save size={14}/>{savingWorkflow ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </div>
    )}

    {selectedNode && (
      <div className="step-properties">
        <div className="props-head">
          <strong>Step Properties</strong>
          <button className="icon-btn" onClick={() => setSelectedNode(null)}><X size={14}/></button>
        </div>
        <div className="props-grid">
          <label>Step ID
            <input value={selectedNode.stepId} disabled/>
          </label>
          <label>Step Name
            <input value={selectedNode.name} onChange={e => updateSelectedField('name', e.target.value)}/>
          </label>
          <label>Action Type
            <select value={selectedNode.actionType} onChange={e => updateSelectedField('actionType', e.target.value)}>
              {Object.entries(actionLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </label>
          <label>Function / Operation
            <input value={selectedNode.functionName || ''} onChange={e => updateSelectedField('functionName', e.target.value)} placeholder="e.g. NotifyVendorOnOrder"/>
          </label>
          <label>Schema
            <input value={selectedNode.schema || ''} onChange={e => updateSelectedField('schema', e.target.value)} placeholder="e.g. invoices"/>
          </label>
          <label>Condition Field
            <input value={selectedNode.condition?.field || ''} onChange={e => updateSelectedField('condition', { ...selectedNode.condition, field: e.target.value })} placeholder="e.g. {{trigger.stock_type}}"/>
          </label>
          <label>Condition Operator
            <select value={selectedNode.condition?.operator || '=='} onChange={e => updateSelectedField('condition', { ...selectedNode.condition, operator: e.target.value })}>
              {['==', '!=', '>', '<', '>=', '<=', 'contains', 'exists'].map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </label>
          <label>Condition Value
            <input value={selectedNode.condition?.value ?? ''} onChange={e => updateSelectedField('condition', { ...selectedNode.condition, value: e.target.value })} placeholder="e.g. physical"/>
          </label>
          <label>Order
            <input type="number" value={selectedNode.order ?? ''} onChange={e => updateSelectedField('order', Number(e.target.value))}/>
          </label>
          <label>On Success (next step ID)
            <input value={selectedNode.onSuccess || ''} onChange={e => updateSelectedField('onSuccess', e.target.value)} placeholder="e.g. step-002"/>
          </label>
          <label>On Failure Action
            <select value={selectedNode.onFailure?.action || 'abort'} onChange={e => updateSelectedField('onFailure', { ...selectedNode.onFailure, action: e.target.value })}>
              {['abort', 'skip', 'redirect'].map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </label>
          <label>On Failure Target Step ID
            <input value={selectedNode.onFailure?.targetStepId || ''} onChange={e => updateSelectedField('onFailure', { ...selectedNode.onFailure, targetStepId: e.target.value })} placeholder="e.g. step-005"/>
          </label>
          <label>Input Mapping (JSON)
            <textarea
              rows={4}
              value={JSON.stringify(selectedNode.inputMapping || {}, null, 2)}
              onChange={e => {
                try {
                  updateSelectedField('inputMapping', JSON.parse(e.target.value))
                } catch {}
              }}
            />
          </label>
        </div>
        <div className="props-actions">
          <button className="ghost" onClick={() => setSelectedNode(null)}>Cancel</button>
          <button className="flame-btn" onClick={handleSaveStep} disabled={saving}>
            <Save size={14}/>{saving ? 'Saving...' : 'Save Step'}
          </button>
        </div>
      </div>
    )}

    {json && <div className="json-modal">
      <div>
        <button className="icon-btn json-close" onClick={() => setJson(false)}><X size={15}/></button>
        <h3>Workflow JSON</h3>
        <div className="json-actions">
          <button className="ghost" onClick={handleCopy}><Copy size={13}/>{copied ? 'Copied!' : 'Copy'}</button>
          <button className="ghost" onClick={onDownloadJson}><Download size={13}/>JSON</button>
          <button className="ghost" onClick={onDownloadPdf}><FileText size={13}/>PDF</button>
        </div>
        <pre>{JSON.stringify(workflow, null, 2)}</pre>
      </div>
    </div>}
  </Panel>
}