// Frontend API client for the Procelya backend.
// Automatically falls back to the in-browser demo backend when the real backend is unreachable.

import { demoApi } from './demoBackend'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

let backendAvailable = null
let checking = false

async function checkBackend() {
  if (backendAvailable !== null) return backendAvailable
  if (checking) return true
  checking = true
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal })
    clearTimeout(timeout)
    backendAvailable = res.ok
  } catch {
    backendAvailable = false
  }
  checking = false
  return backendAvailable
}

async function request(path, options = {}) {
  const available = await checkBackend()
  if (!available) {
    // Route to demo backend
    const method = (options.method || 'GET').toUpperCase()
    const body = options.body ? JSON.parse(options.body) : undefined

    if (path === '/health') return demoApi.health()
    if (path === '/api/workflow/detect' && method === 'POST') return demoApi.detect(body.description)
    if (path === '/api/workflow/create' && method === 'POST') return demoApi.createWorkflow(body)
    if (path === '/api/workflow/list') return demoApi.listWorkflows()
    if (path === '/api/workflow/functions') return demoApi.listFunctions()
    if (path === '/api/workflow/projects') return demoApi.listProjects()
    if (path === '/api/workflow/runs') return demoApi.listRuns()
    if (path === '/api/workflow/notifications') return demoApi.getNotifications()

    const runMatch = path.match(/^\/api\/workflow\/runs\/(.+)$/)
    if (runMatch && method === 'GET') return demoApi.getRun(runMatch[1])

    const wfMatch = path.match(/^\/api\/workflow\/([^/]+)$/)
    if (wfMatch && method === 'GET') return demoApi.getWorkflow(wfMatch[1])

    const draftMatch = path.match(/^\/api\/workflow\/([^/]+)\/draft$/)
    if (draftMatch && method === 'PATCH') return demoApi.updateDraft(draftMatch[1], body)

    const publishMatch = path.match(/^\/api\/workflow\/([^/]+)\/publish$/)
    if (publishMatch && method === 'POST') return demoApi.publishWorkflow(publishMatch[1])

    const versionsMatch = path.match(/^\/api\/workflow\/([^/]+)\/versions$/)
    if (versionsMatch && method === 'GET') return demoApi.getVersions(versionsMatch[1])

    const validateMatch = path.match(/^\/api\/workflow\/([^/]+)\/validate$/)
    if (validateMatch && method === 'POST') return demoApi.validateWorkflow(validateMatch[1])

    const aiEditMatch = path.match(/^\/api\/workflow\/([^/]+)\/ai-edit$/)
    if (aiEditMatch && method === 'POST') return demoApi.aiEdit(aiEditMatch[1], body.prompt)

    const triggerMatch = path.match(/^\/api\/workflow\/trigger\/([^/]+)$/)
    if (triggerMatch && method === 'POST') return demoApi.triggerWorkflow(triggerMatch[1], body)

    throw new Error(`Demo backend: unsupported request ${method} ${path}`)
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Health
  health: () => request('/health'),

  // Workflow detection
  detect: (description, projectName = 'sample-flow') =>
    request('/api/workflow/detect', {
      method: 'POST',
      body: JSON.stringify({ description, projectName })
    }),

  // Workflow CRUD
  createWorkflow: (data) =>
    request('/api/workflow/create', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  listWorkflows: () => request('/api/workflow/list'),

  getWorkflow: (id) => request(`/api/workflow/${id}`),

  updateDraft: (id, data) =>
    request(`/api/workflow/${id}/draft`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  publishWorkflow: (id) =>
    request(`/api/workflow/${id}/publish`, { method: 'POST' }),

  getVersions: (id) => request(`/api/workflow/${id}/versions`),

  validateWorkflow: (id) =>
    request(`/api/workflow/${id}/validate`, { method: 'POST' }),

  aiEdit: (id, prompt) =>
    request(`/api/workflow/${id}/ai-edit`, {
      method: 'POST',
      body: JSON.stringify({ prompt })
    }),

  // Execution
  triggerWorkflow: (id, payload) =>
    request(`/api/workflow/trigger/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getRun: (id) => request(`/api/workflow/runs/${id}`),

  listRuns: () => request('/api/workflow/runs'),

  listFunctions: () => request('/api/workflow/functions'),

  listProjects: () => request('/api/workflow/projects'),

  getNotifications: () => request('/api/workflow/notifications'),

  // SSE stream
  streamEvents: (runId, handlers) => {
    // If backend is unavailable, use demo polling
    if (backendAvailable === false) {
      return demoApi.streamEvents(runId, handlers)
    }
    const es = new EventSource(`${BASE_URL}/api/workflow/events/${runId}`)
    es.onmessage = (e) => handlers.onMessage?.(JSON.parse(e.data))
    es.addEventListener('STEP_STARTED', (e) => handlers.onStepStarted?.(JSON.parse(e.data)))
    es.addEventListener('STEP_COMPLETED', (e) => handlers.onStepCompleted?.(JSON.parse(e.data)))
    es.addEventListener('WORKFLOW_COMPLETED', (e) => handlers.onWorkflowCompleted?.(JSON.parse(e.data)))
    es.addEventListener('CONNECTED', (e) => handlers.onConnected?.(JSON.parse(e.data)))
    es.onerror = () => handlers.onError?.()
    return es
  }
}

export default api