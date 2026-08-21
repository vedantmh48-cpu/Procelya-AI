// Safe backend form controller handlers.
// Handles formCreate, formUpdate, formDelete action types.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const formController = {
  formCreate: async (schema, input) => {
    await delay(100)
    return {
      schema,
      recordId: schema + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      ...input,
      createdAt: new Date().toISOString()
    }
  },

  formUpdate: async (schema, input) => {
    await delay(90)
    return {
      schema,
      recordId: input.recordId || input.id,
      ...input,
      updatedAt: new Date().toISOString()
    }
  },

  formDelete: async (schema, input) => {
    await delay(70)
    return {
      schema,
      recordId: input.recordId || input.id,
      deleted: true,
      deletedAt: new Date().toISOString()
    }
  }
}

export function getFormHandler(actionType) {
  return formController[actionType] || null
}