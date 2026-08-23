// Demo backend simulator.
// Used when the real backend is unreachable, so the demo webpage works standalone.
// Simulates the same API contract as the real backend.
//
// Data is persisted per user in localStorage, keyed by the session user id:
//   · Refresh-safe — workflows / runs / notifications survive reloads.
//   · User-isolated — each logged-in email gets their own empty store
//     (demo account `u_demo` is seeded with sample workflows on first run).

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const STORE_PREFIX = 'procelya-demo-'

// Authoritative in-memory registry for live executions.
// The simulation writes directly to these run objects, and the polling
// stream reads from the same objects — guaranteeing WORKFLOW_COMPLETED
// is always delivered. Final state is still persisted to the user's
// localStorage store, so runs survive a refresh.
const liveRuns = new Map()

function currentUserId() {
  try {
    const session = JSON.parse(localStorage.getItem('procelya-session') || 'null')
    if (session && session.id) return session.id
  } catch { /* ignore */ }
  return null
}

function storeKey() {
  const uid = currentUserId()
  return STORE_PREFIX + (uid || 'anonymous')
}

function getStore() {
  let store = null
  try {
    store = JSON.parse(localStorage.getItem(storeKey()) || 'null')
  } catch { store = null }
  if (!store) {
    store = { workflows: [], runs: [], nextRun: 1, notifications: [], seeded: false }
  }
  // Seed the built-in demo account (u_demo) once so the demo experience is preserved.
  if (currentUserId() === 'u_demo' && !store.seeded) {
    seedWorkflows(store)
    store.seeded = true
    saveStore(store)
  }
  return store
}

function saveStore(store) {
  try {
    localStorage.setItem(storeKey(), JSON.stringify(store))
  } catch { /* storage full or unavailable — degrade to in-memory only */ }
}

