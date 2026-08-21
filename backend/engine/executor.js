// Execution engine.
// Resolves dynamic variables, evaluates conditions, dispatches to safe registries,
// persists state to MongoDB, and emits real-time SSE events.

import WorkflowRun from '../models/WorkflowRun.js'
import { getFunction } from './functionRegistry.js'
import { getOperation } from './operationRegistry.js'
import { getFormHandler } from './formController.js'

// In-memory SSE client store keyed by runId
const sseClients = new Map()

export function subscribeToRun(runId, res) {
  if (!sseClients.has(runId)) sseClients.set(runId, new Set())
  sseClients.get(runId).add(res)
  res.on('close', () => {
    sseClients.get(runId)?.delete(res)
    if (sseClients.get(runId)?.size === 0) sseClients.delete(runId)
  })
}

function emit(runId, event, data) {
  const clients = sseClients.get(runId)
  if (!clients) return
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  clients.forEach(res => {
    try { res.write(payload) } catch {}
  })
}

// Resolve {{trigger.field}} or {{step-xxx.field}} expressions
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

// Evaluate condition operators
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

// Dispatch a step to the appropriate safe handler
async function dispatchStep(step, input) {
  switch (step.actionType) {
    case 'function': {
      const handler = getFunction(step.functionName)
      if (!handler) throw new Error(`Unknown function: ${step.functionName}`)
      return handler(input)
    }
    case 'operation': {
      const handler = getOperation(step.functionName)
      if (!handler) throw new Error(`Unknown operation: ${step.functionName}`)
      return handler(input)
    }
    case 'formCreate':
    case 'formUpdate':
    case 'formDelete': {
      const handler = getFormHandler(step.actionType)
      if (!handler) throw new Error(`Unknown form action: ${step.actionType}`)
      return handler(step.schema, input)
    }
    default:
      throw new Error(`Unsupported actionType: ${step.actionType}`)
  }
}

export async function executeWorkflow(workflow, runId, triggerPayload) {
  const run = await WorkflowRun.findById(runId)
  if (!run) throw new Error('Run not found')

  run.status = 'RUNNING'
  run.startedAt = new Date()
  await run.save()

  const context = { trigger: triggerPayload }
  const steps = [...workflow.steps].sort((a, b) => a.order - b.order)
  const totalStart = Date.now()

  for (const step of steps) {
    const stepStart = Date.now()
    emit(runId, 'STEP_STARTED', { runId, stepId: step.stepId, name: step.name })

    // Evaluate condition
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
      await run.save()
      emit(runId, 'STEP_COMPLETED', { runId, stepId: step.stepId, status: 'SKIPPED', input: result.input, output: result.output, duration: result.duration })
      continue
    }

    // Resolve input mapping
    const input = resolveInputMapping(step.inputMapping, context)

    try {
      const output = await dispatchStep(step, input)
      const result = {
        stepId: step.stepId,
        status: 'SUCCESS',
        input,
        output,
        error: null,
        duration: Date.now() - stepStart
      }
      run.stepResults.push(result)
      await run.save()
      context[step.stepId] = output
      emit(runId, 'STEP_COMPLETED', { runId, stepId: step.stepId, status: 'SUCCESS', input, output, duration: result.duration })
    } catch (err) {
      const result = {
        stepId: step.stepId,
        status: 'FAILED',
        input,
        output: {},
        error: err.message,
        duration: Date.now() - stepStart
      }
      run.stepResults.push(result)
      await run.save()
      emit(runId, 'STEP_COMPLETED', { runId, stepId: step.stepId, status: 'FAILED', input, output: {}, error: err.message, duration: result.duration })

      // Handle failure
      const failure = step.onFailure || { action: 'abort' }
      if (failure.action === 'abort') {
        run.status = 'FAILED'
        run.completedAt = new Date()
        run.totalDuration = Date.now() - totalStart
        await run.save()
        emit(runId, 'WORKFLOW_COMPLETED', { runId, status: 'FAILED', totalDuration: run.totalDuration })
        return run
      }
      if (failure.action === 'skip') {
        continue
      }
      if (failure.action === 'redirect' && failure.targetStepId) {
        const target = steps.find(s => s.stepId === failure.targetStepId)
        if (target) {
          const idx = steps.indexOf(target)
          // Continue from target step (will be processed in next loop iteration)
          // Mark intermediate steps as skipped
          for (let i = idx; i < steps.length; i++) {
            if (steps[i].stepId === target.stepId) break
          }
        }
      }
    }
  }

  run.status = 'COMPLETED'
  run.completedAt = new Date()
  run.totalDuration = Date.now() - totalStart
  await run.save()
  emit(runId, 'WORKFLOW_COMPLETED', { runId, status: 'COMPLETED', totalDuration: run.totalDuration })
  return run
}