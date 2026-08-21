// Safe backend function registry.
// All workflow steps dispatch to these validated handlers.
// No eval() or unvalidated code execution is ever used.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const registry = {
  // ---- Order Placed Flow ----
  NotifyVendorOnOrder: async (input) => {
    await delay(120)
    return {
      vendorId: input.vendorId || 'VND-001',
      orderId: input.orderId,
      notifiedAt: new Date().toISOString(),
      channel: 'webhook'
    }
  },

  SendOrderConfirmation: async (input) => {
    await delay(90)
    return {
      customerId: input.customerId,
      orderId: input.orderId,
      confirmationId: 'CONF-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      sentAt: new Date().toISOString()
    }
  },

  // ---- Asset Request Approval Flow ----
  ValidateAssetRequest: async (input) => {
    await delay(100)
    const valid = Boolean(input.assetId && input.requesterId)
    if (!valid) throw new Error('Asset request is missing required fields (assetId, requesterId)')
    return {
      assetId: input.assetId,
      requesterId: input.requesterId,
      validated: true,
      validatedAt: new Date().toISOString()
    }
  },

  NotifyApprover: async (input) => {
    await delay(80)
    return {
      approverId: input.approverId || 'APR-001',
      requestId: input.requestId,
      notifiedAt: new Date().toISOString()
    }
  },

  NotifyRequester: async (input) => {
    await delay(70)
    return {
      requesterId: input.requesterId,
      requestId: input.requestId,
      decision: input.decision,
      notifiedAt: new Date().toISOString()
    }
  },

  // ---- Invoice Settlement Flow ----
  GenerateReceipt: async (input) => {
    await delay(85)
    return {
      invoiceId: input.invoiceId,
      receiptId: 'RCPT-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      amount: input.amount,
      generatedAt: new Date().toISOString()
    }
  },

  // ---- Generic / fallback ----
  CreateRecord: async (input) => {
    await delay(60)
    return { recordId: 'REC-' + Math.random().toString(36).slice(2, 8).toUpperCase(), ...input, createdAt: new Date().toISOString() }
  },

  NotifyTeam: async (input) => {
    await delay(50)
    return { team: input.team || 'default', message: input.message || 'Notification sent', sentAt: new Date().toISOString() }
  }
}

export function getFunction(name) {
  return registry[name] || null
}

export function listFunctions() {
  return Object.keys(registry)
}