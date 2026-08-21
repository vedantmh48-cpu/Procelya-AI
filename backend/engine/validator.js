// Workflow validation engine.
// Validates DAG structure, unique step IDs, no circular dependencies,
// and that referenced schemas/functions/operations exist in project context.

export function validateWorkflow(workflow, projectContext = null) {
  const errors = []
  const warnings = []

  if (!workflow.workflowName) errors.push('workflowName is required')
  if (!workflow.projectName) errors.push('projectName is required')

  const steps = workflow.steps || []
  if (!steps.length) {
    errors.push('Workflow must contain at least one step')
    return { valid: false, errors, warnings }
  }

  // 1. Unique step IDs
  const ids = steps.map(s => s.stepId)
  const seen = new Set()
  for (const id of ids) {
    if (seen.has(id)) errors.push(`Duplicate stepId: ${id}`)
    seen.add(id)
  }

  // 2. Order uniqueness
  const orders = steps.map(s => s.order)
  const orderSet = new Set(orders)
  if (orderSet.size !== orders.length) errors.push('Step order values must be unique')

  // 3. Circular dependency detection (via onSuccess / onFailure.redirect)
  const graph = {}
  steps.forEach(s => {
    graph[s.stepId] = []
    if (s.onSuccess && s.onSuccess !== s.stepId) graph[s.stepId].push(s.onSuccess)
    if (s.onFailure?.action === 'redirect' && s.onFailure.targetStepId) {
      graph[s.stepId].push(s.onFailure.targetStepId)
    }
  })

  const WHITE = 0, GRAY = 1, BLACK = 2
  const color = {}
  steps.forEach(s => { color[s.stepId] = WHITE })

  const hasCycle = (node, path) => {
    color[node] = GRAY
    path.push(node)
    for (const next of graph[node] || []) {
      if (color[next] === GRAY) {
        const cycleStart = path.indexOf(next)
        const cycle = path.slice(cycleStart).concat(next)
        errors.push(`Circular dependency detected: ${cycle.join(' -> ')}`)
        return true
      }
      if (color[next] === WHITE && hasCycle(next, path)) return true
    }
    path.pop()
    color[node] = BLACK
    return false
  }

  steps.forEach(s => {
    if (color[s.stepId] === WHITE) hasCycle(s.stepId, [])
  })

  // 4. Validate referenced schemas/functions/operations against project context
  if (projectContext) {
    const validSchemas = new Set(projectContext.schemas || [])
    const validFunctions = new Set(projectContext.functions || [])
    const validOperations = new Set(projectContext.operations || [])

    steps.forEach(s => {
      if (s.actionType === 'formCreate' || s.actionType === 'formUpdate' || s.actionType === 'formDelete') {
        if (s.schema && !validSchemas.has(s.schema)) {
          warnings.push(`Step ${s.stepId}: schema "${s.schema}" not found in project context`)
        }
      }
      if (s.actionType === 'function') {
        if (s.functionName && !validFunctions.has(s.functionName)) {
          warnings.push(`Step ${s.stepId}: function "${s.functionName}" not found in project context`)
        }
      }
      if (s.actionType === 'operation') {
        if (s.functionName && !validOperations.has(s.functionName)) {
          warnings.push(`Step ${s.stepId}: operation "${s.functionName}" not found in project context`)
        }
      }
    })
  }

  // 5. Validate onSuccess / onFailure targets exist
  steps.forEach(s => {
    if (s.onSuccess && !seen.has(s.onSuccess)) {
      errors.push(`Step ${s.stepId}: onSuccess target "${s.onSuccess}" does not exist`)
    }
    if (s.onFailure?.action === 'redirect' && s.onFailure.targetStepId && !seen.has(s.onFailure.targetStepId)) {
      errors.push(`Step ${s.stepId}: onFailure redirect target "${s.onFailure.targetStepId}" does not exist`)
    }
  })

  return { valid: errors.length === 0, errors, warnings }
}