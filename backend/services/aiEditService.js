// AI edit service.
// Accepts a prompt, analyzes the current workflow, and returns a structured patch preview.
// Does NOT publish directly - returns a diff for user approval.

export function generateEditPreview(workflow, prompt) {
  const text = prompt.toLowerCase()
  const steps = [...(workflow.steps || [])]
  const changes = []

  // Helper to add a step
  const addStep = (step) => {
    const order = steps.length + 1
    const newStep = {
      stepId: 'step-' + String(order).padStart(3, '0'),
      name: step.name,
      order,
      actionType: step.actionType,
      functionName: step.functionName,
      schema: step.schema,
      inputMapping: step.inputMapping || {},
      condition: step.condition,
      onSuccess: step.onSuccess || null,
      onFailure: step.onFailure || { action: 'abort', targetStepId: null }
    }
    steps.push(newStep)
    changes.push({ type: 'added', step: newStep })
  }

  // Add a notification step
  if (text.includes('notify') || text.includes('notification') || text.includes('alert')) {
    addStep({
      name: 'Notify Team',
      actionType: 'function',
      functionName: 'NotifyTeam',
      inputMapping: { message: 'Workflow notification' }
    })
  }

  // Add a record creation step
  if (text.includes('create') || text.includes('add') || text.includes('record')) {
    addStep({
      name: 'Create Record',
      actionType: 'formCreate',
      schema: 'orders',
      inputMapping: { data: '{{trigger}}' }
    })
  }

  // Add a condition to a step
  if (text.includes('condition') || text.includes('if ')) {
    const target = steps.find(s => s.actionType === 'operation')
    if (target) {
      changes.push({
        type: 'modified',
        stepId: target.stepId,
        field: 'condition',
        before: target.condition || null,
        after: { field: '{{trigger.status}}', operator: '==', value: 'active' }
      })
      target.condition = { field: '{{trigger.status}}', operator: '==', value: 'active' }
    }
  }

  // Remove a step
  if (text.includes('remove') || text.includes('delete') || text.includes('drop')) {
    const target = steps[steps.length - 1]
    if (target) {
      changes.push({ type: 'removed', stepId: target.stepId, name: target.name })
      steps.pop()
    }
  }

  // Rename workflow
  if (text.includes('rename')) {
    const match = prompt.match(/rename.*?to\s+["']?([\w\s-]+)["']?/i)
    if (match) {
      changes.push({
        type: 'modified',
        field: 'workflowName',
        before: workflow.workflowName,
        after: match[1].trim()
      })
    }
  }

  // If no changes detected, add a generic note
  if (changes.length === 0) {
    changes.push({
      type: 'info',
      message: 'No actionable changes detected from your prompt. Try describing a specific modification.'
    })
  }

  return {
    workflowId: workflow._id || workflow.id,
    prompt,
    changes,
    preview: { ...workflow, steps }
  }
}