// ------------------------------------------------------------
// Seeded demo workflows (demo account only)
// ------------------------------------------------------------
function seedWorkflows(store) {
  const now = Date.now()
  store.workflows = [
    {
      _id: 'wf-order-placed',
      projectName: 'sample-flow',
      workflowName: 'OrderPlacedFlow',
      description: 'When an order is placed, notify the vendor, create an invoice, update inventory if the stock is physical, and send a confirmation to the customer.',
      triggerEvent: { type: 'order.placed', schema: 'orders' },
      steps: [
        { stepId: 'step-001', name: 'Notify Vendor', order: 1, actionType: 'function', functionName: 'NotifyVendorOnOrder', inputMapping: { orderId: '{{trigger.order.id}}', vendorId: '{{trigger.order.vendor_id}}' }, onSuccess: 'step-002', onFailure: { action: 'abort', targetStepId: null } },
        { stepId: 'step-002', name: 'Create Invoice', order: 2, actionType: 'formCreate', schema: 'invoices', inputMapping: { orderId: '{{trigger.order.id}}', customerId: '{{trigger.order.customer_id}}' }, onSuccess: 'step-003', onFailure: { action: 'abort', targetStepId: null } },
        { stepId: 'step-003', name: 'Update Inventory', order: 3, actionType: 'operation', functionName: 'UpdateInventory', inputMapping: { orderId: '{{trigger.order.id}}', stockType: '{{trigger.stock_type}}' }, condition: { field: '{{trigger.stock_type}}', operator: '==', value: 'physical' }, onSuccess: 'step-004', onFailure: { action: 'skip', targetStepId: null } },
        { stepId: 'step-004', name: 'Send Confirmation', order: 4, actionType: 'function', functionName: 'SendOrderConfirmation', inputMapping: { orderId: '{{trigger.order.id}}', customerId: '{{trigger.order.customer_id}}' }, onSuccess: null, onFailure: { action: 'abort', targetStepId: null } }
      ],
      status: 'published',
      version: 1,
      isActive: true,
      publishedAt: new Date(now - 86400000).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
      createdAt: new Date(now - 86400000).toISOString()
    },
    {
      _id: 'wf-asset-approval',
      projectName: 'sample-flow',
      workflowName: 'AssetRequestApprovalFlow',
      description: 'Handle asset request approval. If approved, update the request and create the asset. If rejected, reject and notify the requester.',
      triggerEvent: { type: 'asset.request', schema: 'assets' },
      steps: [
        { stepId: 'step-001', name: 'Validate Asset Request', order: 1, actionType: 'function', functionName: 'ValidateAssetRequest', inputMapping: { assetId: '{{trigger.asset_id}}', requesterId: '{{trigger.requester_id}}' }, onSuccess: 'step-002', onFailure: { action: 'abort', targetStepId: null } },
        { stepId: 'step-002', name: 'Notify Approver', order: 2, actionType: 'function', functionName: 'NotifyApprover', inputMapping: { requestId: '{{trigger.request_id}}', approverId: '{{trigger.approver_id}}' }, onSuccess: 'step-003', onFailure: { action: 'abort', targetStepId: null } },
        { stepId: 'step-003', name: 'Update Request', order: 3, actionType: 'operation', functionName: 'UpdateRequest', inputMapping: { requestId: '{{trigger.request_id}}', status: '{{trigger.approval}}' }, condition: { field: '{{trigger.approval}}', operator: '==', value: 'YES' }, onSuccess: 'step-004', onFailure: { action: 'redirect', targetStepId: 'step-005' } },
        { stepId: 'step-004', name: 'Create Asset', order: 4, actionType: 'operation', functionName: 'CreateAsset', inputMapping: { assetName: '{{trigger.asset_name}}', requesterId: '{{trigger.requester_id}}' }, onSuccess: null, onFailure: { action: 'abort', targetStepId: null } },
        { stepId: 'step-005', name: 'Reject Request', order: 5, actionType: 'operation', functionName: 'RejectRequest', inputMapping: { requestId: '{{trigger.request_id}}', reason: '{{trigger.reason}}' }, condition: { field: '{{trigger.approval}}', operator: '==', value: 'NO' }, onSuccess: 'step-006', onFailure: { action: 'abort', targetStepId: null } },
        { stepId: 'step-006', name: 'Notify Requester', order: 6, actionType: 'function', functionName: 'NotifyRequester', inputMapping: { requestId: '{{trigger.request_id}}', requesterId: '{{trigger.requester_id}}', decision: '{{trigger.approval}}' }, onSuccess: null, onFailure: { action: 'abort', targetStepId: null } }
      ],
      status: 'published',
      version: 1,
      isActive: true,
      publishedAt: new Date(now - 172800000).toISOString(),
      updatedAt: new Date(now - 7200000).toISOString(),
      createdAt: new Date(now - 172800000).toISOString()
    },
    {
      _id: 'wf-invoice-settlement',
      projectName: 'sample-flow',
      workflowName: 'InvoiceSettlementFlow',
      description: 'Evaluate payment status. If received, release vendor payment and generate receipts.',
      triggerEvent: { type: 'invoice.payment', schema: 'invoices' },
      steps: [
        { stepId: 'step-001', name: 'Release Vendor Payment', order: 1, actionType: 'operation', functionName: 'ReleaseVendorPayment', inputMapping: { invoiceId: '{{trigger.invoice_id}}', vendorId: '{{trigger.vendor_id}}', amount: '{{trigger.amount}}' }, condition: { field: '{{trigger.payment_status}}', operator: '==', value: 'received' }, onSuccess: 'step-002', onFailure: { action: 'skip', targetStepId: null } },
        { stepId: 'step-002', name: 'Generate Receipt', order: 2, actionType: 'function', functionName: 'GenerateReceipt', inputMapping: { invoiceId: '{{trigger.invoice_id}}', amount: '{{trigger.amount}}' }, onSuccess: null, onFailure: { action: 'abort', targetStepId: null } }
      ],
      status: 'published',
      version: 1,
      isActive: true,
      publishedAt: new Date(now - 259200000).toISOString(),
      updatedAt: new Date(now - 10800000).toISOString(),
      createdAt: new Date(now - 259200000).toISOString()
    }
  ]
}

// Resolve {{trigger.field}} expressions
function resolveValue(expression, context) {
  if (typeof expression !== 'string') return expression
  const match = expression.match(/^\{\{([\w.-]+)\}\}$/)
  if (!match) return expression
  const path = match[1].split('.')
  let value = context
  for (const key of path) {
    if (value == null) return undefined
    value = value[key]
  }
  return value
}

