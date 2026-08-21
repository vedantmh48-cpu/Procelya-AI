const catalog = [
  { terms: ['notify', 'vendor', 'email', 'message'], label: 'Notify Vendor', type: 'FUNCTION', icon: 'Bell', path: '/functions/notify-vendor', message: 'Vendor notified successfully' },
  { terms: ['invoice', 'bill'], label: 'Create Invoice', type: 'CREATE', icon: 'FilePlus', path: '/forms/invoices', message: 'Invoice created successfully' },
  { terms: ['inventory', 'stock'], label: 'Update Inventory', type: 'OPERATION', icon: 'Settings2', path: '/operations/inventory', message: 'Inventory updated successfully', conditional: true },
  { terms: ['confirm', 'customer', 'receipt'], label: 'Send Confirmation', type: 'FUNCTION', icon: 'Send', path: '/functions/send-confirmation', message: 'Confirmation sent successfully' },
  { terms: ['approve', 'approval'], label: 'Request Approval', type: 'OPERATION', icon: 'Settings2', path: '/operations/approval', message: 'Approval request created' },
  { terms: ['payment', 'charge'], label: 'Process Payment', type: 'OPERATION', icon: 'Settings2', path: '/operations/payment', message: 'Payment processed successfully' },
]
const titleCase = value => value.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
export function generateWorkflow(description) {
  const picked = catalog.filter(item => item.terms.some(term => description.toLowerCase().includes(term)))
  const base = picked.length ? picked : [{ label: 'Create Record', type: 'CREATE', icon: 'FilePlus', path: '/forms/records', message: 'Record created successfully' }, { label: 'Notify Team', type: 'FUNCTION', icon: 'Bell', path: '/functions/notify-team', message: 'Team notified successfully' }]
  const match = description.match(/when (?:an? )?([\w\s-]+?)(?: is |,| then)/i)
  const triggerName = match ? titleCase(match[1].trim()) : 'Request Received'
  const steps = base.slice(0, 5).map((item, index) => ({ ...item, id: String(index + 1).padStart(2, '0'), duration: 180 + index * 55 }))
  return { trigger: { label: triggerName, sub: `event / ${triggerName.toLowerCase().replace(/\s+/g, '-')}` }, steps, confidence: Math.min(98, 78 + steps.length * 4) }
}
