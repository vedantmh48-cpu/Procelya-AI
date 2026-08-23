import { Play, LoaderCircle, Clock, Database, Repeat, Store, Package, CreditCard, Truck } from 'lucide-react'
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
      <pre>{JSON.stringify({
        order: { id: payload.orderId, customer_id: payload.customerId, vendor_id: payload.vendorId, vendor_name: payload.vendorName },
        stock_type: payload.stockType,
        quantity: Number(payload.quantity) || 0,
        delivery_method: payload.deliveryMethod,
        amount: Number(payload.amount) || 0,
        currency: payload.currency,
        payment_type: payload.paymentType,
        payment_status: payload.paymentStatus
      }, null, 2)}</pre>
    </div>
    <div className="payload-section">
      <div className="payload-section-title"><Store size={14}/>Vendor</div>
      <div className="payload-fields">
        <label>Vendor ID
          <input value={payload.vendorId} onChange={e => update('vendorId', e.target.value)} disabled={running}/>
        </label>
        <label>Vendor Name
          <input value={payload.vendorName} onChange={e => update('vendorName', e.target.value)} disabled={running}/>
        </label>
      </div>
    </div>
    <div className="payload-section">
      <div className="payload-section-title"><Store size={14}/>Order & Customer</div>
      <div className="payload-fields">
        <label>Order ID
          <input value={payload.orderId} onChange={e => update('orderId', e.target.value)} disabled={running}/>
        </label>
        <label>Customer ID
          <input value={payload.customerId} onChange={e => update('customerId', e.target.value)} disabled={running}/>
        </label>
      </div>
    </div>
    <div className="payload-section">
      <div className="payload-section-title"><Package size={14}/>Inventory</div>
      <div className="payload-fields">
        <label>Inventory Type
          <select value={payload.stockType} onChange={e => update('stockType', e.target.value)} disabled={running}>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
          </select>
        </label>
        <label>Quantity
          <input type="number" min="1" value={payload.quantity} onChange={e => update('quantity', e.target.value)} disabled={running}/>
        </label>
      </div>
    </div>
    <div className="payload-section">
      <div className="payload-section-title"><CreditCard size={14}/>Payment</div>
      <div className="payload-fields">
        <label>Amount
          <input type="number" min="0.01" step="0.01" required value={payload.amount} onChange={e => update('amount', e.target.value)} disabled={running}/>
        </label>
        <label>Currency
          <select value={payload.currency} onChange={e => update('currency', e.target.value)} disabled={running}>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </label>
        <label>Payment Type
          <select value={payload.paymentType} onChange={e => update('paymentType', e.target.value)} disabled={running}>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="wallet">Wallet</option>
          </select>
        </label>
        <label>Payment Status
          <select value={payload.paymentStatus} onChange={e => update('paymentStatus', e.target.value)} disabled={running}>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="failed">Failed</option>
          </select>
        </label>
      </div>
    </div>
    <div className="payload-section">
      <div className="payload-section-title"><Truck size={14}/>Fulfillment</div>
      <div className="payload-fields">
        <label>Delivery Method
          <select value={payload.deliveryMethod} onChange={e => update('deliveryMethod', e.target.value)} disabled={running}>
            <option value="standard">Standard</option>
            <option value="express">Express</option>
            <option value="pickup">Pickup</option>
          </select>
        </label>
      </div>
    </div>
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