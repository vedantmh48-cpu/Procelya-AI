// Safe backend operation registry.
// Operations are dispatched to these validated handlers.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const registry = {
  UpdateInventory: async (input) => {
    await delay(140)
    return {
      orderId: input.orderId,
      stockType: input.stockType,
      quantity: input.quantity || 1,
      inventoryUpdated: true,
      updatedAt: new Date().toISOString()
    }
  },

  UpdateRequest: async (input) => {
    await delay(110)
    return {
      requestId: input.requestId,
      status: input.status || 'UPDATED',
      updatedAt: new Date().toISOString()
    }
  },

  ReleaseVendorPayment: async (input) => {
    await delay(130)
    return {
      invoiceId: input.invoiceId,
      vendorId: input.vendorId,
      amount: input.amount,
      paymentReleased: true,
      releasedAt: new Date().toISOString()
    }
  },

  CreateAsset: async (input) => {
    await delay(95)
    return {
      assetId: 'AST-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      assetName: input.assetName || 'New Asset',
      createdBy: input.requesterId,
      createdAt: new Date().toISOString()
    }
  },

  RejectRequest: async (input) => {
    await delay(75)
    return {
      requestId: input.requestId,
      status: 'REJECTED',
      reason: input.reason || 'Rejected by approver',
      rejectedAt: new Date().toISOString()
    }
  }
}

export function getOperation(name) {
  return registry[name] || null
}

export function listOperations() {
  return Object.keys(registry)
}