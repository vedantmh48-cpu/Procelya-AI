// AI detection service.
// Calls Gemini API with strict project context rules to generate Workflow IR.
// Falls back to a deterministic rule-based detector if no API key is configured.

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

function buildPrompt(description, projectContext) {
  return `You are a workflow detection engine for the PS11 platform.
You must ONLY use the exact schemas, functions, and operations listed in the project context below.
Do NOT invent any schemas, functions, or operations that are not listed.

Project Context:
- Schemas: ${JSON.stringify(projectContext.schemas || [])}
- Functions: ${JSON.stringify(projectContext.functions || [])}
- Operations: ${JSON.stringify(projectContext.operations || [])}

Business requirement:
"${description}"

Generate a workflow IR as strict JSON with this exact shape:
{
  "workflowName": "string",
  "description": "string",
  "triggerEvent": { "type": "string", "schema": "string" },
  "steps": [
    {
      "stepId": "step-001",
      "name": "string",
      "order": 1,
      "actionType": "function" | "formCreate" | "formUpdate" | "formDelete" | "operation",
      "functionName": "string (only if actionType is function or operation)",
      "schema": "string (only if actionType is formCreate/formUpdate/formDelete)",
      "inputMapping": { "key": "{{trigger.field}}" },
      "condition": { "field": "string", "operator": "==" | "!=" | ">" | "<" | ">=" | "<=" | "contains" | "exists", "value": "mixed" },
      "onSuccess": "stepId or null",
      "onFailure": { "action": "abort" | "skip" | "redirect", "targetStepId": "string or null" }
    }
  ]
}

Rules:
- stepId must be unique and sequential (step-001, step-002, ...).
- order must be sequential starting at 1.
- Only use actionType "function" with functionName from the Functions list.
- Only use actionType "operation" with functionName from the Operations list.
- Only use actionType "formCreate"/"formUpdate"/"formDelete" with schema from the Schemas list.
- inputMapping values reference trigger payload fields like {{trigger.fieldName}}.
- Return ONLY the JSON object, no markdown, no commentary.`
}

export async function detectWorkflow(description, projectContext) {
  const apiKey = process.env.AI_API_KEY

  if (apiKey) {
    try {
      const response = await fetch(GEMINI_URL + '?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(description, projectContext) }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
        })
      })

      if (!response.ok) {
        throw new Error('Gemini API error: ' + response.status)
      }

      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('Could not parse AI response')
    } catch (err) {
      console.warn('AI detection failed, falling back to rule-based:', err.message)
    }
  }

  return ruleBasedDetect(description, projectContext)
}

