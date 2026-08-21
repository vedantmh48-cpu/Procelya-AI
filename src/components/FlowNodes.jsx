import { Handle, Position } from 'reactflow'
import { Zap, Bell, FilePlus, Settings2, Send, LoaderCircle, CheckCircle2, XCircle, SkipForward } from 'lucide-react'

const icons = { Bell, FilePlus, Settings2, Send }

const statusIcons = {
  running: <LoaderCircle className="spin" size={14}/>,
  success: <CheckCircle2 size={14}/>,
  failed: <XCircle size={14}/>,
  skipped: <SkipForward size={14}/>
}

export function TriggerNode({ data }) {
  return <div className="flow-node trigger-node">
    <Handle type="source" position={Position.Right}/>
    <span className="flow-icon"><Zap size={16}/></span>
    <strong>{data.label}</strong>
    <small>{data.sub}</small>
  </div>
}

export function StepNode({ data }) {
  const Icon = icons[data.icon] || Send
  const status = data.status || 'pending'
  return <div className={`flow-node step-node ${status}`}>
    <Handle type="target" position={Position.Left}/>
    <Handle type="source" position={Position.Right}/>
    <div className="node-top">
      <span className="flow-icon"><Icon size={15}/></span>
      <em className={`badge ${(data.actionType || data.type || 'function').toLowerCase()}`}>{data.actionType || data.type}</em>
      {status !== 'pending' && <span className="node-status">{statusIcons[status]}</span>}
    </div>
    <strong>{data.label}</strong>
    {data.condition && <div className="if-block"><b>IF CONDITION</b>{data.condition.field} {data.condition.operator} {JSON.stringify(data.condition.value)}</div>}
    <small>{data.sub}</small>
  </div>
}

export const nodeTypes = { trigger: TriggerNode, step: StepNode }