function resolveInputMapping(mapping, context) {
  const resolved = {}
  for (const [key, value] of Object.entries(mapping || {})) {
    resolved[key] = resolveValue(value, context)
  }
  return resolved
}

function evaluateCondition(condition, context) {
  if (!condition || !condition.field) return true
  const actual = resolveValue(condition.field, context)
  const expected = condition.value
  switch (condition.operator) {
    case '==': return actual == expected
    case '!=': return actual != expected
    case '>': return actual > expected
    case '<': return actual < expected
    case '>=': return actual >= expected
    case '<=': return actual <= expected
    case 'contains': return String(actual || '').includes(String(expected))
    case 'exists': return actual != null && actual !== undefined && actual !== ''
    default: return true
  }
}

// Simulated function handlers
const functionHandlers = {
  NotifyVendorOnOrder: async (input) => ({ vendorId: input.vendorId || 'VND-001', orderId: input.orderId, notifiedAt: new Date().toISOString(), channel: 'webhook' }),
  SendOrderConfirmation: async (input) => ({ customerId: input.customerId, orderId: input.orderId, confirmationId: 'CONF-' + Math.random().toString(36).slice(2, 8).toUpperCase(), sentAt: new Date().toISOString() }),
  ValidateAssetRequest: async (input) => {
    if (!input.assetId || !input.requesterId) throw new Error('Asset request is missing required fields')
    return { assetId: input.assetId, requesterId: input.requesterId, validated: true, validatedAt: new Date().toISOString() }
  },
  NotifyApprover: async (input) => ({ approverId: input.approverId || 'APR-001', requestId: input.requestId, notifiedAt: new Date().toISOString() }),
  NotifyRequester: async (input) => ({ requesterId: input.requesterId, requestId: input.requestId, decision: input.decision, notifiedAt: new Date().toISOString() }),
  GenerateReceipt: async (input) => ({ invoiceId: input.invoiceId, receiptId: 'RCPT-' + Math.random().toString(36).slice(2, 8).toUpperCase(), amount: input.amount, generatedAt: new Date().toISOString() }),
  CreateRecord: async (input) => ({ recordId: 'REC-' + Math.random().toString(36).slice(2, 8).toUpperCase(), ...input, createdAt: new Date().toISOString() }),
  NotifyTeam: async (input) => ({ team: input.team || 'default', message: input.message || 'Notification sent', sentAt: new Date().toISOString() })
}

const operationHandlers = {
  UpdateInventory: async (input) => ({ orderId: input.orderId, stockType: input.stockType, quantity: input.quantity || 1, inventoryUpdated: true, updatedAt: new Date().toISOString() }),
  UpdateRequest: async (input) => ({ requestId: input.requestId, status: input.status || 'UPDATED', updatedAt: new Date().toISOString() }),
  ReleaseVendorPayment: async (input) => ({ invoiceId: input.invoiceId, vendorId: input.vendorId, amount: input.amount, paymentReleased: true, releasedAt: new Date().toISOString() }),
  CreateAsset: async (input) => ({ assetId: 'AST-' + Math.random().toString(36).slice(2, 8).toUpperCase(), assetName: input.assetName || 'New Asset', createdBy: input.requesterId, createdAt: new Date().toISOString() }),
  RejectRequest: async (input) => ({ requestId: input.requestId, status: 'REJECTED', reason: input.reason || 'Rejected by approver', rejectedAt: new Date().toISOString() })
}

const formHandlers = {
  formCreate: async (schema, input) => ({ schema, recordId: schema + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(), ...input, createdAt: new Date().toISOString() }),
  formUpdate: async (schema, input) => ({ schema, recordId: input.recordId || input.id, ...input, updatedAt: new Date().toISOString() }),
  formDelete: async (schema, input) => ({ schema, recordId: input.recordId || input.id, deleted: true, deletedAt: new Date().toISOString() })
}