// Deterministic fallback detector
function ruleBasedDetect(description, projectContext) {
  const text = description.toLowerCase()
  const schemas = projectContext.schemas || []
  const functions = projectContext.functions || []
  const operations = projectContext.operations || []

  const steps = []
  let order = 1

  const addStep = (step) => {
    step.stepId = 'step-' + String(order).padStart(3, '0')
    step.order = order
    steps.push(step)
    order++
  }

  // Order Placed flow
  if (text.includes('order') && (text.includes('place') || text.includes('notify'))) {
    if (functions.includes('NotifyVendorOnOrder')) {
      addStep({
        name: 'Notify Vendor',
        actionType: 'function',
        functionName: 'NotifyVendorOnOrder',
        inputMapping: { orderId: '{{trigger.order.id}}', vendorId: '{{trigger.order.vendor_id}}' }
      })
    }
    if (schemas.includes('invoices')) {
      addStep({
        name: 'Create Invoice',
        actionType: 'formCreate',
        schema: 'invoices',
        inputMapping: { orderId: '{{trigger.order.id}}', customerId: '{{trigger.order.customer_id}}' }
      })
    }
    if (operations.includes('UpdateInventory')) {
      addStep({
        name: 'Update Inventory',
        actionType: 'operation',
        functionName: 'UpdateInventory',
        inputMapping: { orderId: '{{trigger.order.id}}', stockType: '{{trigger.stock_type}}' },
        condition: { field: '{{trigger.stock_type}}', operator: '==', value: 'physical' }
      })
    }
    if (functions.includes('SendOrderConfirmation')) {
      addStep({
        name: 'Send Confirmation',
        actionType: 'function',
        functionName: 'SendOrderConfirmation',
        inputMapping: { orderId: '{{trigger.order.id}}', customerId: '{{trigger.order.customer_id}}' }
      })
    }
    return {
      workflowName: 'OrderPlacedFlow',
      description,
      triggerEvent: { type: 'order.placed', schema: 'orders' },
      steps
    }
  }

  // Asset Request Approval flow
  if (text.includes('asset') && (text.includes('approve') || text.includes('request'))) {
    if (functions.includes('ValidateAssetRequest')) {
      addStep({
        name: 'Validate Asset Request',
        actionType: 'function',
        functionName: 'ValidateAssetRequest',
        inputMapping: { assetId: '{{trigger.asset_id}}', requesterId: '{{trigger.requester_id}}' }
      })
    }
    if (functions.includes('NotifyApprover')) {
      addStep({
        name: 'Notify Approver',
        actionType: 'function',
        functionName: 'NotifyApprover',
        inputMapping: { requestId: '{{trigger.request_id}}', approverId: '{{trigger.approver_id}}' }
      })
    }
    if (operations.includes('UpdateRequest')) {
      addStep({
        name: 'Update Request',
        actionType: 'operation',
        functionName: 'UpdateRequest',
        inputMapping: { requestId: '{{trigger.request_id}}', status: '{{trigger.approval}}' },
        condition: { field: '{{trigger.approval}}', operator: '==', value: 'YES' }
      })
    }
    if (operations.includes('CreateAsset')) {
      addStep({
        name: 'Create Asset',
        actionType: 'operation',
        functionName: 'CreateAsset',
        inputMapping: { assetName: '{{trigger.asset_name}}', requesterId: '{{trigger.requester_id}}' }
      })
    }
    if (operations.includes('RejectRequest')) {
      addStep({
        name: 'Reject Request',
        actionType: 'operation',
        functionName: 'RejectRequest',
        inputMapping: { requestId: '{{trigger.request_id}}', reason: '{{trigger.reason}}' },
        condition: { field: '{{trigger.approval}}', operator: '==', value: 'NO' }
      })
    }
    if (functions.includes('NotifyRequester')) {
      addStep({
        name: 'Notify Requester',
        actionType: 'function',
        functionName: 'NotifyRequester',
        inputMapping: { requestId: '{{trigger.request_id}}', requesterId: '{{trigger.requester_id}}', decision: '{{trigger.approval}}' }
      })
    }
    return {
      workflowName: 'AssetRequestApprovalFlow',
      description,
      triggerEvent: { type: 'asset.request', schema: 'assets' },
      steps
    }
  }

  // Invoice Settlement flow
  if (text.includes('invoice') && (text.includes('payment') || text.includes('settle'))) {
    if (operations.includes('ReleaseVendorPayment')) {
      addStep({
        name: 'Release Vendor Payment',
        actionType: 'operation',
        functionName: 'ReleaseVendorPayment',
        inputMapping: { invoiceId: '{{trigger.invoice_id}}', vendorId: '{{trigger.vendor_id}}', amount: '{{trigger.amount}}' },
        condition: { field: '{{trigger.payment_status}}', operator: '==', value: 'received' }
      })
    }
    if (functions.includes('GenerateReceipt')) {
      addStep({
        name: 'Generate Receipt',
        actionType: 'function',
        functionName: 'GenerateReceipt',
        inputMapping: { invoiceId: '{{trigger.invoice_id}}', amount: '{{trigger.amount}}' }
      })
    }
    return {
      workflowName: 'InvoiceSettlementFlow',
      description,
      triggerEvent: { type: 'invoice.payment', schema: 'invoices' },
      steps
    }
  }

  // Generic fallback
  addStep({
    name: 'Create Record',
    actionType: 'formCreate',
    schema: schemas[0] || 'orders',
    inputMapping: { data: '{{trigger}}' }
  })
  if (functions.length) {
    addStep({
      name: 'Notify Team',
      actionType: 'function',
      functionName: functions[0],
      inputMapping: { message: 'Workflow triggered' }
    })
  }
  return {
    workflowName: 'GenericFlow',
    description,
    triggerEvent: { type: 'generic.trigger', schema: schemas[0] || 'orders' },
    steps
  }
}