import { Play, LoaderCircle, Clock, Database, Repeat } from 'lucide-react'
import Panel from './Panel'

export default function TriggerPanel({ running, onRun, payload, setPayload }) {
  const update = (key, value) => setPayload(prev => ({ ...prev, [key]: value }))

  return <Panel
    eyebrow="STEP 04"
    title="Trigger Workflow"
    subtitle="Provide a sample payload to execute."
    className="trigger-panel"
  >
    <div className="payload-preview">
      <strong>Payload Preview</strong>
      <pre>{JSON.stringify({ order: { id: payload.orderId, customer_id: payload.customerId }, stock_type: payload.stockType }, null, 2)}</pre>
    </div>
    <label>Order ID
      <input value={payload.orderId} onChange={e => update('orderId', e.target.value)} disabled={running}/>
    </label>
    <label>Customer ID
      <input value={payload.customerId} onChange={e => update('customerId', e.target.value)} disabled={running}/>
    </label>
    <label>Stock Type
      <select value={payload.stockType} onChange={e => update('stockType', e.target.value)} disabled={running}>
        <option value="physical">physical</option>
        <option value="digital">digital</option>
      </select>
    </label>
    <div className="trigger-meta">
      <span><Clock size={13}/>Real-time execution</span>
      <span><Database size={13}/>Persisted to MongoDB</span>
      <span><Repeat size={13}/>SSE event stream</span>
    </div>
    <button className="flame-btn run" onClick={onRun} disabled={running}>
      {running
        ? <><LoaderCircle className="spin" size={17}/>Running…</>
        : <><Play size={16} fill="currentColor"/>Run Workflow</>}
    </button>
  </Panel>
}