async function dispatchStep(step, input) {
  await delay(120 + Math.random() * 150)
  switch (step.actionType) {
    case 'function': {
      const handler = functionHandlers[step.functionName]
      if (!handler) throw new Error(`Unknown function: ${step.functionName}`)
      return handler(input)
    }
    case 'operation': {
      const handler = operationHandlers[step.functionName]
      if (!handler) throw new Error(`Unknown operation: ${step.functionName}`)
      return handler(input)
    }
    case 'formCreate':
    case 'formUpdate':
    case 'formDelete': {
      const handler = formHandlers[step.actionType]
      if (!handler) throw new Error(`Unknown form action: ${step.actionType}`)
      return handler(step.schema, input)
    }
    default:
      throw new Error(`Unsupported actionType: ${step.actionType}`)
  }
}

// Rule-based detection
function ruleBasedDetect(description) {
  const text = description.toLowerCase()
  const steps = []
  let order = 1
  const addStep = (step) => { step.stepId = 'step-' + String(order).padStart(3, '0'); step.order = order; steps.push(step); order++ }

  if (text.includes('order') && (text.includes('place') || text.includes('notify'))) {
    addStep({ name: 'Notify Vendor', actionType: 'function', functionName: 'NotifyVendorOnOrder', inputMapping: { orderId: '{{trigger.order.id}}', vendorId: '{{trigger.order.vendor_id}}' } })
    addStep({ name: 'Create Invoice', actionType: 'formCreate', schema: 'invoices', inputMapping: { orderId: '{{trigger.order.id}}', customerId: '{{trigger.order.customer_id}}' } })
    addStep({ name: 'Update Inventory', actionType: 'operation', functionName: 'UpdateInventory', inputMapping: { orderId: '{{trigger.order.id}}', stockType: '{{trigger.stock_type}}' }, condition: { field: '{{trigger.stock_type}}', operator: '==', value: 'physical' } })
    addStep({ name: 'Send Confirmation', actionType: 'function', functionName: 'SendOrderConfirmation', inputMapping: { orderId: '{{trigger.order.id}}', customerId: '{{trigger.order.customer_id}}' } })
    return { workflowName: 'OrderPlacedFlow', description, triggerEvent: { type: 'order.placed', schema: 'orders' }, steps }
  }
  if (text.includes('asset') && (text.includes('approve') || text.includes('request'))) {
    addStep({ name: 'Validate Asset Request', actionType: 'function', functionName: 'ValidateAssetRequest', inputMapping: { assetId: '{{trigger.asset_id}}', requesterId: '{{trigger.requester_id}}' } })
    addStep({ name: 'Notify Approver', actionType: 'function', functionName: 'NotifyApprover', inputMapping: { requestId: '{{trigger.request_id}}', approverId: '{{trigger.approver_id}}' } })
    addStep({ name: 'Update Request', actionType: 'operation', functionName: 'UpdateRequest', inputMapping: { requestId: '{{trigger.request_id}}', status: '{{trigger.approval}}' }, condition: { field: '{{trigger.approval}}', operator: '==', value: 'YES' } })
    addStep({ name: 'Create Asset', actionType: 'operation', functionName: 'CreateAsset', inputMapping: { assetName: '{{trigger.asset_name}}', requesterId: '{{trigger.requester_id}}' } })
    addStep({ name: 'Reject Request', actionType: 'operation', functionName: 'RejectRequest', inputMapping: { requestId: '{{trigger.request_id}}', reason: '{{trigger.reason}}' }, condition: { field: '{{trigger.approval}}', operator: '==', value: 'NO' } })
    addStep({ name: 'Notify Requester', actionType: 'function', functionName: 'NotifyRequester', inputMapping: { requestId: '{{trigger.request_id}}', requesterId: '{{trigger.requester_id}}', decision: '{{trigger.approval}}' } })
    return { workflowName: 'AssetRequestApprovalFlow', description, triggerEvent: { type: 'asset.request', schema: 'assets' }, steps }
  }
  if (text.includes('invoice') && (text.includes('payment') || text.includes('settle'))) {
    addStep({ name: 'Release Vendor Payment', actionType: 'operation', functionName: 'ReleaseVendorPayment', inputMapping: { invoiceId: '{{trigger.invoice_id}}', vendorId: '{{trigger.vendor_id}}', amount: '{{trigger.amount}}' }, condition: { field: '{{trigger.payment_status}}', operator: '==', value: 'received' } })
    addStep({ name: 'Generate Receipt', actionType: 'function', functionName: 'GenerateReceipt', inputMapping: { invoiceId: '{{trigger.invoice_id}}', amount: '{{trigger.amount}}' } })
    return { workflowName: 'InvoiceSettlementFlow', description, triggerEvent: { type: 'invoice.payment', schema: 'invoices' }, steps }
  }
  addStep({ name: 'Create Record', actionType: 'formCreate', schema: 'orders', inputMapping: { data: '{{trigger}}' } })
  addStep({ name: 'Notify Team', actionType: 'function', functionName: 'NotifyTeam', inputMapping: { message: 'Workflow triggered' } })
  return { workflowName: 'GenericFlow', description, triggerEvent: { type: 'generic.trigger', schema: 'orders' }, steps }
}

