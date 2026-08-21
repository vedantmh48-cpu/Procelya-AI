import { Router } from 'express'
import Workflow from '../models/Workflow.js'
import WorkflowRun from '../models/WorkflowRun.js'
import ProjectContext from '../models/ProjectContext.js'
import { detectWorkflow } from '../services/aiService.js'
import { generateEditPreview } from '../services/aiEditService.js'
import { validateWorkflow } from '../engine/validator.js'
import { executeWorkflow, subscribeToRun } from '../engine/executor.js'
import { listFunctions } from '../engine/functionRegistry.js'
import { listOperations } from '../engine/operationRegistry.js'

const router = Router()

// GET /health
router.get('/health', (req, res) => {
  res.json({ backend: true, database: true, realtime: true })
})

// POST /api/workflow/detect
router.post('/detect', async (req, res) => {
  try {
    const { description, projectName = 'sample-flow' } = req.body
    if (!description) return res.status(400).json({ error: 'description is required' })

    const projectContext = await ProjectContext.findOne({ projectName })
    if (!projectContext) {
      return res.status(404).json({ error: `Project context not found for project: ${projectName}` })
    }

    const detected = await detectWorkflow(description, projectContext)
    const validation = validateWorkflow({ ...detected, projectName }, projectContext)

    res.json({
      workflow: detected,
      projectContext: {
        schemas: projectContext.schemas,
        functions: projectContext.functions,
        operations: projectContext.operations
      },
      validation,
      warnings: validation.warnings
    })
  } catch (err) {
    console.error('Detect error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/workflow/create
router.post('/create', async (req, res) => {
  try {
    const { projectName, workflowName, description, triggerEvent, steps } = req.body
    if (!projectName || !workflowName) {
      return res.status(400).json({ error: 'projectName and workflowName are required' })
    }

    const workflow = await Workflow.create({
      projectName,
      workflowName,
      description,
      triggerEvent,
      steps: steps || [],
      status: 'draft',
      version: 1,
      isActive: false,
      isDeleted: false
    })

    res.status(201).json(workflow)
  } catch (err) {
    console.error('Create error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workflow/list
router.get('/list', async (req, res) => {
  try {
    const workflows = await Workflow.find({ isDeleted: false })
      .sort({ updatedAt: -1 })
      .lean()
    res.json(workflows)
  } catch (err) {
    console.error('List error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workflow/functions
router.get('/functions', (req, res) => {
  res.json({ functions: listFunctions(), operations: listOperations() })
})

// GET /api/workflow/notifications
router.get('/notifications', async (req, res) => {
  try {
    // In a real implementation, notifications would come from the DB.
    // For now, return a generated set of admin notifications for demo purposes.
    const runs = await WorkflowRun.find().sort({ createdAt: -1 }).limit(10).lean()
    const notifications = []
    const now = Date.now()

    runs.forEach((run, i) => {
      if (run.status === 'COMPLETED') {
        notifications.push({
          id: 'backend-notif-' + run._id,
          type: 'success',
          title: 'Workflow Completed',
          message: `${run.workflowId || 'Workflow'} executed successfully in ${run.totalDuration || 0}ms`,
          time: (run.completedAt || new Date(now - i * 3600000)).toISOString(),
          read: false
        })
      }
    })

    notifications.push({
      id: 'backend-notif-order',
      type: 'order',
      title: 'Order Confirmed',
      message: 'Payment received for order. Stock checked and inventory updated. Admin notified.',
      time: new Date(now - 25 * 60000).toISOString(),
      read: false,
      tag: 'admin'
    })

    res.json(notifications)
  } catch (err) {
    console.error('Notifications error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workflow/projects
router.get('/projects', async (req, res) => {
  try {
    const contexts = await ProjectContext.find().lean()
    const workflows = await Workflow.find({ isDeleted: false }).lean()
    const projects = contexts.map(ctx => ({
      _id: ctx._id,
      name: ctx.projectName,
      desc: `Project with ${ctx.schemas.length} schemas, ${ctx.functions.length} functions, ${ctx.operations.length} operations`,
      workflows: workflows.filter(w => w.projectName === ctx.projectName).length,
      schemas: ctx.schemas,
      functions: ctx.functions,
      operations: ctx.operations,
      updated: ctx.updatedAt
    }))
    res.json(projects)
  } catch (err) {
    console.error('Projects error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workflow/runs (list all runs)
router.get('/runs', async (req, res) => {
  try {
    const runs = await WorkflowRun.find().sort({ createdAt: -1 }).limit(50).lean()
    res.json(runs)
  } catch (err) {
    console.error('Runs list error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workflow/runs/:id
router.get('/runs/:id', async (req, res) => {
  try {
    const run = await WorkflowRun.findById(req.params.id).lean()
    if (!run) return res.status(404).json({ error: 'Run not found' })
    res.json(run)
  } catch (err) {
    console.error('Run fetch error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workflow/:id
router.get('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id).lean()
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' })
    res.json(workflow)
  } catch (err) {
    console.error('Get error:', err)
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/workflow/:id/draft
router.patch('/:id/draft', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' })
    if (workflow.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft workflows can be edited' })
    }

    const { steps, triggerEvent, description, workflowName } = req.body
    if (steps) workflow.steps = steps
    if (triggerEvent) workflow.triggerEvent = triggerEvent
    if (description !== undefined) workflow.description = description
    if (workflowName) workflow.workflowName = workflowName

    await workflow.save()
    res.json(workflow)
  } catch (err) {
    console.error('Draft update error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/workflow/:id/publish
router.post('/:id/publish', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' })

    const projectContext = await ProjectContext.findOne({ projectName: workflow.projectName })
    const validation = validateWorkflow(workflow.toObject(), projectContext)
    if (!validation.valid) {
      return res.status(400).json({ error: 'Workflow validation failed', validation })
    }

    // Archive any existing active version
    await Workflow.updateMany(
      { projectName: workflow.projectName, workflowName: workflow.workflowName, isActive: true },
      { $set: { isActive: false, status: 'archived' } }
    )

    workflow.status = 'published'
    workflow.isActive = true
    workflow.publishedAt = new Date()
    workflow.version = (workflow.version || 1) + 1
    await workflow.save()

    res.json(workflow)
  } catch (err) {
    console.error('Publish error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workflow/:id/versions
router.get('/:id/versions', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id).lean()
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' })

    const versions = await Workflow.find({
      projectName: workflow.projectName,
      workflowName: workflow.workflowName
    }).sort({ version: -1 }).lean()

    res.json(versions)
  } catch (err) {
    console.error('Versions error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/workflow/:id/validate
router.post('/:id/validate', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id).lean()
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' })

    const projectContext = await ProjectContext.findOne({ projectName: workflow.projectName })
    const validation = validateWorkflow(workflow, projectContext)
    res.json(validation)
  } catch (err) {
    console.error('Validate error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/workflow/:id/ai-edit
router.post('/:id/ai-edit', async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ error: 'prompt is required' })

    const workflow = await Workflow.findById(req.params.id).lean()
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' })

    const preview = generateEditPreview(workflow, prompt)
    res.json(preview)
  } catch (err) {
    console.error('AI edit error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/workflow/trigger/:id
router.post('/trigger/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' })
    if (!workflow.isActive) {
      return res.status(400).json({ error: 'Workflow is not active. Publish it first.' })
    }

    const triggerPayload = req.body || {}
    const run = await WorkflowRun.create({
      workflowId: workflow._id,
      workflowVersion: workflow.version,
      triggerPayload,
      status: 'PENDING',
      stepResults: []
    })

    // Execute asynchronously
    executeWorkflow(workflow, run._id.toString(), triggerPayload).catch(err => {
      console.error('Execution error:', err)
    })

    res.status(201).json({ runId: run._id.toString(), status: 'PENDING' })
  } catch (err) {
    console.error('Trigger error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workflow/events/:runId (SSE)
router.get('/events/:runId', (req, res) => {
  const { runId } = req.params
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Send initial connection event
  res.write(`event: CONNECTED\ndata: ${JSON.stringify({ runId })}\n\n`)

  subscribeToRun(runId, res)

  // Keep alive
  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n')
  }, 15000)

  req.on('close', () => {
    clearInterval(keepAlive)
  })
})

export default router
