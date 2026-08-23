import { Sparkles, LoaderCircle, Store, Package, CreditCard, Bell, ClipboardCheck, RefreshCw } from 'lucide-react'
import Panel from './Panel'

const quickStarts = [
	{ label: 'Vendor order', icon: Store, text: 'When an order is placed, notify the vendor, create an invoice, update inventory, and send a confirmation to the customer.' },
	{ label: 'Inventory update', icon: Package, text: 'When inventory changes, update the stock quantity and notify the vendor if the inventory type is physical.' },
	{ label: 'Vendor payment', icon: CreditCard, text: 'When an invoice payment is received, release the vendor payment and generate a receipt for the transaction.' },
	{ label: 'Notify vendor', icon: Bell, text: 'When an order is placed, notify the vendor with the order amount, inventory type, quantity, and delivery method.' },
	{ label: 'Reserve stock', icon: ClipboardCheck, text: 'When an order is placed, check inventory and reserve the requested quantity before notifying the vendor.' },
	{ label: 'Confirm payment', icon: RefreshCw, text: 'When an order payment is received, verify the payment amount and type, update payment status, and notify the vendor.' }
]

export default function RequirementPanel({ value, onChange, detecting, onDetect }) {
	return <Panel eyebrow="STEP 01" title="Describe your business requirement" subtitle="Tell Procelya AI what should happen in plain English." className="requirement">
		<textarea value={value} onChange={e => onChange(e.target.value)} rows="5" />
		<div className="quick-starts">
			<span className="quick-starts-label">Start with a template</span>
			<div className="quick-start-buttons">
				{quickStarts.map(({ label, icon: Icon, text }) => (
					<button key={label} type="button" className={`quick-start-btn ${value === text ? 'selected' : ''}`} onClick={() => onChange(text)}>
						<Icon size={14} />{label}
					</button>
				))}
			</div>
		</div>
		<footer><span><Sparkles size={15}/> AI will detect triggers, actions and conditions</span><button className="flame-btn" onClick={onDetect} disabled={detecting}>{detecting ? <><LoaderCircle className="spin" size={16}/>Detecting...</> : <><Sparkles size={16}/>Detect Workflow</>}</button></footer>
	</Panel>
}