// Demo API — every read/mutation is scoped to the current user's store
// and persisted to localStorage so it survives refresh.
export const demoApi = {
  health: async () => ({ backend: true, database: true, realtime: true }),

  getNotifications: async () => {
    await delay(100)
    const store = getStore()
    return store.notifications || []
  },

  detect: async (description) => {
    await delay(400)
    const workflow = ruleBasedDetect(description)
    return { workflow, warnings: [], validation: { valid: true, errors: [], warnings: [] } }
  },

  createWorkflow: async (data) => {
    await delay(200)
    const store = getStore()
    const wf = {
      _id: 'wf-' + Date.now().toString(36),
      ...data,
      status: 'draft',
      version: 1,
      isActive: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    store.workflows.unshift(wf)
    saveStore(store)
    return wf
  },

  listWorkflows: async () => {
    await delay(150)
    const store = getStore()
    return store.workflows.filter(w => !w.isDeleted)
  },

  getWorkflow: async (id) => {
    await delay(100)
    const store = getStore()
    return store.workflows.find(w => w._id === id)
  },

  updateDraft: async (id, data) => {
    await delay(150)
    const store = getStore()
    const wf = store.workflows.find(w => w._id === id)
    if (wf) {
      if (data.steps) wf.steps = data.steps
      if (data.triggerEvent) wf.triggerEvent = data.triggerEvent
      if (data.description !== undefined) wf.description = data.description
      if (data.workflowName) wf.workflowName = data.workflowName
      wf.updatedAt = new Date().toISOString()
      saveStore(store)
    }
    return wf
  },

  publishWorkflow: async (id) => {
    await delay(200)
    const store = getStore()
    const wf = store.workflows.find(w => w._id === id)
    if (wf) {
      wf.status = 'published'
      wf.isActive = true
      wf.publishedAt = new Date().toISOString()
      wf.version = (wf.version || 1) + 1
      saveStore(store)
    }
    return wf
  },

  getVersions: async (id) => {
    await delay(100)
    const store = getStore()
    const wf = store.workflows.find(w => w._id === id)
    return wf ? [wf] : []
  },

  validateWorkflow: async (id) => {
    await delay(100)
    return { valid: true, errors: [], warnings: [] }
  },

  aiEdit: async (id, prompt) => {
    await delay(300)
    const store = getStore()
    const wf = store.workflows.find(w => w._id === id)
    const text = prompt.toLowerCase()
    const steps = [...(wf?.steps || [])]
    const changes = []

    if (text.includes('notify') || text.includes('notification')) {
      const newStep = { stepId: 'step-' + String(steps.length + 1).padStart(3, '0'), name: 'Notify Team', order: steps.length + 1, actionType: 'function', functionName: 'NotifyTeam', inputMapping: { message: 'Workflow notification' } }
      steps.push(newStep)
      changes.push({ type: 'added', step: newStep })
    }
    if (text.includes('create') || text.includes('add')) {
      const newStep = { stepId: 'step-' + String(steps.length + 1).padStart(3, '0'), name: 'Create Record', order: steps.length + 1, actionType: 'formCreate', schema: 'orders', inputMapping: { data: '{{trigger}}' } }
      steps.push(newStep)
      changes.push({ type: 'added', step: newStep })
    }
    if (text.includes('remove') || text.includes('delete')) {
      const target = steps[steps.length - 1]
      if (target) { changes.push({ type: 'removed', stepId: target.stepId, name: target.name }); steps.pop() }
    }
    if (changes.length === 0) {
      changes.push({ type: 'info', message: 'No actionable changes detected from your prompt. Try describing a specific modification.' })
    }
    return { workflowId: id, prompt, changes, preview: { ...wf, steps } }
  },

  triggerWorkflow: async (id, payload) => {
    await delay(100)
    const store = getStore()
    const wf = store.workflows.find(w => w._id === id)
    if (!wf) throw new Error('Workflow not found')
    if (!wf.isActive) throw new Error('Workflow is not active. Publish it first.')

    // Generate admin notifications for order workflows
    const wfName = (wf.workflowName || '').toLowerCase()
    if (wfName.includes('order')) {
      const now = Date.now()
      const stockType = payload?.stock_type || 'physical'
      if (!store.notifications) store.notifications = []
      store.notifications.unshift({
        id: 'notif-order-' + Date.now().toString(36),
        type: 'order',
        title: 'Order Confirmed',
        message: `Payment received for order ${payload?.order?.id || 'ORD-2026-014'}. Stock type: ${stockType}. Confirmation sent to vendor and customer.`,
        time: new Date(now).toISOString(),
        read: false,
        tag: 'admin'
      })
      store.notifications.unshift({
        id: 'notif-stock-' + Date.now().toString(36),
        type: 'inventory',
        title: 'Inventory Updated',
        message: `Stock quantity updated for ${stockType} items after order confirmation. Inventory level checked and updated.`,
        time: new Date(now - 2000).toISOString(),
        read: false,
        tag: 'admin'
      })
    }

    const runId = 'run-' + (store.nextRun++).toString(36) + Date.now().toString(36)
    const run = {
      _id: runId,
      workflowId: id,
      workflowVersion: wf.version,
      triggerPayload: payload,
      status: 'PENDING',
      startedAt: null,
      completedAt: null,
      stepResults: [],
      totalDuration: 0,
      createdAt: new Date().toISOString(),
      events: []
    }
    store.runs.unshift(run)
    saveStore(store)

    // Register the live run so streaming reads from the same in-memory object
    // the simulation writes to (guarantees WORKFLOW_COMPLETED is delivered).
    liveRuns.set(runId, run)

    // Execute asynchronously
    executeDemo(wf, run, payload)
    return { runId, status: 'PENDING' }
  },

  getRun: async (id) => {
    await delay(100)
    // Prefer the authoritative live object; fall back to the persisted store.
    const live = liveRuns.get(id)
    if (live) return live
    const store = getStore()
    return store.runs.find(r => r._id === id)
  },

  listRuns: async () => {
    await delay(150)
    const store = getStore()
    // Overlay any live runs so the dashboard/executions always see the
    // authoritative status and totalDuration, not a stale PENDING snapshot.
    return store.runs.map(r => liveRuns.get(r._id) || r)
  },

  listFunctions: async () => {
    await delay(100)
    return {
      functions: Object.keys(functionHandlers),
      operations: Object.keys(operationHandlers)
    }
  },

  listProjects: async () => {
    await delay(150)
    const store = getStore()
    const projects = [...new Set(store.workflows.map(w => w.projectName))]
    return projects.map(name => ({
      _id: 'proj-' + name,
      name,
      desc: `Project with schemas, functions, and operations`,
      workflows: store.workflows.filter(w => w.projectName === name).length,
      schemas: ['orders', 'invoices', 'assets'],
      functions: Object.keys(functionHandlers),
      operations: Object.keys(operationHandlers),
      updated: new Date().toISOString()
    }))
  },

  streamEvents: (runId, handlers) => {
    // For demo mode, use polling since EventSource needs a real server.
    // Always read from the authoritative in-memory run — the simulation
    // writes to the exact same object, so WORKFLOW_COMPLETED is never missed.
    let lastEventCount = 0
    const interval = setInterval(() => {
      const run = liveRuns.get(runId)
      if (!run) {
        clearInterval(interval)
        return
      }

      const events = run.events || []
      for (let i = lastEventCount; i < events.length; i++) {
        const ev = events[i]
        if (ev.type === 'STEP_STARTED') handlers.onStepStarted?.(ev.data)
        if (ev.type === 'STEP_COMPLETED') handlers.onStepCompleted?.(ev.data)
        if (ev.type === 'WORKFLOW_COMPLETED') handlers.onWorkflowCompleted?.(ev.data)
      }
      lastEventCount = events.length

      if (run.status === 'COMPLETED' || run.status === 'FAILED') {
        clearInterval(interval)
        // Drop the live ref once done; the persisted store keeps it.
        liveRuns.delete(runId)
      }
    }, 80)
    return { close: () => { clearInterval(interval); liveRuns.delete(runId) } }
  }
}

// Copy the authoritative live run's current state into the persisted store.
// This is essential: the live run object is mutated in place, but the store
// is re-read from localStorage on each save — so we must sync by id to ensure
// the final status (COMPLETED/FAILED) and totalDuration reach the dashboard.
function persistRun(run) {
  const store = getStore()
  const idx = store.runs.findIndex(r => r._id === run._id)
  if (idx !== -1) {
    store.runs[idx] = { ...run }
  } else {
    store.runs.unshift({ ...run })
  }
  saveStore(store)
}

async function executeDemo(wf, run, payload) {
  // `run` is the authoritative live object (also in liveRuns).
  run.status = 'RUNNING'
  run.startedAt = new Date().toISOString()
  run.events = []
  persistRun(run)

  const context = { trigger: payload }
  const steps = [...wf.steps].sort((a, b) => a.order - b.order)
  const totalStart = Date.now()

  for (const step of steps) {
    const stepStart = Date.now()
    run.events.push({ type: 'STEP_STARTED', data: { runId: run._id, stepId: step.stepId, name: step.name } })
    persistRun(run)

    const conditionMet = evaluateCondition(step.condition, context)

    if (!conditionMet) {
      const result = {
        stepId: step.stepId,
        status: 'SKIPPED',
        input: {},
        output: { skipped: true, reason: `Condition not met: ${step.condition?.field} ${step.condition?.operator} ${step.condition?.value}` },
        error: null,
        duration: Date.now() - stepStart
      }
      run.stepResults.push(result)
      run.events.push({ type: 'STEP_COMPLETED', data: { runId: run._id, stepId: step.stepId, status: 'SKIPPED', input: result.input, output: result.output, duration: result.duration } })
      persistRun(run)
      continue
    }

    const input = resolveInputMapping(step.inputMapping, context)
    try {
      const output = await dispatchStep(step, input)
      const result = { stepId: step.stepId, status: 'SUCCESS', input, output, error: null, duration: Date.now() - stepStart }
      run.stepResults.push(result)
      context[step.stepId] = output
      run.events.push({ type: 'STEP_COMPLETED', data: { runId: run._id, stepId: step.stepId, status: 'SUCCESS', input, output, duration: result.duration } })
      persistRun(run)
    } catch (err) {
      const result = { stepId: step.stepId, status: 'FAILED', input, output: {}, error: err.message, duration: Date.now() - stepStart }
      run.stepResults.push(result)
      run.events.push({ type: 'STEP_COMPLETED', data: { runId: run._id, stepId: step.stepId, status: 'FAILED', input, output: {}, error: err.message, duration: result.duration } })
      persistRun(run)
      const failure = step.onFailure || { action: 'abort' }
      if (failure.action === 'abort') {
        run.status = 'FAILED'
        run.completedAt = new Date().toISOString()
        run.totalDuration = Date.now() - totalStart
        run.events.push({ type: 'WORKFLOW_COMPLETED', data: { runId: run._id, status: 'FAILED', totalDuration: run.totalDuration } })
        persistRun(run)
        return
      }
      if (failure.action === 'skip') continue
    }
  }

  run.status = 'COMPLETED'
  run.completedAt = new Date().toISOString()
  run.totalDuration = Date.now() - totalStart
  run.events.push({ type: 'WORKFLOW_COMPLETED', data: { runId: run._id, status: 'COMPLETED', totalDuration: run.totalDuration } })
  persistRun(run)
}
