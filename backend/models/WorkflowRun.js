import mongoose from 'mongoose'

const stepResultSchema = new mongoose.Schema({
  stepId: { type: String, required: true },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'SKIPPED'], default: 'SUCCESS' },
  input: { type: mongoose.Schema.Types.Mixed, default: {} },
  output: { type: mongoose.Schema.Types.Mixed, default: {} },
  error: { type: String },
  duration: { type: Number, default: 0 }
}, { _id: false })

const workflowRunSchema = new mongoose.Schema({
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  workflowVersion: { type: Number, default: 1 },
  triggerPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  stepResults: { type: [stepResultSchema], default: [] },
  totalDuration: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('WorkflowRun', workflowRunSchema)